const express = require('express')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const db = require('../../system/database')
const cache = require('../../system/redis-cache')
const { getCustomStats } = require('../../services/customStats');
const router = express.Router()
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /v3/analytics/daily By new daily cases and deaths
 * @apiName fetchTopCountryWithDailyNewCases
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 *
 * @apiParam {Number} [limit=10] limit the number of results
 */
router.get('/daily', cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 10

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      res.json('Invalid data type. Limit should be an integer.')
    }
  }

  try {
    const results = await fetchTopCountryWithDailyNewCases(limit)

    return res.json(results)
  } catch (error) {
    console.log('[/analytics/daily] error', error)

    return res.json(error)
  }
}))

/**
 * @api {get} /v3/analytics/country By country
 * @apiName FetchAffectedCountries
 * @apiGroup Analytics
 * @apiVersion 3.0.0
 *
 * @apiParam {Number} [limit=200] limit the number of results
 */
router.get('/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  let limit = 200

  if (req.query.hasOwnProperty('limit')) {
    if (parseInt(req.query.limit)) {
      limit = parseInt(req.query.limit)
    } else {
      return res.json('Invalid data type. Limit should be an integer.')
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

async function fetchTopCountryWithDailyNewCases(limit=10) {
  const conn = db.conn.promise()
  let query = ''
  const args = []

  query = `
  SELECT ac.country_code, ac.latitude + 0.0 AS lat, ac.longitude + 0.0 AS lng, tt.country, tt.new_cases AS daily_cases, tt.new_deaths AS daily_deaths, tt.last_updated
  FROM worldometers tt
  INNER JOIN
  (
    SELECT country,
    max(last_updated) AS MaxDateTime	
    FROM worldometers tt	
    WHERE country NOT in ("Sint Maarten", "Congo")	
    GROUP BY country
  )
  groupedtt ON tt.country = groupedtt.country
  AND tt.last_updated = groupedtt.MaxDateTime
  LEFT JOIN
  (
    SELECT country_name,
    country_code,
    country_alias,
    latitude,
    longitude	
    FROM apps_countries
  )
  AS ac ON tt.country = ac.country_alias
  GROUP BY tt.country
  ORDER BY tt.new_cases DESC
  LIMIT ?`

  args.push(limit)
  let result = await conn.query(query, args)
  return result[0]
}

async function fetchAffectedCountries(limit = 999) {
  const results = await getStatsWithCountryDetail(limit);
  return results.map(s => {
    return {
      countryCode: s.countryCode,
      countryName: s.countryName,
      lat: s.lat,
      lng: s.lng,
      confirmed: s.totalConfirmed,
      deaths: s.totalDeaths,
      recovered: s.totalRecovered,
      dateAsOf: s.lastUpdated,
    }
  });
}

/**
 * Returns array of object with following keys:
 * - countryCode
 * - countryName
 * - lat
 * - lng
 * - totalConfirmed,
 * - totalDeaths,
 * - totalRecovered
 * - lastUpdated
 * @param limit
 * @returns {Promise<*>}
 */
async function getStatsWithCountryDetail(limit = 999) {
    limit = parseInt(limit);

    const conn = db.conn.promise();
    const args = [limit];

    const query = `
    SELECT ac.country_code AS countryCode, ac.latitude + 0.0 AS lat, ac.longitude + 0.0 AS lng, tt.country AS countryName, tt.total_cases AS totalConfirmed, tt.total_deaths AS totalDeaths, tt.total_recovered AS totalRecovered, tt.last_updated AS lastUpdated
    FROM worldometers tt
    INNER JOIN
    (
      SELECT country,
      max(last_updated) AS MaxDateTime	
      FROM worldometers tt	
      WHERE country NOT in ("Sint Maarten", "Congo")	
      GROUP BY country
    )
    groupedtt ON tt.country = groupedtt.country
    AND tt.last_updated = groupedtt.MaxDateTime
    LEFT JOIN
    (
      SELECT country_name,
      country_code,
      country_alias,
      latitude,
      longitude	
      FROM apps_countries
    )
    AS ac ON tt.country = ac.country_alias
    GROUP BY tt.country
    ORDER BY tt.total_cases DESC
    LIMIT ?;`;
    const result = await conn.query(query, args)
    const data = result[0]
    const updatedData = updateCountryDetailStatsWithCustomStats(data, limit, true)
    return updatedData
}

// Get custom stats from GoogleSheetApi
// Update countryStats values if it's greater
async function updateCountryDetailStatsWithCustomStats(data, limit=999, getAllFlag) {
  try {
    const customStats = await getCustomStats();

    const overriddenData = data.map(d => {
      const customCountryStat = customStats.find(c => c.countryCode && d.countryCode && c.countryCode.toLowerCase() === d.countryCode.toLowerCase());

      if (!customCountryStat) {
        return d;
      }

      return {
        ...d,
        totalConfirmed: Math.max(d.totalConfirmed, customCountryStat.confirmed),
        totalDeaths: Math.max(d.totalDeaths, customCountryStat.deaths),
        totalRecovered: Math.max(d.totalRecovered, customCountryStat.recovered),
      }
    });

    // Add custom country stats if it does not exist in current data.
    // only use this when we're getting all data
    if (getAllFlag) {
      customStats.forEach(cs => {
        if (!cs.countryCode || typeof cs.countryCode !== 'string') {
          return false;
        }

        if (!overriddenData.find(d => d.countryCode.toLowerCase() === cs.countryCode.toLowerCase())) {
          overriddenData.push({
            countryCode: cs.countryCode,
            countryName: cs.countryName,
            totalConfirmed: cs.confirmed || 0,
            totalDeaths: cs.deaths || 0,
            totalRecovered: cs.recovered || 0,
            lat: cs.lat || 0,
            lng: cs.lng || 0,
            lastUpdated: new Date(),
          });
        }
      });
    }

    return overriddenData
      .sort((a, b) => {
        // Sort by recovered desc if confirmed is same
        if (b.totalConfirmed === a.totalConfirmed) {
          return b.totalRecovered - a.totalRecovered;
        }

        // Sort by confirmed desc
        return b.totalConfirmed - a.totalConfirmed;
      })
      // Take first {limit} results.
      .slice(0, limit);
  } catch (e) {
    console.log("[getCustomStatsWithCountryDetail] error:", e);
    return data;
  }
}

module.exports = router
