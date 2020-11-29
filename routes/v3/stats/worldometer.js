const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const moment = require('moment');
const db = require('../../../system/database');
const cache = require('../../../system/redis-cache');
const { getCountryStats } = require('../../../services/statsService');
const { fetchDataFromGoogleSheet } = require('../../../services/customStats');
const { cacheCheck } = require('../../../services/cacheMiddleware');

 /**
 * @api {get} /v3/stats/worldometer/country all country or country-specific stats
 * @apiName worldometer
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiParam {String} [countryCode] Optional countryCode to retrieve the stats for
 * @apiDescription Returns all country data or country-specific stats based on worldometer data.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "CN",
    "country": "China",
    "lat": 35.86166,
    "lng": 104.195397,
    "totalConfirmed": 81470,
    "totalDeaths": 3304,
    "totalRecovered": 75700,
    "dailyConfirmed": 31,
    "dailyDeaths": 4,
    "activeCases": 2466,
    "totalCritical": 633,
    "totalConfirmedPerMillionPopulation": 57,
    "totalDeathsPerMillionPopulation": 2,
    "FR": "4.0555",
    "PR": "92.9176",
    "lastUpdated": "2020-03-30T21:00:13.000Z"
  }
]
 */
router.get('/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/country');
  let countryCode = null
  if (req.query.hasOwnProperty('countryCode')) {
    countryCode = req.query.countryCode;
  }

  let date = null
  if (req.query.hasOwnProperty('date')) {
    date = req.query.date

    // enforce date format
    if (moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD') !== date) {
      return res.json('Invalid date format. Date format should be YYYY-MM-DD')
    }
  }

  const sort = req.query.sort;
  const limit = parseInt(req.query.limit) || 999;

  try {
    const result = await getCountryStats(sort, limit, countryCode, date);
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/country] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/global Global Stats Overview
 * @apiName globalStatsOverview
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiDescription Returns global stats based on worldometer data, used in home and analytics page
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "totalConfirmed": 276113,
  "totalDeaths": 11402,
  "totalRecovered": 91952,
  "totalNewCases": 562,
  "totalNewDeaths": 23,
  "totalActiveCases": 172759,
  "totalCasesPerMillionPop": 35,
  "created": "2020-03-21T13:00:13.000Z"
}
 */
router.get('/global', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
  // console.log('calling /v3/stats/worldometer/global');
  try {
    const results = await getGlobalStats();
    return res.json(results);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/global] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/topCountry Top N countries
 * @apiName worldometer
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiParam {Integer} [limit] Limit to top N countries to return
 * @apiDescription Returns N country data or country-specific stats based on worldometer data.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "US",
    "country": "USA",
    "lat": 37.09024,
    "lng": -95.712891,
    "totalConfirmed": 159689,
    "totalDeaths": 2951,
    "totalRecovered": 5220,
    "dailyConfirmed": 16198,
    "dailyDeaths": 368,
    "activeCases": 151518,
    "totalCritical": 3402,
    "totalConfirmedPerMillionPopulation": 482,
    "totalDeathsPerMillionPopulation": 9,
    "FR": "1.8480",
    "PR": "3.2689",
    "lastUpdated": "2020-03-30T21:00:11.000Z"
  }
]
 */
router.get('/topCountry', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/topCountry');
  const sort = req.query.sort;
  const limit = parseInt(req.query.limit) || 999;

  try {
    const result = await getCountryStats(sort, limit);
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/topCountry] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/totalTrendingCases
 * @apiName GetTotalTrendingCases
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiParam {Integer} [limit] Limit to top N trending stats
 * @apiDescription Returns total trending cases
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "totalConfirmed": 378560,
    "totalDeaths": 16495,
    "totalRecovered": 101608,
    "lastUpdated": "2020-03-24T00:10:06.000Z"
  },
]
 */
router.get('/totalTrendingCases', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 999

  if (req.query.hasOwnProperty('limit')) {
    limit = req.query.limit;
  }

  try {
    const result = await getTotalTrendingCases(limit);
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/totalTrendingCases] error', error);
    return res.json(error);
  }
}));

async function getGlobalStats() {
  const conn = db.conn.promise();
  let query = `
  SELECT
  total_cases AS totalConfirmed,
  total_deaths as totalDeaths,
  total_recovered as totalRecovered,
  new_cases AS totalNewCases,
  new_deaths AS totalNewDeaths,
  active_cases AS totalActiveCases,
  CAST(total_cases_per_million_pop AS UNSIGNED) AS totalCasesPerMillionPop,
  last_updated as created
  FROM worldometers_total_sum
  WHERE last_updated = (SELECT MAX(last_updated) FROM worldometers_total_sum)
  LIMIT 1;
`;
  let result = await conn.query(query);
  return result[0][0];
}

async function getTotalTrendingCases(limit=999) {
  const conn = db.conn.promise();
  let args = [parseInt(limit)]

  let query = `
  SELECT MAX(total_cases) AS totalConfirmed,
  MAX(total_deaths) as totalDeaths,
  MAX(total_recovered) as totalRecovered,
  date(last_updated) as lastUpdated
  FROM worldometers_total_sum
  GROUP BY date(last_updated)
  ORDER BY date(last_updated) DESC
  LIMIT ?
`;

  let result = await conn.query(query, args);
  return result[0];
}

module.exports = router;
