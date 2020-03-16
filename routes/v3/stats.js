const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../system/database');
const cache = require('../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../services/customStats');
const { getStatsWithCountryDetail } = require('../../services/statsService');
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /v2/stats
 * @apiName FetchStats
 * @apiGroup Stats
 * @apiVersion 2.0.0
 * @apiDescription Returns the stats of top X countries sorted by number of confirmed cases.
 * @apiParam {String} [country] Optional Country to retrieve the stats for.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "confirmed": 96785,
  "deaths": 3303,
  "recovered": 53610,
  "created": "2020-03-05T14:35:03.000Z"
}
 */
router.get('/', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
  console.log('calling v3/stats');
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
 * @api {get} /v2/stats/latest
 * @apiName FetchLatestStats
 * @apiGroup Stats
 * @apiVersion 2.0.0
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
 * @api {get} /v2/stats/top Top stats
 * @apiName FetchTopStats
 * @apiGroup Stats
 * @apiVersion 2.0.0
 * @apiDescription Returns the stats of top X countries sorted by number of confirmed cases.
 * @apiParam {Number} [limit=7] Number of countries' stats to retrieve.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "CN",
    "countryName": "China",
    "confirmed": 80411,
    "deaths": 3013,
    "recovered": 52201,
    "created": "2020-03-05T14:50:02.000Z"
  }
]
 */
