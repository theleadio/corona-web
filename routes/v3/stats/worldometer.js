const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../../system/database');
const cache = require('../../../system/redis-cache');
const { cacheCheck } = require('../../../services/cacheMiddleware');

 /**
 * @api {get} /v3/stats/worldometer/country Country-specific stats
 * @apiName worldometer
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiDescription Returns country-specific stats based on worldometer data.
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
router.get('/country', cacheCheck, asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/country');
  try {
    const result = await getCountryStats();
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/country] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/global Global stats
 * @apiName stats_overview
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


async function getCountryStats() {
  const conn = db.conn.promise();
  let query = `SELECT ac.country_code as countryCode,
  tt.country,
  tt.total_cases AS totalConfirmed,
  tt.total_deaths as totalDeaths,
  tt.total_recovered as totalRecovered,
  tt.new_cases AS dailyConfirmed,
  tt.new_deaths AS dailyDeaths,
  tt.active_cases as activeCases,
  tt.serious_critical_cases AS totalCritical,
  CAST(tt.total_cases_per_million_pop AS UNSIGNED) AS totalConfirmedPerMillionPopulation,
  (tt.total_deaths / tt.total_cases * 100) AS FR,
  (tt.total_recovered / tt.total_cases * 100) AS PR,
  tt.last_updated as lastUpdated
        FROM worldometers tt INNER JOIN (
            SELECT country,
            max(last_updated) AS MaxDateTime
            FROM worldometers tt
            where country not in ("Sint Maarten","Congo")
           GROUP BY country) groupedtt
      ON tt.country = groupedtt.country
       AND tt.last_updated = groupedtt.MaxDateTime
      left JOIN (Select country_name, country_code, country_alias from apps_countries) AS ac on tt.country = ac.country_alias
      group by tt.country
      order by tt.total_cases DESC`;
  let result = await conn.query(query);
  return result[0];
}

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
MAX(last_updated) as created
FROM worldometers_total_sum
LIMIT 1
`;

  let result = await conn.query(query);
  return result[0][0];
}

module.exports = router;
