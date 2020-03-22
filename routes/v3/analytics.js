const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../../system/database')
const cache = require('../../system/redis-cache')
const router = express.Router()
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /v3/analytics/trend By date
 * @apiName FetchAnalyticsTrendByDate
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 *
 * @apiParam {String} start_date Start date in YYYY-MM-DD format
 * @apiParam {String} end_date End date in YYYY-MM-DD format
 */
router.get('/trend', cache.route(), asyncHandler(async function(req, res, next) {
  const start_date = req.query.start_date
  const end_date = req.query.end_date

  // enforce date format
  if (
    moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != start_date ||
    moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != end_date
  ) {
    res.json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // make sure end_date isn't less than start_date
  if (moment(end_date).isBefore(start_date)) {
    res.json('Invalid date')
  }

  try {
    const results = await fetchTrendByDate(start_date, end_date)
    
    return res.json(results)
  } catch (error) {
    console.log('[/analytics/trend] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /v3/analytics/daily By area
 * @apiName fetchTopCountryWithDailyNewCases
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 * 
 * @apiParam {Number} [limit=10] limit the number of results
 */
router.get('/daily', cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 10

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      res.json('Invalid data type. Limit should be an integer.')
    }
  }

  try {
    const results = await fetchTopCountryWithDailyNewCases(limit)

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/daily] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /v3/analytics/country By country
 * @apiName FetchAffectedCountries
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 * 
 * @apiParam {Number} [limit=200] limit the number of results
 */
router.get('/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 200
  let date = null

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      return res.json('Invalid data type. Limit should be an integer.')
    }
  }

  if (req.query.hasOwnProperty('date')) {
    date = req.query.date

    // enforce date format
    if (moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD') !== date) {
      return res.json('Invalid date format. Date format should be YYYY-MM-DD')
    }
  }

  try {
    const results = await fetchAffectedCountries(limit, date)

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/country] error', error)

    return res.json(error)
  }
}))

async function fetchTopCountryWithDailyNewCases(limit=10) {
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
    WHERE country NOT in ("Sint Maarten", "Congo")	
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

async function fetchAffectedCountries(limit = 999, date = null) {
  const results = await getStatsWithCountryDetail(limit, date);
  console.log(results)
  return results.map(s => {
    return {
      countryCode: s.countryCode,
      countryName: s.countryName,
      lat: s.lat,
      lng: s.lng,
      confirmed: s.totalConfirmed,
      deaths: s.totalDeaths,
      recovered: s.totalRecovered,
      dateAsOf: s.lastUpdated,
    }
  });
}

/**
 * Returns array of object with following keys:
 * - countryCode
 * - countryName
 * - lat
 * - lng
 * - totalConfirmed,
 * - totalDeaths,
 * - totalRecovered
 * - lastUpdated
 * @param limit
 * @returns {Promise<*>}
 */
async function getStatsWithCountryDetail(limit = 999, date = null) {
    limit = parseInt(limit);
  
    const conn = db.conn.promise();
    const args = [];
    
    let dateQuery = '(SELECT MAX(last_updated) FROM worldometers)'
    if (date) {
      const dateFrom = moment(date).format('YYYY-MM-DD')
      const dateTo = moment(date).add(1, 'day').format('YYYY-MM-DD')
      dateQuery = `(SELECT MAX(last_updated) FROM worldometers WHERE last_updated >= ? and last_updated < ?)`
      args.push(dateFrom, dateTo)
    }
    args.push(limit)
  
    const query = `
    SELECT ac.country_code AS countryCode, ac.latitude + 0.0 AS lat, ac.longitude + 0.0 AS lng, tt.country AS countryName, tt.total_cases AS totalConfirmed, tt.total_deaths AS totalDeaths, tt.total_recovered AS totalRecovered, tt.last_updated AS lastUpdated
    FROM worldometers tt
    INNER JOIN
    (
      SELECT country,
      max(last_updated) AS MaxDateTime	
      FROM worldometers tt	
      WHERE country NOT in ("Sint Maarten", "Congo")	
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
    ORDER BY tt.total_cases DESC
    LIMIT ?;`;
    // AND tt.last_updated = ${dateQuery}
    const result = await conn.query(query, args)
    return result[0]
}

module.exports = router
