const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../../system/database')
const cache = require('../../system/redis-cache')
const router = express.Router()

/**
 * @api {get} /analytics/trend
 * @apiName FetchAnalyticsTrendByDate
 * @apiGroup Analytics
 * 
 * @apiParam {Date} [start_date] Required Start date
 * @apiParam {Date} [end_date] Required end date
 */
router.get('/trend', cache.route(), asyncHandler(async function(req, res, next) {
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
 * 
 * @apiParam {Integer} [limit] Optional limit the number of results
 */
router.get('/area', cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 10

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      res.json('Invalid data type. Limit should be an integer.')
    }
  }

  try {
    const results = await fetchMostAffectedByArea(limit)

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
 * 
 * @apiParam {Integer} [limit] Optional limit the number of results
 */
router.get('/country', cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 200

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      res.json('Invalid data type. Limit should be an integer.')
    }
  }

  try {
    const results = await fetchAffectedCountries(limit)

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
    query = `SELECT confirmed as confirmed,
      deaths as dead,
      recovered as recovered,
      posted_at as date_posted
      FROM data_aggregated
      WHERE (posted_at BETWEEN ? AND ?)`
    args.push(start_date, end_date)
  }

  let result = await conn.query(query, args)

  return result[0]
}

async function fetchMostAffectedByArea(limit) {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
    SELECT IFNULL(state, 'N/A') as state, lat, lng,
    SUM(confirmed) as total_confirmed,
    SUM(deaths) as total_dead, SUM(recovered) as total_recovered,
    CAST(posted_date as DATETIME) as date_as_of
    FROM arcgis
    WHERE posted_date IN (SELECT MAX(posted_date) from arcgis)
    GROUP BY state
    ORDER BY total_confirmed DESC
    LIMIT ?`

  args.push(limit)

  let result = await conn.query(query, args)

  return result[0]
}

async function fetchAffectedCountries(limit) {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
    SELECT 
    C.country_name AS country,
    C.latitude + 0.0 AS lat,
    C.longitude + 0.0 AS lng,
    CAST(SUM(confirmed) AS UNSIGNED) AS total_confirmed,
    CAST(SUM(deaths) AS UNSIGNED) AS total_dead, 
    CAST(SUM(recovered) AS UNSIGNED) AS total_recovered,
    CAST(posted_at AS DATETIME) AS date_as_of
    FROM data_aggregated AS A
    INNER JOIN apps_countries AS C 
    ON A.countryCode = C.country_code
    WHERE posted_at IN (SELECT MAX(posted_at) from data_aggregated)
    GROUP BY countryCode
    ORDER BY confirmed DESC
    LIMIT ?`

  args.push(limit)

  let result = await conn.query(query, args)

  return result[0]
}

module.exports = router