router.get('/top', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  const { limit = 7 } = req.query;
  try {
    const results = await getStatsWithCountryDetail(limit);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats/top] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v2/stats/custom Custom
 * @apiName FetchCustomOverriddenStats
 * @apiGroup Stats
 * @apiVersion 2.0.0
 * @apiDescription Returns country stats combined with overridden stats in our google sheet.
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
router.get('/custom', cacheCheck, asyncHandler(async function(req, res, next) {
  const result = await getCustomStats();
  return res.json(result);
}));

/**
 * @api {get} /v2/stats/custom-debug Custom (for debug)
 * @apiName FetchCustomOverriddenStatsDebug
 * @apiGroup Stats
 * @apiVersion 2.0.0
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
router.get('/custom-debug', cacheCheck, asyncHandler(async function(req, res, next) {
  const result = await fetchDataFromGoogleSheet();
  return res.json(result);
}));

/**
 * @api {get} /v2/stats/diff/global Diff global stats
 * @apiName FetchGlobalStatsDifferenceBetweenDays
 * @apiGroup Stats
 * @apiVersion 2.0.0
 * @apiDescription Returns difference in global stats between days.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "todayConfirmed": 111243,
    "ytdConfirmed": 107642,
    "diffConfirmed": 3601,
    "todayDeath": 3890,
    "ytdDeath": 3655,
    "diffDeath": 235,
    "todayRecover": 62370,
    "ytdRecover": 60655,
    "diffRecover": 1715,
    "today": "2020-03-09T00:00:00.000Z",
    "ytd": "2020-03-08T00:00:00.000Z"
  }
]
 */
router.get('/diff/global', cacheCheck, asyncHandler(async function(req, res, next) {
  try {
    const result = await getGlobalStatsDiff();
    return res.json(result);
  }
  catch (error) {
    console.log('[/stats/diff/global] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v2/stats/diff/country Diff country stats
 * @apiName FetchCountryStatsDifferenceBetweenDays
 * @apiGroup Stats
 * @apiVersion 2.0.0
 * @apiDescription Returns difference in country stats between days.
 * @apiParam {String} [sort=confirmed] The stats number to sort by in descending order. Valid values are 'confirmed', 'recover', 'death'
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryName": "Italy",
    "todayConfirmed": 7375,
    "ytdConfirmed": 5883,
    "diffConfirmed": 1492,
    "todayDeath": 366,
    "ytdDeath": 233,
    "diffDeath": 133,
    "todayRecover": 622,
    "ytdRecover": 589,
    "diffRecover": 33,
    "today": "2020-03-09T00:00:00.000Z",
    "ytd": "2020-03-08T00:00:00.000Z"
  }
]
 */
router.get('/diff/country', cacheCheck, asyncHandler(async function(req, res, next) {
  const { countryCode } = req.query;
  try {
    const results = await getCountryStatsDiff(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
  // try {
  //   const { sort = 'confirmed' } = req.query;
  //   const result = await getCountryStatsDiff(sort);
  //   return res.json(result);
  // }
  // catch (error) {
  //   console.log('[/stats/diff/country] error', error);
  //   return res.json(error);
  // }
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
console.log('bno getStatsByAggregateDataFilterByCountry:'+countryCode);
let query = `SELECT
AC.country_code AS countryCode,
IFNULL(AC.country_name, b.country) AS countryName,
CAST(SUM(cases) AS UNSIGNED) AS confirmed,
CAST(SUM(deaths) AS UNSIGNED) AS deaths,
CAST(SUM(recovered) AS UNSIGNED) AS recovered,
MAX(art_updated) as created
FROM
bno as b
INNER JOIN
 apps_countries AS AC
ON
 b.country = AC.country_alias
 AND b.art_updated = (SELECT MAX(art_updated) FROM bno)
 AND AC.country_code = ?
WHERE
art_updated = (SELECT MAX(art_updated) FROM bno)
GROUP BY
 b.country, b.art_updated
ORDER BY b.cases DESC;`;

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
  confirmed DESC, recovered DESC`;

  const args = [];

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

    return overriddenData
      .sort((a, b) => {
        // Sort by recovered desc if confirmed is same
        if (b.confirmed === a.confirmed) {
          return b.recovered - a.recovered;
        }

        // Sort by confirmed desc
        return b.confirmed - a.confirmed;
      })
      // Take first {limit} results.
      .slice(0, limit);
  } catch (e) {
    console.log("[getTopStats] error:", e);
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

async function getGlobalStatsDiff() {
  const conn = db.conn.promise();
  let query = `
  With bno2 as(
    SELECT
   cases,
   deaths,
   recovered,
   country,
   serious,
   critical,
    art_updated,
    max(time(art_updated)),
   DATE_ADD(art_updated,
   INTERVAL 1 DAY) AS minusDate
  FROM
   bno
   group by date(art_updated),country
 )
 SELECT
  a.country,
  a.cases as todayConfirmed,
  b.cases as ytdConfirmed,
  CAST((a.cases - b.cases) AS UNSIGNED) as diffConfirmed,
  (a.cases - b.cases) / (a.cases + b.cases) * 100 AS pctDiffConfirmed,
  a.deaths as todayDeath,
  b.deaths as ytdDeath,
  CAST((a.deaths - b.deaths) AS UNSIGNED) as diffDeath,
   (a.deaths - b.deaths) / (a.deaths + b.deaths) * 100 as pctDiffDeaths,
  a.recovered as todayRecover,
  b.recovered as ytdRecover,
  CAST((a.recovered - b.recovered) AS UNSIGNED) AS diffRecover,
   (a.recovered - b.recovered) / (a.recovered + b.recovered) * 100 as pctDiffRecovered,
   a.critical as todayCritical,
   b.critical as ytdCritical,
   CAST((a.critical - b.critical) AS UNSIGNED) as diffCritical,
   (a.critical - b.critical) / (a.critical + b.critical) * 100 as pctCiffCritical,
   a.serious as todaySerious,
   b.serious as ytdSerious,
   CAST((a.serious - b.serious) AS UNSIGNED) AS diffSerious,
   (a.serious - b.serious) / (a.serious + b.serious) * 100 as pctDiffSerious,
   (a.deaths / a.cases + b.cases) * 100 as tdy_FR,
   (b.deaths / b.cases) * 100 as ytdFR,
   (a.recovered/a.cases + b.cases) * 100 as tdyPR,
   (b.recovered/b.cases) * 100 as tdyPR,
  a.art_updated as today,
  b.art_updated as ytd
 FROM
  bno a,
  bno2 b
 WHERE
  a.art_updated = b.minusDate
  and a.country = b.country
 ORDER BY
  a.art_updated desc
`;

  const result = await conn.query(query);
  return result[0];
}

async function getCountryStatsDiff(countryCode) {
  const conn = db.conn.promise();
  let query = `
  With bno2 as(
    SELECT
   cases,
   deaths,
   recovered,
   country,
   serious,
   critical,
    art_updated,
    max(time(art_updated)),
   DATE_ADD(art_updated,
   INTERVAL 1 DAY) AS minusDate
  FROM
   bno
   group by date(art_updated),country
 )
 SELECT
  a.country,
  a.cases as todayConfirmed,
  b.cases as ytdConfirmed,
  CAST((a.cases - b.cases) AS UNSIGNED) as diffConfirmed,
  (a.cases - b.cases) / (a.cases + b.cases) * 100 AS pctDiffConfirmed,
  a.deaths as todayDeath,
  b.deaths as ytdDeath,
  CAST((a.deaths - b.deaths) AS UNSIGNED) as diffDeath,
   (a.deaths - b.deaths) / (a.deaths + b.deaths) * 100 as pctDiffDeaths,
  a.recovered as todayRecover,
  b.recovered as ytdRecover,
  CAST((a.recovered - b.recovered) AS UNSIGNED) AS diffRecover,
   (a.recovered - b.recovered) / (a.recovered + b.recovered) * 100 as pctDiffRecovered,
   a.critical as todayCritical,
   b.critical as ytdCritical,
   CAST((a.critical - b.critical) AS UNSIGNED) as diffCritical,
   (a.critical - b.critical) / (a.critical + b.critical) * 100 as pctCiffCritical,
   a.serious as todaySerious,
   b.serious as ytdSerious,
   CAST((a.serious - b.serious) AS UNSIGNED) AS diffSerious,
   (a.serious - b.serious) / (a.serious + b.serious) * 100 as pctDiffSerious,
   (a.deaths / a.cases + b.cases) * 100 as tdy_FR,
   (b.deaths / b.cases) * 100 as ytdFR,
   (a.recovered/a.cases + b.cases) * 100 as tdyPR,
   (b.recovered/b.cases) * 100 as tdyPR,
  a.art_updated as today,
  b.art_updated as ytd
FROM
 bno a,
 bno2 b,
 countries
WHERE
 a.art_updated = b.minusDate
 and a.country = b.country
 and countries.countryName = b.country
 and countries.countryCode = ?
ORDER BY
 a.art_updated desc
 limit 1
`;
  const args = [countryCode];
  let result = await conn.query(query, args);
  //const result = await conn.query(query);
  return result[0][0];
}

module.exports = router;
