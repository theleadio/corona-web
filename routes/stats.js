const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');
const moment = require('moment')

/**
 * @api {get} /stats
 * @apiName FetchStats
 * @apiGroup Stats
 * 
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
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
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
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

/**
 * @api {get} /stats/trend
 * @apiName  FetchStatsByTrend
 * @apiGroup Stats
 * 
 * @apiParam {Date} [start_date] Required Start date
 * @apiParam {Date} [end_date] Required end date
 */
router.get('/trend', asyncHandler(async function(req, res, next) {
  const start_date = req.query.start_date
  const end_date = req.query.end_date

  // enforce date format
  if (
    moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != start_date ||
    moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != end_date
  ) {
    res.json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // make sure end_date isn't less than start_date
  if (moment(end_date).isBefore(start_date)) {
    res.json('Invalid date')
  }

  try {
    const results = await getStatsByTrend(start_date, end_date)
    
    return res.json(results)
  } catch (error) {
    console.log('[/stats/trend] error', error)

    return res.json(error)
  }
}))

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

    query = `SELECT 
agg_country, COALESCE(agg_confirmed, 0) AS num_confirm, COALESCE(agg_death, 0) AS num_dead, COALESCE(agg_recover, 0) AS num_heal, agg_date
FROM AGGREGATE_arcgis_country
WHERE agg_country LIKE ?
ORDER BY agg_date DESC   
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

async function getStatsByTrend(start_date, end_date) {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  if (start_date && end_date) {
    query = `SELECT * FROM AGGREGATE_arcgis WHERE (agg_date BETWEEN ? AND ?)`
    args.push(start_date, end_date)
  }

  let result = await conn.query(query, args)

  return result[0]
}

module.exports = router;
