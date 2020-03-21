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

module.exports = router;
