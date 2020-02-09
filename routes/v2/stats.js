const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../system/database');
const cache = require('../../system/redis-cache');

/**
 * @api {get} /stats
 * @apiName FetchStats
 * @apiGroup Stats
 *
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
 */
router.get('/', cache.route(), asyncHandler(async function (req, res, next) {
  const { countryCode } = req.query;
  try {
    const results = await getStatsByAggregateData(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /stats/latest
 * @apiName FetchLatestStats
 * @apiGroup Stats
 */
router.get('/latest', cache.route(), asyncHandler(async function (req, res, next) {
  try {
    const results = await getLatestArcgisStats();
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats/latest] error', error);
    return res.json(error);
  }
}));

/**
 * Returns the stats of top X countries with the most number of confirmed cases.
 *
 * @api {get} /stats/top
 * @apiName FetchTopStats
 * @apiGroup Stats
 */
router.get('/top', cache.route(), asyncHandler(async function(req, res, next) {
  const { limit = 7 } = req.query;
  try {
    const results = await getTopStats(limit);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats/top] error', error);
    return res.json(error);
  }
}));

async function getStatsByAggregateData(countryCode) {
  const conn = db.conn.promise();
  let query = '';
  const args = [];

  if (!countryCode) {
    query = `SELECT 
               CAST(SUM(confirmed) AS UNSIGNED) AS num_confirm,
               CAST(SUM(deaths) AS UNSIGNED) AS num_dead,
               CAST(SUM(recovered) AS UNSIGNED) AS num_heal
          FROM 
            data_aggregated
          WHERE
            posted_at = (SELECT MAX(posted_at) FROM data_aggregated)  
          LIMIT 
            1
`;
  }
  else {
    query = `SELECT 
               countryCode, 
               COALESCE(MAX(confirmed), 0) AS num_confirm, 
               COALESCE(MAX(deaths), 0) AS num_dead, 
               COALESCE(MAX(recovered), 0) AS num_heal, 
               MAX(posted_at) as created
             FROM 
               data_aggregated
             GROUP BY countryCode
             HAVING countryCode = ?
             ORDER BY posted_at DESC   
`;

    args.push(countryCode);
  }

  let result = await conn.query(query, args);
  return result[0] && result[0][0] || { countryCode, num_confirm: '?', num_dead: '?', num_heal: '?', created: null };
}

async function getTopStats(limit = 7) {
  limit = parseInt(limit);

  const conn = db.conn.promise();

  const query = `
SELECT
  countryCode AS countryCode,
  confirmed as num_confirm,
  deaths as num_dead,
  recovered as num_heal,
  posted_at as created
FROM data_aggregated
WHERE posted_at = (SELECT MAX(posted_at) FROM data_aggregated)   
ORDER BY confirmed DESC 
LIMIT ?`;

  const args = [limit];

  let result = await conn.query(query, args);

  return result[0];
}

async function getLatestArcgisStats() {
  const conn = db.conn.promise();
  let query = `SELECT t.nid, t.country, t.state, t.last_update as lastUpdate, t.lat, t.lng, t.confirmed, t.deaths, t.recovered, t.posted_date AS postedDate, CURRENT_TIMESTAMP() as currentTimestamp
FROM coronatracker.arcgis AS t 
WHERE posted_date = (SELECT MAX(posted_date) FROM coronatracker.arcgis)`;

  let result = await conn.query(query);

  return result[0];
}

module.exports = router;
