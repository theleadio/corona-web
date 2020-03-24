const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../system/database');
const cache = require('../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../services/customStats');
const { getStatsWithCountryDetail } = require('../../services/statsService');
const { cacheCheck } = require('../../services/cacheMiddleware');

/**
 * @api {get} /v3/stats
 * @apiName FetchStats
 * @apiGroup Stats
 * @apiVersion 3.0.0
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
  // console.log('calling v3/stats');
  const { countryCode } = req.query;
  try {
    const results = await getStatsByAggregateData(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/v3/stats] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/latest
 * @apiName FetchLatestStats
 * @apiGroup Stats
 * @apiVersion 3.0.0
 */
router.get('/latest', cacheCheck, cache.route(), asyncHandler(async function (req, res, next) {
  try {
    const results = await getLatestArcgisStats();
    return res.json(results);
  }
  catch (error) {
    console.log('[/v3/stats/latest] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/top Top stats
 * @apiName FetchTopStats
 * @apiGroup Stats
 * @apiVersion 3.0.0
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
    console.log('[/v3/stats/top] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/custom Custom
 * @apiName FetchCustomOverriddenStats
 * @apiGroup Stats
 * @apiVersion 3.0.0
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
router.get('/custom', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  const result = await getCustomStats();
  return res.json(result);
}));

/**
 * @api {get} /v3/stats/custom-debug Custom (for debug)
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

/**
 * @api {get} /v3/stats/total_trending_cases
 * @apiName GetTotalTrendingCases
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription Returns total trending cases
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "totalConfirmed": 378560,
    "totalDeaths": 16495,
    "totalRecovered": 101608,
    "lastUpdated": "2020-03-24T00:10:06.000Z"
  },
]
 */
router.get('/total_trending_cases', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  const result = await getTotalTrendingCases();
  return res.json(result);
}));

/**
 * @api {get} /v3/stats/diff/global Diff global stats
 * @apiName FetchGlobalStatsDifferenceBetweenDays
 * @apiGroup Stats
 * @apiVersion 3.0.0
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
router.get('/diff/global', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  try {
    const result = await getGlobalStatsDiff();
    return res.json(result);
  }
  catch (error) {
    console.log('[/v3/stats/diff/global] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/diff/country Diff country stats
 * @apiName FetchCountryStatsDifferenceBetweenDays
 * @apiGroup Stats
 * @apiVersion 3.0.0
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
router.get('/diff/country', cacheCheck, cache.route(), asyncHandler(async function(req, res, next) {
  const { countryCode } = req.query;
  try {
    // console.log('diff/country');

    if (!countryCode) {
      return res.json('Invalid countryCode. countryCode is required.');
    }

    const results = await getCountryStatsDiff(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/v3/stats/diff/country] error', error);
    return res.json(error);
  }
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
// console.log('bno getStatsByAggregateDataFilterByCountry:'+countryCode);
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

async function getTotalTrendingCases() {
  const conn = db.conn.promise();
  let query = `
  SELECT total_cases AS totalConfirmed, total_deaths as totalDeaths, total_recovered as totalRecovered, last_updated as lastUpdated
  FROM worldometers_total_sum_temp
  GROUP BY date(last_updated)
  ORDER BY last_updated DESC;
`;

  let result = await conn.query(query);

  return result[0];
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
    art_updated,
   DATE_ADD(art_updated,
   INTERVAL 1 DAY) AS minusDate
  FROM
   bno
   where time(art_updated) = (
     Select max(time(art_updated))
     from bno
   )
 )
 SELECT
  c.country_code as countryCode,
  a.country,
  cast(a.cases as signed) as todayConfirmed,
  cast(b.cases as signed) ytdConfirmed,
  cast((a.cases - b.cases) as signed) as diffConfirmed,
  CASE 
     WHEN (a.cases - b.cases) / (a.cases + b.cases) * 100 is NULL THEN 0
     ELSE (a.cases - b.cases) / (a.cases + b.cases) * 100
   END AS pctDiffconfirmed,
   cast(a.deaths as signed) as todayDeaths,
    cast(b.deaths as signed) ytdDeaths,
  (a.deaths - b.deaths) as diffDeaths,
  cast(CASE 
     WHEN a.recovered = '-' THEN 0
     WHEN a.recovered = '' THEN 0
     ELSE a.recovered 
   END as signed) AS todayRecovered,
   cast(CASE 
     WHEN b.recovered = '-' THEN 0
     WHEN b.recovered = '' THEN 0
     ELSE b.recovered 
   END as signed) AS ytdRecovered,
  (a.recovered - b.recovered) as diffRecovered,
  a.deaths / (a.cases + b.cases) * 100 as tdyFR,
  b.deaths / b.cases * 100 as ytdFR,
  a.recovered/(a.cases + b.cases) * 100 as tdyPR,
  b.recovered/b.cases * 100 as ytdPR,
  a.art_updated as today,
  b.art_updated as ytd
 FROM
  bno a,
  bno2 b
  ,apps_countries c
 WHERE
  DATE(a.art_updated) = DATE(b.minusDate)
  and a.country = b.country
  and time(a.art_updated) = (
     Select max(time(art_updated))
     from bno
   )
  and a.country = c.country_alias
  group by a.country, a.art_updated
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
    art_updated,
   DATE_ADD(art_updated,
   INTERVAL 1 DAY) AS minusDate
  FROM
   bno
   where time(art_updated) = (
     Select max(time(art_updated))
     from bno
   )
 )
 SELECT
  c.country_code as countryCode,
  a.country,
  cast(a.cases as signed) as todayConfirmed,
  cast(b.cases as signed) ytdConfirmed,
  cast((a.cases - b.cases) as signed) as diffConfirmed,
  CASE 
     WHEN (a.cases - b.cases) / (a.cases + b.cases) * 100 is NULL THEN 0
     ELSE (a.cases - b.cases) / (a.cases + b.cases) * 100
   END AS pctDiffconfirmed,
   cast(a.deaths as signed) as todayDeaths,
    cast(b.deaths as signed) ytdDeaths,
  (a.deaths - b.deaths) as diffDeaths,
  cast(CASE 
     WHEN a.recovered = '-' THEN 0
     WHEN a.recovered = '' THEN 0
     ELSE a.recovered 
   END as signed) AS todayRecovered,
   cast(CASE 
     WHEN b.recovered = '-' THEN 0
     WHEN b.recovered = '' THEN 0
     ELSE b.recovered 
   END as signed) AS ytdRecovered,
  (a.recovered - b.recovered) as diffRecovered,
  a.deaths / (a.cases + b.cases) * 100 as tdyFR,
  b.deaths / b.cases * 100 as ytdFR,
  a.recovered/(a.cases + b.cases) * 100 as tdyPR,
  b.recovered/b.cases * 100 as ytdPR,
  a.art_updated as today,
  b.art_updated as ytd
 FROM
  bno a,
  bno2 b
  ,apps_countries c
 WHERE
  DATE(a.art_updated) = DATE(b.minusDate)
  and a.country = b.country
  and c.country_code = ?
  and time(a.art_updated) = (
     Select max(time(art_updated))
     from bno
   )
  and a.country = c.country_alias
  group by a.country, a.art_updated
 ORDER BY
  a.art_updated desc, a.country
  limit 1
`;
  const args = [countryCode];
  let result = await conn.query(query, args);
  //const result = await conn.query(query);
  return result[0][0];
}

module.exports = router;
