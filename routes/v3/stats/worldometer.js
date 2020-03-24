const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../../system/database');
const cache = require('../../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../../services/customStats');
const { cacheCheck } = require('../../../services/cacheMiddleware');

 /**
 * @api {get} /v3/stats/worldometer/country all country or country-specific stats
 * @apiName worldometer
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiParam {String} [countryCode] Optional countryCode to retrieve the stats for
 * @apiDescription Returns all country data or country-specific stats based on worldometer data.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "CN",
    "country": "China",
    "totalConfirmed": 81008,
    "totalDeaths": 3255,
    "totalRecovered": 71740,
    "dailyConfirmed": 41,
    "dailyDeaths": 7,
    "activeCases": 6013,
    "totalCritical": 1927,
    "totalConfirmedPerMillionPopulation": 56,
    "FR": "4.0181",
    "PR": "88.5592",
    "lastUpdated": "2020-03-21T04:00:12.000Z"
  },
]
 */
router.get('/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/country');
  let countryCode = null
  if (req.query.hasOwnProperty('countryCode')) {
    countryCode = req.query.countryCode;
  }

  try {
    const result = await getCountryStats(countryCode);
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/country] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/global Global stats
 * @apiName stats_overview
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiDescription Returns global stats based on worldometer data, used in home and analytics page
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "totalConfirmed": 276113,
  "totalDeaths": 11402,
  "totalRecovered": 91952,
  "totalNewCases": 562,
  "totalNewDeaths": 23,
  "totalActiveCases": 172759,
  "totalCasesPerMillionPop": 35,
  "created": "2020-03-21T13:00:13.000Z"
}
 */
router.get('/global', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
  // console.log('calling /v3/stats/worldometer/global');
  try {
    const results = await getGlobalStats();
    return res.json(results);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/global] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/top Top N countries
 * @apiName worldometer
 * @apiGroup Stats - Worldometer
 * @apiVersion 3.0.0
 * @apiParam {Integer} [limit] Limit to top N countries to return
 * @apiDescription Returns N country data or country-specific stats based on worldometer data.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "CN",
    "country": "China",
    "totalConfirmed": 81008,
    "totalDeaths": 3255,
    "totalRecovered": 71740,
    "dailyConfirmed": 41,
    "dailyDeaths": 7,
    "activeCases": 6013,
    "totalCritical": 1927,
    "totalConfirmedPerMillionPopulation": 56,
    "FR": "4.0181",
    "PR": "88.5592",
    "lastUpdated": "2020-03-21T04:00:12.000Z"
  },
]
 */
router.get('/top', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  // console.log('calling /v3/stats/worldometer/top');
  let limit = 999

  if (req.query.hasOwnProperty('limit')) {
    limit = req.query.limit;
  }

  try {
    const result = await getCountryStats(null, limit);
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/worldometer/top] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/worldometer/custom-debug Custom (for debug)
 * @apiName FetchCustomOverriddenStatsDebug
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription This endpoint is used for debugging purpose.
 * It returns the list of overridden stats in our google sheet.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "id": 2,
    "countryCode": "SG",
    "countryName": "Singapore",
    "confirmed": 89,
    "recovered": 51,
    "deaths": 0,
    "created": "2020-02-23 (UTC 1355)",
    "createdBy": "",
    "sourceUrl": "https://www.cna.com.tw/news/aopl/202002230219.aspx"
  }
]
 */
router.get('/custom-debug', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  const result = await fetchDataFromGoogleSheet();
  return res.json(result);
}));

async function getGlobalStats() {
  const conn = db.conn.promise();
  let query = `
  SELECT
  total_cases AS totalConfirmed,
  total_deaths as totalDeaths,
  total_recovered as totalRecovered,
  new_cases AS totalNewCases,
  new_deaths AS totalNewDeaths,
  active_cases AS totalActiveCases,
  CAST(total_cases_per_million_pop AS UNSIGNED) AS totalCasesPerMillionPop,
  last_updated as created
  FROM worldometers_total_sum
  WHERE last_updated = (SELECT MAX(last_updated) FROM worldometers_total_sum)
  LIMIT 1;
`;
  let result = await conn.query(query);
  return result[0][0];
}

async function getCountryStats(countryCode=null, limit=999) {

  const conn = db.conn.promise();
  let countryCodeQuery = ''
  let args = []
  let getAllFlag = true

  if (countryCode) {
    countryCodeQuery = 'WHERE ac.country_code=?'
    args.push(countryCode)
    getAllFlag = false
  } 
  args.push(parseInt(limit))

  let query = `
  SELECT ac.country_code AS countryCode, tt.country, tt.total_cases AS totalConfirmed, tt.total_deaths AS totalDeaths, tt.total_recovered AS totalRecovered, tt.new_cases AS dailyConfirmed, tt.new_deaths AS dailyDeaths, tt.active_cases AS activeCases, tt.serious_critical_cases AS totalCritical, CAST(tt.total_cases_per_million_pop AS UNSIGNED) AS totalConfirmedPerMillionPopulation, (tt.total_deaths / tt.total_cases * 100) AS FR, (tt.total_recovered / tt.total_cases * 100) AS PR, tt.last_updated AS lastUpdated
  FROM worldometers tt
  INNER JOIN
  (
    SELECT country,
    max(last_updated) AS MaxDateTime
    FROM worldometers tt
    where country not in ("Sint Maarten","Congo", "South Korea")
    GROUP BY country
  )
  groupedtt ON tt.country = groupedtt.country
  AND tt.last_updated = groupedtt.MaxDateTime
  LEFT JOIN
  (
    SELECT country_name,
    country_code,
    country_alias
    FROM apps_countries
  )
  AS ac ON tt.country = ac.country_alias
  ${countryCodeQuery}
  GROUP BY tt.country
  ORDER BY tt.total_cases DESC
  LIMIT ?`;


  let result = await conn.query(query, args);
  const data = result[0]
  const updatedData = updateCountryDetailStatsWithCustomStats(data, limit, getAllFlag)
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
        
        /* Format of expected data
          {
            "countryCode": "CN",
            "country": "China",
            "totalConfirmed": 81054,
            "totalDeaths": 3261,
            "totalRecovered": 72440,
            "dailyConfirmed": 0,
            "dailyDeaths": 0,
            "activeCases": 5353,
            "totalCritical": 1845,
            "totalConfirmedPerMillionPopulation": 56,
            "FR": "4.0232",
            "PR": "89.3725",
            "lastUpdated": "2020-03-22T22:10:05.000Z"
          },
        */
        if (!overriddenData.find(d => d.countryCode.toLowerCase() === cs.countryCode.toLowerCase())) {
          overriddenData.push({
            countryCode: cs.countryCode,
            country: cs.countryName,
            totalConfirmed: cs.confirmed || 0,
            totalDeaths: cs.deaths || 0,
            totalRecovered: cs.recovered || 0,
            dailyConfirmed: cs.dailyConfirmed || 0,
            dailyDeaths: cs.dailyDeaths || 0,
            activeCases: cs.activeCases || 0,
            totalCritical: cs.totalCritical || 0,
            totalConfirmedPerMillionPopulation: cs.totalConfirmedPerMillionPopulation || 0,
            FR: cs.FR || "0",
            PR: cs.PR || "0",
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

module.exports = router;
