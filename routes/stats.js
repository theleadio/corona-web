const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');
const cache = require('../system/redis-cache');

/**
 * @api {get} /stats
 * @apiName FetchStats
 * @apiGroup Stats
 * 
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
 */
router.get('/', cache.route(), asyncHandler(async function (req, res, next) {
  const { country } = req.query;
  try {
    const results = await getStatsByArcGis(country);
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
    const results = await getLatestStats();
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

/**
 * @api {get} /stats/qq
 * @apiName FetchStatsByQq
 * @apiGroup Stats
 *
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
 */
router.get('/qq', cache.route(), asyncHandler(async function(req, res, next) {
  const { country } = req.query;
  try {
    const results = await getStatsByQq(country);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

async function getStatsByArcGis(country) {
  const conn = db.conn.promise();
  let query = '';
  const args = [];

  if (!country) {

    query = `SELECT 
              agg_confirmed as num_confirm,
              agg_death as num_dead,
              agg_recover as num_heal
          FROM 
            AGGREGATE_arcgis 
          ORDER BY 
            agg_date DESC 
          LIMIT 
            1
`;
  }
  else {

    query = `SELECT agg_country, COALESCE(MAX(agg_confirmed), 0) AS num_confirm, COALESCE(MAX(agg_death), 0) AS num_dead, COALESCE(MAX(agg_recover), 0) AS num_heal, MAX(agg_date) as agg_date
FROM AGGREGATE_arcgis_country
GROUP BY agg_country
HAVING agg_country LIKE ?
ORDER BY agg_date DESC   
`;

    // using like and % instead of =
    // because some country in the database has extra space/invisible character.
    args.push(`%${country}%`);
  }

  let result = await conn.query(query, args);
  return result[0] && result[0][0] || { country, num_confirm: '?', num_suspect: '?', num_dead: '?', num_heal: '?', created: null };
}

async function getTopStats(limit = 7) {
  limit = parseInt(limit);

  const conn = db.conn.promise();

  const query = `
SELECT
  agg_country AS country,
  agg_confirmed as num_confirm,
  agg_death as num_dead,
  agg_recover as num_heal,
  agg_date as date
FROM AGGREGATE_arcgis_country
WHERE agg_date = (SELECT MAX(agg_date) FROM AGGREGATE_arcgis_country)   
ORDER BY agg_confirmed DESC 
LIMIT ?`;

  const args = [limit];

  let result = await conn.query(query, args);

  return result[0];
}

async function getLatestStats() {
  const conn = db.conn.promise();
  let query = `SELECT t.nid, t.country, t.state, t.last_update as lastUpdate, t.lat, t.lng, t.confirmed, t.deaths, t.recovered, t.posted_date AS postedDate, CURRENT_TIMESTAMP() as currentTimestamp
FROM coronatracker.arcgis AS t 
WHERE posted_date = (SELECT MAX(posted_date) FROM coronatracker.arcgis)`;

  let result = await conn.query(query);

  return result[0];
}

async function getStatsByQq(country) {
  const conn = db.conn.promise();
  let query = '';
  const args = [];

  if (!country) {
    query = `SELECT
CAST(SUM(num_confirm) AS UNSIGNED) AS num_confirm,
-- CAST(SUM(num_suspect) AS UNSIGNED) AS num_suspect,
CAST(SUM(num_dead) AS UNSIGNED) AS num_dead,
CAST(SUM(num_heal) AS UNSIGNED) AS num_heal,
created
FROM tencent_data_by_country
GROUP BY created
ORDER BY created DESC
LIMIT 1`;
  }
  else {
    query = `
-- SELECT country, num_confirm, num_suspect, num_dead, num_heal, created
SELECT country, num_confirm, num_dead, num_heal, created
FROM tencent_data_by_country
WHERE country = ?
ORDER BY created DESC
LIMIT 1
`;

    args.push(country);
  }

  let result = await conn.query(query, args);
  return result[0] && result[0][0] || { country, num_confirm: '?', num_dead: '?', num_heal: '?', created: null };
}

module.exports = router;
