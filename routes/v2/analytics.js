const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../../system/database')
const cache = require('../../system/redis-cache')
const router = express.Router()
const { getStatsWithCountryDetail } = require('../../services/statsService')
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @apiDeprecated
 * @apiPrivate
 * @api {get} /v2/analytics/trend By date
 * @apiName FetchAnalyticsTrendByDate
 * @apiGroup Analytics
 * @apiVersion 2.0.0
 *
 * @apiParam {String} start_date Start date in YYYY-MM-DD format
 * @apiParam {String} end_date End date in YYYY-MM-DD format
 */
// router.get('/trend', cache.route(), asyncHandler(async function(req, res, next) {
//   const start_date = req.query.start_date
//   const end_date = req.query.end_date

//   // enforce date format
//   if (
//     moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != start_date ||
//     moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD') != end_date
//   ) {
//     res.json('Invalid date format. Date format should be YYYY-MM-DD')
//   }

//   // make sure end_date isn't less than start_date
//   if (moment(end_date).isBefore(start_date)) {
//     res.json('Invalid date')
//   }

//   try {
//     const results = await fetchTrendByDate(start_date, end_date)
    
//     return res.json(results)
//   } catch (error) {
//     console.log('[/analytics/trend] error', error)

//     return res.json(error)
//   }
// }))

/**
 * @apiDeprecated
 * @apiPrivate
 * @api {get} /v2/analytics/area By area
 * @apiName FetchMostAffectedByArea
 * @apiGroup Analytics
 * @apiVersion 2.0.0
 *
 * @apiParam {Number} [limit=10] limit the number of results
 */
// router.get('/area', cache.route(), asyncHandler(async function(req, res, next) {
//   let limit = 10

//   if (req.query.hasOwnProperty('limit')) {
//     if (parseInt(req.query.limit)) {
//       limit = parseInt(req.query.limit)
//     } else {
//       res.json('Invalid data type. Limit should be an integer.')
//     }
//   }

//   try {
//     const results = await fetchMostAffectedByArea(limit)

//     return res.json(results)
//   } catch (error) {
//     console.log('[/analytics/area] error', error)

//     return res.json(error)
//   }
// }))

/**
 * @api {get} /v2/analytics/country By country
 * @apiName FetchAffectedCountries
 * @apiGroup Analytics
 * @apiVersion 2.0.0
 * 
 * @apiParam {Number} [limit=200] limit the number of results
 */
router.get('/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  return res.status(410).json({
    message: 'This endpoint has been removed.'
  });

  let limit = 200
  let date = null

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      return res.json('Invalid data type. Limit should be an integer.')
    }
  }

  if (req.query.hasOwnProperty('date')) {
    date = req.query.date

    // enforce date format
    if (moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD') !== date) {
      return res.json('Invalid date format. Date format should be YYYY-MM-DD')
    }
  }

  try {
    const results = await fetchAffectedCountries(limit, date)

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/country] error', error)

    return res.json(error)
  }
}))

// async function fetchTrendByDate(start_date, end_date) {
//   const conn = db.conn.promise()
//   let query = ''
//   const args = []

//   if (start_date && end_date) {
//     query = `SELECT confirmed as confirmed,
//       deaths as dead,
//       recovered as recovered,
//       posted_at as date_posted
//       FROM data_aggregated
//       WHERE (posted_at BETWEEN ? AND ?)`
//     args.push(start_date, end_date)
//   }

//   let result = await conn.query(query, args)

//   return result[0]
// }

// async function fetchMostAffectedByArea(limit) {
//   const conn = db.conn.promise()
//   let query = ''
//   const args = []

//   query = `
//     SELECT IFNULL(state, 'N/A') as state, lat, lng,
//     SUM(confirmed) as total_confirmed,
//     SUM(deaths) as total_dead, SUM(recovered) as total_recovered,
//     CAST(posted_date as DATETIME) as date_as_of
//     FROM arcgis
//     WHERE posted_date IN (SELECT MAX(posted_date) from arcgis)
//     GROUP BY state
//     ORDER BY total_confirmed DESC
//     LIMIT ?`

//   args.push(limit)

//   let result = await conn.query(query, args)

//   return result[0]
// }

async function fetchAffectedCountries(limit = 999, date = null) {
  const results = await getStatsWithCountryDetail(limit, date);
  return results.map(s => {
    return {
      countryCode: s.countryCode,
      countryName: s.countryName,
      lat: s.lat,
      lng: s.lng,
      confirmed: s.confirmed,
      deaths: s.deaths,
      recovered: s.recovered,
      dateAsOf: s.created,
    }
  });

//   const conn = db.conn.promise()
//   const args = []
//   let query = `
// SELECT
//   AC.country_code AS countryCode,
//   IFNULL(AC.country_name, A.country) AS countryName,
//   IFNULL(AC.latitude, A.lat) + 0.0 AS lat,
//   IFNULL(AC.longitude, A.lng) + 0.0 AS lng,
//   CAST(SUM(confirmed) AS UNSIGNED) AS confirmed,
//   CAST(SUM(deaths) AS UNSIGNED) AS deaths,
//   CAST(SUM(recovered) AS UNSIGNED) AS recovered,
//   CAST(posted_date AS DATETIME) AS dateAsOf
// FROM
//   arcgis AS A
// INNER JOIN
//   apps_countries AS AC
// ON
//   A.country = AC.country_alias
//   AND A.posted_date = (SELECT MAX(posted_date) FROM arcgis)
// GROUP BY
//   A.country, A.posted_date
// ORDER BY
//   confirmed DESC, recovered DESC
// LIMIT ?
// `
//
//   args.push(limit)
//
//   const result = await conn.query(query, args)
//   const data = result[0];
//
//   try {
//     const customStats = await getCustomStats();
//
//     const overriddenData = data.map(d => {
//       const customCountryStat = customStats.find(c => c.countryCode && d.countryCode && c.countryCode.toLowerCase() === d.countryCode.toLowerCase());
//
//       if (!customCountryStat) {
//         return d;
//       }
//
//       return {
//         ...d,
//         confirmed: Math.max(d.confirmed, customCountryStat.confirmed),
//         deaths: Math.max(d.deaths, customCountryStat.deaths),
//         recovered: Math.max(d.recovered, customCountryStat.recovered),
//       }
//     });
//
//     customStats.forEach(cs => {
//       if (!cs.countryCode || typeof cs.countryCode !== 'string') {
//         return false;
//       }
//
//       // Add custom country stats if it does not exist in current data.
//       if (!overriddenData.find(d => d.countryCode.toLowerCase() === cs.countryCode.toLowerCase())) {
//         overriddenData.push({
//           countryCode: cs.countryCode,
//           countryName: cs.countryName,
//           confirmed: cs.confirmed || 0,
//           deaths: cs.deaths || 0,
//           recovered: cs.recovered || 0,
//           created: new Date(),
//         });
//       }
//     });
//
//     return overriddenData.sort((a, b) => { return b.confirmed - a.confirmed });
//   }
//   catch (e) {
//     console.log("[fetchAffectedCountries] error:", e);
//     return data;
//   }
}

module.exports = router
