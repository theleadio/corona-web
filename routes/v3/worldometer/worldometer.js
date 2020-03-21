const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../../system/database');
const cache = require('../../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../../services/customStats');
const { getStatsWithCountryDetail } = require('../../../services/statsService');
const { cacheCheck } = require('../../../services/cacheMiddleware');

 /**
 * @api {get} /v3/stats/bno
 * @apiName worldometer
 * @apiGroup Worldometer stats
 * @apiVersion 2.0.0
 * @apiDescription Returns worldometer stats
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
router.get('/worldometer', cacheCheck, asyncHandler(async function(req, res, next) {
  try {
    const result = await getWorldometer();
    return res.json(result);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

async function getWorldometer() {
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
  //const result = await conn.query(query);
  return result[0];
}

module.exports = router;
