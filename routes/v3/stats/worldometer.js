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
    "totalConfirmed": 81008,
    "totalDeaths": 3255,
    "totalRecovered": 71740,
    "dailyConfirmed": 41,
    "dailyDeaths": 7,
    "activeCases": 6013,
    "totalCritical": 1927,
    "totalConfirmedPerMillionPopulation": 56,
    "FR": "4.0181",
    "PR": "88.5592",
    "lastUpdated": "2020-03-21T04:00:12.000Z"
  },
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

  try {
    const result = await getCountryStats(countryCode, date);
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
    "countryCode": "CN",
    "country": "China",
    "lat": 35.86166,
    "lng": 104.195397,
    "totalConfirmed": 81171,
    "totalDeaths": 3277,
    "totalRecovered": 73159,
    "dailyConfirmed": 0,
    "dailyDeaths": 0,
    "activeCases": 4735,
    "totalCritical": 1573,
    "totalConfirmedPerMillionPopulation": 56,
    "FR": "4.0372",
    "PR": "90.1295",
    "lastUpdated": "2020-03-25T08:50:30.000Z"
  }
]
 */
router.get('/topCountry', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/topCountry');
  let limit = 999

  if (req.query.hasOwnProperty('limit')) {
    limit = req.query.limit;
  }

  try {
    const result = await getCountryStats(null, limit);
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
  SELECT MAX(total_cases) AS totalConfirmed, total_deaths as totalDeaths, total_recovered as totalRecovered, last_updated as lastUpdated
  FROM worldometers_total_sum
  GROUP BY date(last_updated)
  ORDER BY last_updated DESC
  LIMIT ?
`;

  let result = await conn.query(query, args);
  return result[0];
}

module.exports = router;
