const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');


/**
 * @api {get} /stats
 * @apiName FetchStats
 * @apiGroup Stats
 * 
 * @apiParam {String} [country] Optional country.  
 */
router.get('/', asyncHandler(async function (req, res, next) {
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
 * @api {get} /stats/qq
 * @apiName FetchStatsByQq
 * @apiGroup Stats
 *
 * @apiParam {String} [country] Optional country.
 */
router.get('/qq', asyncHandler(async function(req, res, next) {
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
CAST(SUM(Confirmed) AS UNSIGNED) AS num_confirm, 
CAST(SUM(Deaths) AS UNSIGNED) AS num_dead,
CAST(SUM(Recovered) AS UNSIGNED) AS num_heal, 
posted_date
FROM arcgis
GROUP BY posted_date
ORDER BY posted_date DESC
LIMIT 1`;
  }
  else {
    query = `
SELECT country, COALESCE(Confirmed, 0) AS num_confirm, COALESCE(Deaths, 0) AS num_dead, COALESCE(Recovered, 0) AS num_heal, posted_date
FROM arcgis
WHERE country LIKE ?
ORDER BY posted_date DESC
`;

    // using like and % instead of =
    // because some country in the database has extra space/invisible character.
    args.push(`%${country}%`);
  }

  let result = await conn.query(query, args);
  return result[0] && result[0][0] || { country, num_confirm: '?', num_suspect: '?', num_dead: '?', num_heal: '?', created: null };
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
