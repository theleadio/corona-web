const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const axios = require('axios');
const cache = require('../system/redis-cache');
const db = require('../system/database');

/**
 * @api {get} /travel-alert
 * @apiName FetchTravelAlert
 * @apiGroup TravelAlert
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
