const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../../system/database');
const cache = require('../../system/redis-cache');
const { getCustomStats, fetchDataFromGoogleSheet } = require('../../services/customStats');
const { getStatsWithCountryDetail } = require('../../services/statsService');
const { cacheCheck } = require('../../services/cacheMiddleware');

 /**
 * @api {get} /v3/stats/bno
 * @apiName worldometer
 * @apiGroup Worldometer stats
 * @apiVersion 2.0.0
 * @apiDescription Returns worldometer stats
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
router.get('/worldometer', cacheCheck, asyncHandler(async function(req, res, next) {
  try {
    const result = await getWorldometer();
    return res.json(result);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

 /**
 * @api {get} /v3/stats/bno/daily_cases
 * @apiName daily_cases
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription Return a list of countries and the daily cases for each country
 * @apiParam
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "AD",
    "country": "Andorra",
    "dailyConfirmed": 14,
    "ytdDailyConfirmed": 14,
    "diffDailyConfirmed": 0,
    "pctDiffconfirmed": 0,
    "dailyDeaths": 0,
    "ytdDailyDeaths": 0,
    "diffDailyDeaths": 0,
    "todayRecovered": 0,
    "ytdRecovered": 0,
    "diffDailyRecovered": 0,
    "tdyFR": 0,
    "ytdFR": 0,
    "tdyPR": 0,
    "ytdPR": 0,
    "today": "2020-03-17T23:50:05.000Z",
    "ytd": "2020-03-16T23:50:05.000Z"
  }
]
 */
