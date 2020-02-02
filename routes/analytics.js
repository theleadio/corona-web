const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../system/database')
const router = express.Router()

/**
 * @api {get} /analytics/trend
 * @apiName FetchAnalyticsTrendByDate
 * @apiGroup Analytics
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
    const results = await fetchTrendByDate(start_date, end_date)
    
    return res.json(results)
  } catch (error) {
    console.log('[/analytics/trend] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /analytics/area
 * @apiName FetchMostAffectedbyArea
 * @apiGroup Analytics
 */
router.get('/area', asyncHandler(async function(req, res, next) {
  try {
    const results = await fetchMostAffectedByArea()

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/area] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /analytics/country
 * @apiName FetchAffectedCountries
 * @apiGroup Analytics
 */
router.get('/country', asyncHandler(async function(req, res, next) {
  try {
    const results = await fetchAffectedCountries()

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/country] error', error)

    return res.json(error)
  }
}))

async function fetchTrendByDate(start_date, end_date) {
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

async function fetchMostAffectedByArea() {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
    SELECT IFNULL(state, 'N/A') as state,
    CAST(posted_date as DATE) as date_as_of,
    SUM(confirmed) as total_confirm,
    SUM(deaths) as total_deaths, SUM(recovered) as total_recovered
    FROM hourly_table_outbreak
    WHERE posted_date IN (SELECT MAX(posted_date) from hourly_table_outbreak)
    GROUP BY state
    ORDER BY total_confirm DESC
    LIMIT 15`

  let result = await conn.query(query, args)

  return result[0]
}

async function fetchAffectedCountries() {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
    SELECT IFNULL(country, 'N/A') as country,
    CAST(posted_date as DATE) as date_as_of,
    SUM(confirmed) as total_confirm,
    SUM(deaths) as total_deaths, SUM(recovered) as total_recovered
    FROM hourly_table_outbreak
    WHERE posted_date IN (SELECT MAX(posted_date) from hourly_table_outbreak)
    GROUP BY country
    ORDER BY total_confirm DESC
    LIMIT 15`

  let result = await conn.query(query, args)

  return result[0]
}

module.exports = router
