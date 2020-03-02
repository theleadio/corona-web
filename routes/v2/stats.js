const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../system/database');
const cache = require('../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../services/customStats');
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /stats
 * @apiName FetchStats
 * @apiGroup Stats
 *
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
 */
router.get('/', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
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
router.get('/latest', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
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
router.get('/top', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
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
 * @api {get} /v2/stats/custom
 * @apiName FetchCustomOverriddenStats
 * @apiGroup Stats
 */
router.get('/custom', cacheCheck, asyncHandler(async function(req, res, next) {
  const result = await getCustomStats();
  return res.json(result);
}));

/**
 * @api {get} /v2/stats/custom-debug
 * @apiName FetchCustomOverriddenStatsDebug
 * @apiGroup Stats
 */
router.get('/custom-debug', cacheCheck, asyncHandler(async function(req, res, next) {
  const result = await fetchDataFromGoogleSheet();
  return res.json(result);
}));

async function getStatsByAggregateData(countryCode) {
  if (countryCode) {
    return getStatsByAggregateDataFilterByCountry(countryCode);
  }

  const conn = db.conn.promise();

  let query = `
SELECT
  CAST(SUM(confirmed) AS UNSIGNED) AS confirmed,
  CAST(SUM(deaths) AS UNSIGNED) AS deaths,
  CAST(SUM(recovered) AS UNSIGNED) AS recovered,
  MAX(posted_date) as created
FROM 
  arcgis
WHERE 
  posted_date = (SELECT MAX(posted_date) FROM arcgis)
LIMIT 1
`;

  let result = await conn.query(query);

  return result[0] && result[0][0] || { confirmed: '?', deaths: '?', recovered: '?', created: null };
}

async function getStatsByAggregateDataFilterByCountry(countryCode) {
  const conn = db.conn.promise();

  let query = `
SELECT
  AC.country_code AS countryCode,
  IFNULL(AC.country_name, A.country) AS countryName,
  CAST(SUM(A.confirmed) AS UNSIGNED) as confirmed,
  CAST(SUM(A.deaths) AS UNSIGNED) as deaths,
  CAST(SUM(A.recovered) AS UNSIGNED) as recovered, 
  A.posted_date as created
FROM 
  arcgis AS A
INNER JOIN 
  apps_countries AS AC
ON 
  A.country = AC.country_alias
  AND A.posted_date = (SELECT MAX(posted_date) FROM arcgis)
  AND AC.country_code = ?
GROUP BY 
  A.country, A.posted_date   
`;

  const args = [countryCode];
  let result = await conn.query(query, args);

  const data = result[0] && result[0][0] || { countryCode, confirmed: '?', deaths: '?', recovered: '?', created: null };

  const customStats = await getCustomStats();

  if (!customStats) {
    return data;
  }

  const customCountryStat = customStats.find(a => a.countryCode && a.countryCode.toLowerCase() === countryCode.toLowerCase());

  if (!customCountryStat) {
    return data;
  }

  return {
    ...data,
    confirmed: Math.max(data.confirmed, customCountryStat.confirmed),
    deaths: Math.max(data.deaths, customCountryStat.deaths),
    recovered: Math.max(data.recovered, customCountryStat.recovered),
    created: data.created > customCountryStat.created ? data.created : customCountryStat.created,
  }
}

async function getTopStats(limit = 7) {
  limit = parseInt(limit);

  const conn = db.conn.promise();

  const query = `
SELECT
  AC.country_code AS countryCode,
  IFNULL(AC.country_name, A.country) AS countryName,
  CAST(SUM(A.confirmed) AS UNSIGNED) as confirmed,
  CAST(SUM(A.deaths) AS UNSIGNED) as deaths,
  CAST(SUM(A.recovered) AS UNSIGNED) as recovered,
  A.posted_date as created
FROM
  arcgis AS A
INNER JOIN
  apps_countries AS AC
ON
  A.country = AC.country_alias
  AND A.posted_date = (SELECT MAX(posted_date) FROM arcgis)
GROUP BY
  A.country, A.posted_date 
ORDER BY
  confirmed DESC, recovered DESC
LIMIT ?`;

  const args = [limit];

  let result = await conn.query(query, args);
  const data = result[0];

  try {
    const customStats = await getCustomStats();

    const overriddenData = data.map(d => {
      const customCountryStat = customStats.find(c => c.countryCode && d.countryCode && c.countryCode.toLowerCase() === d.countryCode.toLowerCase());

      if (!customCountryStat) {
        return d;
      }

      return {
        ...d,
        confirmed: Math.max(d.confirmed, customCountryStat.confirmed),
        deaths: Math.max(d.deaths, customCountryStat.deaths),
        recovered: Math.max(d.recovered, customCountryStat.recovered),
      }
    });

    customStats.forEach(cs => {
      if (!cs.countryCode || typeof cs.countryCode !== 'string') {
        return false;
      }

      // Add custom country stats if it does not exist in current data.
      if (!overriddenData.find(d => d.countryCode.toLowerCase() === cs.countryCode.toLowerCase())) {
        overriddenData.push({
          countryCode: cs.countryCode,
          countryName: cs.countryName,
          confirmed: cs.confirmed || 0,
          deaths: cs.deaths || 0,
          recovered: cs.recovered || 0,
          created: new Date(),
        });
      }
    });

    return overriddenData.sort((a, b) => { return b.confirmed - a.confirmed });
  } catch (e) {
    console.log("[getTopStats] error:", error);
    return data;
  }
}

async function getLatestArcgisStats() {
  const conn = db.conn.promise();
  let query = `
SELECT 
  t.nid,
  t.country,
  t.state,
  t.last_update AS lastUpdate,
  t.lat,
  t.lng,
  t.confirmed,
  t.deaths,
  t.recovered,
  t.posted_date AS postedDate,
  CURRENT_TIMESTAMP() AS currentTimestamp
FROM
  coronatracker.arcgis AS t 
WHERE
  posted_date = (SELECT MAX(posted_date) FROM arcgis)
`;

  let result = await conn.query(query);

  return result[0];
}

module.exports = router;
