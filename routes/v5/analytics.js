const express = require('express');
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const db = require('../../system/database');
const cache = require('../../system/redis-cache');
const { getStatsWithCountryDetail } = require('../../services/statsService')
const router = express.Router();

/**
 * @api {get} /v5/analytics/dailyNewStats By new daily cases and deaths
 * @apiName fetchTopCountryWithDailyNewStatsSortByNewCases
 * @apiGroup Analytics
 * @apiVersion 5.0.0
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
 * @api {get} /v5/analytics/trend/country get data of a country between start and end dates
 * @apiName getTrendByCountry
 * @apiGroup Analytics
 * @apiVersion 5.0.0
 *
 * @apiParam {String} [countryCode] Required Country code
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/trend/country', cache.route(), asyncHandler(async function(req, res, next) {
  const { countryCode, startDate, endDate } = req.query;

  // Enforce date format
  if (
    moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== startDate ||
    moment(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== endDate
  ) {
    res.status(400).json('Invalid date format. Date format of startDate and endDate should be YYYY-MM-DD');
  }

  // Make sure endDate is after startDate
  if (moment(endDate).isBefore(startDate)) {
    res.status(400).json('Invalid date');
  }

  try {
    const results = await fetchTrendByCountryAndDate(countryCode, startDate, endDate);
    return res.json(results);
  } catch (error) {
    console.log('[/v5/analytics/trend/country] error', error);

    return res.json(error);
  }
}))

/**
 * @api {get} /v5/analytics/newcases/country get daily new incidences of a country between start and end dates
 * @apiName getNewCasesByCountry
 * @apiGroup Analytics
 * @apiVersion 5.0.0
 *
 * @apiParam {String} [countryCode] Required Country code
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/newcases/country', cache.route(), asyncHandler(async function(req, res, next) {
  const { countryCode, startDate, endDate } = req.query;

  // Enforce date format
  if (
    moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== startDate ||
    moment(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== endDate
  ) {
    res.status(400).json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // Make sure endDate is after startDate
  if (moment(endDate).isBefore(startDate)) {
    res.status(400).json('Invalid date')
  }

  try {
    const results = await fetchNewCasesByCountryAndDate(countryCode, startDate, endDate)
    return res.json(results)
  } catch (error) {
    console.log('[/v5/analytics/newcases/country] error:', error)

    return res.json(error)
  }
}));

/**
 * @api {get} /v5/analytics/country By country
 * @apiName FetchAffectedCountries
 * @apiGroup Analytics
 * @apiVersion 5.0.0
 *
 * @apiParam {Number} [limit=200] limit the number of results
 */
router.get('/country', cache.route(), asyncHandler(async function(req, res, next) {
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

async function fetchTopCountryWithDailyNewStatsSortByNewCases(limit = 10) {
  const conn = db.conn.promise()


  let query = `
  SELECT 
    MAX(ac.country_code),
    MAX(ac.latitude + 0.0) AS lat,
    MAX(ac.longitude + 0.0) AS lng,
    tt.country,
    MAX(tt.new_cases) AS daily_cases,
    MAX(tt.new_deaths) AS daily_deaths,
    MAX(tt.last_updated) AS last_updated
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

  const args = [limit]
  const result = await conn.query(query, args)
  return result[0]
}

async function fetchTrendByCountryAndDate(countryCode, startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('Invalid start date or end date.');
  }

  const conn = db.conn.promise()
  let args = [startDate, endDate]

  if (!countryCode) {
    throw new Error('v5/analytics/fetchTrendByCountryAndDate - req.query.countryCode is invalid or null');
  } else {
    args.push(countryCode);
  }

  const query = `
SELECT ac.country_code,
tt.country,
MAX(tt.total_cases) AS total_confirmed,
MAX(tt.total_deaths) AS total_deaths,
MAX(tt.total_recovered) AS total_recovered,
date(tt.last_updated) AS last_updated
FROM worldometers tt
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
AND ac.country_code = ?
GROUP BY date(tt.last_updated), tt.country
ORDER BY date(tt.last_updated) ASC;`
  let result = await conn.query(query, args)
  return result[0]
}

async function fetchNewCasesByCountryAndDate(countryCode, startDate, endDate) {
  const result = await fetchTrendByCountryAndDate(countryCode, startDate, endDate);

  // From
  // country: "Malaysia"
  // country_code: "MY"
  // last_updated: "2020-05-11T00:00:09.000Z"
  // total_confirmed: 6726
  // total_deaths: 109
  // total_recovered: 5113

  // To
  // country: "Malaysia"
  // country_code: "MY"
  // last_updated: "2020-03-26T00:00:00.000Z"
  // new_deaths: 4
  // new_infections: 235
  // new_recovered: 16

  const newCasesResult = [];

  for (let i = 1; i < result.length; i++) {
    const yesterdayData = result[i - 1];
    const todayData = result[i];

    newCasesResult.push({
      country: todayData.country,
      country_code: todayData.country_code,
      last_updated: todayData.last_updated,
      new_deaths: todayData.total_deaths - yesterdayData.total_deaths,
      new_infections: todayData.total_confirmed - yesterdayData.total_confirmed,
      new_recovered: todayData.total_recovered - yesterdayData.total_recovered,
    });
  }

  return newCasesResult;
}

async function fetchAffectedCountries(limit = 999, date = null) {
  const results = await getStatsWithCountryDetail(limit, date);
  return results.map(s => {
    return {
      countryCode: s.countryCode,
      countryName: s.countryName,
      lat: s.lat,
      lng: s.lng,
      confirmed: s.confirmed,
      deaths: s.deaths,
      recovered: s.recovered,
      dateAsOf: s.created,
    }
  });
}

module.exports = router