router.get('/daily_cases', cacheCheck, asyncHandler(async function(req, res, next) {

  try {
    const results = await getDailyCases();
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/bno/daily_cases/country?countryCode=sg
 * @apiName daily_cases/country
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription Return a country and the daily cases for the country
 * @apiParam {String} [countryCode=sg]
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "countryCode": "SG",
  "country": "Singapore",
  "dailyConfirmed": 200,
  "ytdDailyConfirmed": 178,
  "diffDailyConfirmed": 22,
  "pctDiffconfirmed": 5.82010582010582,
  "dailyDeaths": 0,
  "ytdDailyDeaths": 0,
  "diffDailyDeaths": 0,
  "todayRecovered": 97,
  "ytdRecovered": 96,
  "diffDailyRecovered": 1,
  "tdyFR": 0,
  "ytdFR": 0,
  "tdyPR": 25.66137566137566,
  "ytdPR": 53.93258426966292,
  "today": "2020-03-13T23:50:05.000Z",
  "ytd": "2020-03-12T23:50:05.000Z"
}
 */
router.get('/daily_cases/country', cacheCheck, asyncHandler(async function(req, res, next) {
  const { countryCode } = req.query;
  try {
    const results = await getDailyCasesByCountry(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/bno/total_daily_cases/country?countryCode=sg
 * @apiName total_daily_cases/country
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription Return a country and the total daily cases for the country
 * @apiParam {String} [countryCode=my]
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "countryCode": "MY",
  "countryName": "Malaysia",
  "confirmed": 673,
  "deaths": 2,
  "recovered": 49,
  "critical": 0,
  "serious": 12,
  "activeCases": 624,
  "created": "2020-03-18T03:35:05.000Z"
}
 */
router.get('/total_daily_cases/country', cacheCheck, asyncHandler(async function(req, res, next) {
  const { countryCode } = req.query;
  try {
    const results = await getTotalDailyCasesByCountry(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /v3/stats/bno/total_daily_cases
 * @apiName total_daily_cases
 * @apiGroup Stats
 * @apiVersion 3.0.0
 * @apiDescription Return a list of countries and the total daily cases for each country
 * @apiParam
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
[
  {
    "countryCode": "TR",
    "countryName": "Turkey",
    "confirmed": 98,
    "deaths": 1,
    "recovered": 0,
    "critical": 0,
    "serious": 0,
    "activeCases": 98,
    "created": "2020-03-18T03:35:05.000Z"
  }
]
 */
router.get('/total_daily_cases', cacheCheck, asyncHandler(async function(req, res, next) {

  try {
    const results = await getTotalDailyCases();
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
    return res.json(error);
  }
}));

router.get('/diff/country', cacheCheck, asyncHandler(async function(req, res, next) {
  const { countryCode } = req.query;
  try {
    console.log('diff/country');
    const results = await getCountryStatsDiff(countryCode);
    return res.json(results);
  }
  catch (error) {
    console.log('[/stats] error', error);
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

async function getDailyCases() {
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
   cast(a.cases as signed) as dailyConfirmed,
   cast(b.cases as signed) as ytdDailyConfirmed,
   (a.cases - b.cases) as diffDailyConfirmed,
   CASE 
         WHEN (a.cases - b.cases) / (a.cases + b.cases) * 100 is NULL THEN 0
         ELSE (a.cases - b.cases) / (a.cases + b.cases) * 100
     END AS pctDiffconfirmed,
   cast(a.deaths as signed) as dailyDeaths,
   cast(b.deaths as signed) as ytdDailyDeaths,
   (a.deaths - b.deaths) as diffDailyDeaths,
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
   (a.recovered - b.recovered) as diffDailyRecovered,
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
   group by a.country,a.art_updated
 ORDER BY
   a.art_updated desc, a.country
`;
  let result = await conn.query(query);
  //const result = await conn.query(query);
  return result[0];
}

async function getWorldometer() {
  const conn = db.conn.promise();
  let query = `SELECT ac.country_code as countryCode,
  tt.country, 
  tt.total_cases AS totalConfirmed, 
  tt.total_deaths as totalDeaths, 
  tt.total_recovered as totalRecovered,
  tt.new_cases AS dailyConfirmed, 
  tt.new_deaths AS dailyDeaths, 
  tt.active_cases as activeCases, 
  tt.serious_critical_cases AS totalCritical, 
  CAST(tt.total_cases_per_million_pop AS UNSIGNED) AS totalConfirmedPerMillionPopulation,
  (tt.total_deaths / tt.total_cases * 100) AS FR,
  (tt.total_recovered / tt.total_cases * 100) AS PR,
  tt.last_updated as lastUpdated
        FROM worldometers tt INNER JOIN (
            SELECT country,
            max(last_updated) AS MaxDateTime
            FROM worldometers tt 
            where country not in ("Sint Maarten","Congo")
           GROUP BY country) groupedtt
      ON tt.country = groupedtt.country
       AND tt.last_updated = groupedtt.MaxDateTime
      left JOIN (Select country_name, country_code, country_alias from apps_countries) AS ac on tt.country = ac.country_alias
      group by tt.country
      order by tt.total_cases DESC`;
  let result = await conn.query(query);
  //const result = await conn.query(query);
  return result[0];
}

async function getDailyCasesByCountry(countryCode) {
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
   cast(a.cases as signed) as dailyConfirmed,
   cast(b.cases as signed) as ytdDailyConfirmed,
   (a.cases - b.cases) as diffDailyConfirmed,
   CASE 
         WHEN (a.cases - b.cases) / (a.cases + b.cases) * 100 is NULL THEN 0
         ELSE (a.cases - b.cases) / (a.cases + b.cases) * 100
     END AS pctDiffconfirmed,
   cast(a.deaths as signed) as dailyDeaths,
   cast(b.deaths as signed) as ytdDailyDeaths,
   (a.deaths - b.deaths) as diffDailyDeaths,
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
   (a.recovered - b.recovered) as diffDailyRecovered,
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
   and c.country_code = ?
   group by a.country,a.art_updated
 ORDER BY
   a.art_updated desc, a.country
`;
  const args = [countryCode];
  let result = await conn.query(query, args);
  //const result = await conn.query(query);
  return result[0][0];
}

async function getTotalDailyCases() {
  const conn = db.conn.promise();
  let query = `
  SELECT ac.country_code as countryCode,
  tt.country as countryName, cast(tt.cases as unsigned) as confirmed, cast(tt.deaths as unsigned) as deaths,
      cast(CASE 
        WHEN tt.recovered = '-' THEN 0
        WHEN tt.recovered = '' THEN 0
        ELSE tt.recovered 
      END as unsigned) AS recovered,
      cast(CASE 
          WHEN tt.critical = '-' THEN 0
          WHEN tt.critical = '' THEN 0
          ELSE tt.critical 
      END as unsigned) AS critical,
      cast(CASE 
        WHEN tt.serious = '-' THEN 0
        WHEN tt.serious = '' THEN 0
        ELSE tt.serious 
      END as unsigned) AS serious,
      CAST((tt.cases - tt.recovered) AS UNSIGNED) AS activeCases,
  tt.art_updated as created
      FROM bno tt INNER JOIN (
        SELECT country,
        max(art_updated) AS MaxDateTime
        FROM bno
        where country not in ("Mainland China","Denmark*", "UAE")
        GROUP BY country) groupedtt
      ON tt.country = groupedtt.country
      AND tt.art_updated = groupedtt.MaxDateTime
      left JOIN (Select country_name, country_code from apps_countries) ac on tt.country = ac.country_name
      group by tt.country
      order by tt.country
`;
  //const args = [countryCode];
  let result = await conn.query(query);
  //const result = await conn.query(query);
  return result[0];
}

async function getTotalDailyCasesByCountry(countryCode) {
  const conn = db.conn.promise();
  let query = `
  SELECT ac.country_code as countryCode,
tt.country as countryName, cast(tt.cases as unsigned) as confirmed, cast(tt.deaths as unsigned) as deaths,
    cast(CASE 
      WHEN tt.recovered = '-' THEN 0
      WHEN tt.recovered = '' THEN 0
      ELSE tt.recovered 
    END as unsigned) AS recovered,
    cast(CASE 
        WHEN tt.critical = '-' THEN 0
        WHEN tt.critical = '' THEN 0
        ELSE tt.critical 
    END as unsigned) AS critical,
    cast(CASE 
      WHEN tt.serious = '-' THEN 0
      WHEN tt.serious = '' THEN 0
      ELSE tt.serious 
    END as unsigned) AS serious,
    CAST((tt.cases - tt.recovered) AS UNSIGNED) AS activeCases,
tt.art_updated as created
		FROM bno tt INNER JOIN (
			SELECT country,
			max(art_updated) AS MaxDateTime
			FROM bno
      where country not in ("Mainland China","Denmark*", "UAE")
			GROUP BY country) groupedtt
		ON tt.country = groupedtt.country
		AND tt.art_updated = groupedtt.MaxDateTime
    left JOIN (Select country_name, country_code from apps_countries) ac on tt.country = ac.country_name
    where ac.country_code = ?
		group by tt.country
		order by tt.country
`;
  const args = [countryCode];
  let result = await conn.query(query, args);
  //const result = await conn.query(query);
  return result[0][0];
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