const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const axios = require('axios');
const cache = require('../system/redis-cache');
const db = require('../system/database');

/**
 * @api {get} /v1/travel-alert List
 * @apiName FetchTravelAlert
 * @apiGroup Travel Alert
 * @apiVersion 1.0.0
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "AG",
    "countryName": "ANTIGUA AND BARBUDA",
    "publishedDate": "2020-03-04T00:00:00.000Z",
    "alertMessage": "1. Visitors and airline crew who have been in China (People's Rep.) in the past 28 days are not allowed to enter Antigua and Barbuda.||2. Nationals and resident diplomats of Antigua and Barbuda who have been in China (People's Rep.) in the past 28 days are allowed to enter Antigua and Barbuda. Airlines must provide their advance passenger information before departure. ||3. Visitors and airline crew who have been in Italy (in cities and towns which have been quarantined by the Government of Italy) are not allowed to enter Antigua and Barbuda.  |-This does not apply to nationals of Antigua and Barbuda and resident diplomats."
  },
]
 */
router.get('/', cache.route({
  expire: {
    '2xx': 300,
    'xxx': 1
  },
}), asyncHandler(async function (req, res, next) {
  try {
    const results = await getTravelAlerts();
    return res.json(results);
  }
  catch (error) {
    console.log('[/travel-ban] error', error);
    return res.json(error);
  }
}));

async function getTravelAlerts() {
  const conn = db.conn.promise();
  let query = `
SELECT
  country_code AS countryCode,
  country_name AS countryName,
  published_date AS publishedDate,
  alert_message AS alertMessage
FROM travel_alert  
ORDER BY
  published_date DESC  
`;

  const args = [];

  let result = await conn.query(query, args);
  return result[0];
}

async function getTravelBanInfosFromGoogleSheet() {
  const results = await axios.get('https://v2-api.sheety.co/3d29e508008ed3f47cc52f6aaf321f51/travelBan/summary');
  return results.data;
}

module.exports = router;
