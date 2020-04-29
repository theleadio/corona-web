const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../../system/database')
const cache = require('../../system/redis-cache')
const { getCustomStats } = require('../../services/customStats');
const router = express.Router()
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /v3/analytics/dailyNewStats By new daily cases and deaths
 * @apiName fetchTopCountryWithDailyNewStatsSortByNewCases
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 *
 * @apiParam {Number} [limit=10] limit the number of results
 */
router.get('/dailyNewStats', cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 10

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      res.json('Invalid data type. Limit should be an integer.')
    }
  }

  try {
    const results = await fetchTopCountryWithDailyNewStatsSortByNewCases(limit)
    return res.json(results)
  } catch (error) {
    console.log('[/analytics/dailyNewStats] error', error)
    return res.json(error)
  }
}))

/**
 * @api {get} /v3/analytics/trend/country get data of a country between start and end dates
 * @apiName getTrendByCountry
 * @apiGroup Analytics
 *
 * @apiParam {String} [countryCode] Required Country code(s)
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/trend/country', cache.route(), asyncHandler(async function(req, res, next) {
  const country_codes = req.query.countryCode
  const start_date = req.query.startDate
  const end_date = req.query.endDate

  // enforce date format
  if (
    moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != start_date ||
    moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != end_date
  ) {
    console.log('startDate:'+start_date);
    console.log('endDate:'+end_date);
    res.status(400).json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // make sure end_date isn't less than start_date
  if (moment(end_date).isBefore(start_date)) {
    res.status(400).json('Invalid date')
  }

  try {
    const results = await fetchTrendByCountryAndDate(country_codes, start_date, end_date)
    return res.json(results)
  } catch (error) {
    console.log('[/analytics/trend/country] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /v3/analytics/newcases/country get data of a country between start and end dates
 * @apiName getTrendByCountry
 * @apiGroup Analytics
 *
 * @apiParam {String} [countryCode] Required Country code(s)
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/newcases/country', cache.route(), asyncHandler(async function(req, res, next) {
  const country_codes = req.query.countryCode
  const start_date = req.query.startDate
  const end_date = req.query.endDate

  // enforce date format
  if (
    moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != start_date ||
    moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != end_date
  ) {
    console.log('startDate:'+start_date);
    console.log('endDate:'+end_date);
    res.status(400).json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // make sure end_date isn't less than start_date
  if (moment(end_date).isBefore(start_date)) {
    res.status(400).json('Invalid date')
  }

  try {
    const results = await fetchNewCasesByCountryAndDate(country_codes, start_date, end_date)
    return res.json(results)
  } catch (error) {
    console.log('[/analytics/newcases/country] error', error)

    return res.json(error)
  }
}))

async function fetchTopCountryWithDailyNewStatsSortByNewCases(limit=10) {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
  SELECT ac.country_code, ac.latitude + 0.0 AS lat, ac.longitude + 0.0 AS lng, tt.country, tt.new_cases AS daily_cases, tt.new_deaths AS daily_deaths, tt.last_updated
  FROM worldometers tt
  INNER JOIN
  (
    SELECT country,
    max(last_updated) AS MaxDateTime
    FROM worldometers tt
    WHERE country NOT in ("Sint Maarten","Congo", "South Korea", "Czechia Republic", "Czech Republic", "Others")
    GROUP BY country
  )
  groupedtt ON tt.country = groupedtt.country
  AND tt.last_updated = groupedtt.MaxDateTime
  LEFT JOIN
  (
    SELECT country_name,
    country_code,
    country_alias,
    latitude,
    longitude
    FROM apps_countries
  )
  AS ac ON tt.country = ac.country_alias
  GROUP BY tt.country
  ORDER BY tt.new_cases DESC
  LIMIT ?`

  args.push(limit)
  let result = await conn.query(query, args)
  return result[0]
}

async function fetchTrendByCountryAndDate(country_codes, start_date, end_date) {
  if (!start_date || !end_date) {
    throw new Error('Invalid start date or end date.');
  }

  const conn = db.conn.promise()
  let args = [start_date, end_date]
  let countryCodeQuery = ""
  let countryCodeQueryParam = []

  if (country_codes) {
    country_codes.split(',').forEach(element => {
      countryCodeQueryParam.push(`?`)
      args.push(element)
    });
    countryCodeQuery = `AND ac.country_code in (` + countryCodeQueryParam.join(',') + `)`
  }

  const query = `
SELECT ac.country_code,
tt.country,
MAX(tt.total_cases) AS total_confirmed,
MAX(tt.total_deaths) AS total_deaths,
MAX(tt.total_recovered) AS total_recovered,
tt.last_updated
FROM worldometers tt
INNER JOIN
(
SELECT country,
last_updated
FROM worldometers tt
where country not in ("Sint Maarten","Congo", "South Korea", "Czechia Republic", "Czech Republic", "Others")
GROUP BY country
)
groupedtt ON tt.country = groupedtt.country
LEFT JOIN
(
SELECT country_name,
country_code,
country_alias
FROM apps_countries
)
AS ac ON tt.country = ac.country_alias
WHERE tt.last_updated >= ?
AND tt.last_updated <= ?
${countryCodeQuery}
GROUP BY date(tt.last_updated), tt.country
ORDER BY tt.last_updated ASC;`
  let result = await conn.query(query, args)
  return result[0]
}


async function fetchNewCasesByCountryAndDate(country_codes, start_date, end_date) {
  if (!start_date || !end_date) {
    throw new Error('Invalid start date or end date.');
  }

  const conn = db.conn.promise()
  let args = [start_date, end_date]
  let countryCodeQuery = ""
  let countryCodeQueryParam = []

  if (country_codes) {
    country_codes.split(',').forEach(element => {
      countryCodeQueryParam.push(`?`)
      args.push(element)
    });
    countryCodeQuery = `AND ac.country_code in (` + countryCodeQueryParam.join(',') + `)`
  }

  const query = `
  SELECT country
  , IFNULL(total_confirmed - LAG(total_confirmed) over w, 0) as new_infections
  , IFNULL(total_deaths - LAG(total_deaths) over w, 0) as new_deaths
  , IFNULL(total_recovered - LAG(total_recovered) over w, 0) as new_recovered
  , last_updated
  FROM
  (
  SELECT 
  tt.country
  , MAX(tt.total_cases) AS total_confirmed
  , MAX(tt.total_deaths) AS total_deaths
  , MAX(tt.total_recovered) AS total_recovered
  , MAX(date(tt.last_updated)) AS last_updated
  FROM worldometers tt
  INNER JOIN
  (
  SELECT country,
  last_updated
  FROM worldometers tt
  where country not in ("Sint Maarten","Congo", "South Korea", "Czechia Republic", "Czech Republic", "Others")
  GROUP BY country
  )
  groupedtt ON tt.country = groupedtt.country
  LEFT JOIN
  (
  SELECT country_name,
  country_code,
  country_alias
  FROM apps_countries
  )
  AS ac ON tt.country = ac.country_alias
  WHERE tt.last_updated >= ?
  AND tt.last_updated <= ?
  ${countryCodeQuery}
  GROUP BY date(tt.last_updated), tt.country
  ORDER BY tt.last_updated ASC
  ) country_trend
  WINDOW w AS (ORDER BY country_trend.last_updated ASC);`
  let result = await conn.query(query, args)
  return result[0]
}

module.exports = router
