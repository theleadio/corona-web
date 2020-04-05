const db = require('../system/database');
const { getCustomStats } = require('./customStats');
const moment = require('moment')

/**
 * Returns array of object with following keys:
 * - countryCode
 * - countryName
 * - lat
 * - lng
 * - confirmed,
 * - deaths,
 * - recovered,
 * - created
 * @param limit
 * @returns {Promise<*>}
 */
async function getStatsWithCountryDetail(limit = 999, date = null) {
  limit = parseInt(limit);

  const conn = db.conn.promise();
  const args = [];

  let dateQuery = '(SELECT MAX(posted_date) FROM arcgis)'
  if (date) {
    const dateFrom = moment(date).format('YYYY-MM-DD')
    const dateTo = moment(date).add(1, 'day').format('YYYY-MM-DD')
    dateQuery = `(SELECT MAX(posted_date) FROM arcgis WHERE posted_date >= ? and posted_date < ?)`
    args.push(dateFrom, dateTo)
  }

  const query = `
SELECT
  AC.country_code AS countryCode,
  IFNULL(AC.country_name, A.country) AS countryName,
  AC.latitude + 0.0 AS lat,
  AC.longitude + 0.0 AS lng,
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
  AND A.posted_date = ${dateQuery}
GROUP BY
  A.country, A.posted_date
ORDER BY
  confirmed DESC, recovered DESC`;

  let result = await conn.query(query, args);
  const data = result[0];

  try {
    const customStats = await getCustomStats();

    let overriddenData = [];
    if(date) {
      overriddenData = data;
    }
    else {
      overriddenData = data.map(d => {
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
    }

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
    console.log("[getStatsWithCountryDetail] error:", e);
    return data;
  }
}

/**
 * Returns array of object with following keys:
 * - countryCode
 * - country
 * - totalConfirmed
 * - totalDeaths
 * - totalRecovered
 * - dailyConfirmed
 * - dailyDeaths
 * - activeCases
 * - totalCritical
 * - totalConfirmedPerMillionPopulation
 * - totalDeathsPerMillionPopulation
 * - FR
 * - PR
 * - lastUpdated
 * @param countryCode
 * @param limit
 * @param date
 * @param orderBy
 * @param isDescending
 * @returns {Promise<*>}
 */
async function getCountryStats(countryCode=null, limit=999, date=null, orderBy='', isDescending=true) {
  if (countryCode) {
    const data = await getCountryStatsByCountryCode(countryCode);
    return [data];
  }

  const conn = db.conn.promise();
  let countryCodeQuery = ''
  let args = []
  let getAllFlag = true
  let dateQuery = ''
  let orderByQuery = 'ORDER BY ? ?';

  if (date) {
    const dateFrom = moment(date).format('YYYY-MM-DD')
    const dateTo = moment(date).add(1, 'day').format('YYYY-MM-DD')
    dateQuery = `AND last_updated >= ? and last_updated < ?`
    args.push(dateFrom, dateTo)
  }

  if (countryCode) {
    countryCodeQuery = 'WHERE ac.country_code=?'
    args.push(countryCode)
    getAllFlag = false
  }

  if (orderBy && orderBy.trim() !== '') {
    const orderByMap = {
      'confirmed': 'tt.total_cases',
      'recovered': 'tt.total_recovered',
      'deaths': 'tt.total_deaths'
    };

    if (orderByMap[orderBy.toLowerCase()]) {
      const sortOrder = (isDescending) ? "DESC" : "ASC";
      args.push(orderByMap[orderBy.toLowerCase()], sortOrder);
    }
    else {
      args.push(orderByMap['confirmed'], "DESC");
    }
  }
  else {
    args.push(orderByMap['confirmed'], "DESC");
  }

  args.push(limit)

  let query = `
  SELECT
  ac.country_code AS countryCode,
  tt.country,
  ac.latitude + 0.0 AS lat,
  ac.longitude + 0.0 AS lng,
  tt.total_cases AS totalConfirmed,
  tt.total_deaths AS totalDeaths,
  tt.total_recovered AS totalRecovered,
  tt.new_cases AS dailyConfirmed,
  tt.new_deaths AS dailyDeaths,
  tt.active_cases AS activeCases,
  tt.serious_critical_cases AS totalCritical,
  CAST(tt.total_cases_per_million_pop AS UNSIGNED) AS totalConfirmedPerMillionPopulation,
  CAST(tt.total_deaths_per_million_pop AS UNSIGNED) AS totalDeathsPerMillionPopulation,
  (tt.total_deaths / tt.total_cases * 100) AS FR,
  (tt.total_recovered / tt.total_cases * 100) AS PR,
  tt.last_updated AS lastUpdated
  FROM worldometers tt
  INNER JOIN
  (
    SELECT country,
    max(last_updated) AS MaxDateTime
    FROM worldometers tt
    WHERE country NOT in ("Sint Maarten","Congo", "South Korea", "Czechia Republic", "Czech Republic", "Others")
    ${dateQuery}
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
  ${countryCodeQuery}
  GROUP BY tt.country
  ${orderByQuery}
  LIMIT ?`;

  let result = await conn.query(query, args);
  const data = result[0]
  const updatedData = updateCountryDetailStatsWithCustomStats(data, limit, getAllFlag)
  return updatedData
}

async function getCountryStatsByCountryCode(countryCode) {
  if (!countryCode) {
    throw new Error('countryCode is required.');
  }

  const conn = db.conn.promise();
  const query = `
SELECT
  ac.country_code AS countryCode,
  tt.country,
  ac.latitude + 0.0 AS lat,
  ac.longitude + 0.0 AS lng,
  tt.total_cases AS totalConfirmed,
  tt.total_deaths AS totalDeaths,
  tt.total_recovered AS totalRecovered,
  tt.new_cases AS dailyConfirmed,
  tt.new_deaths AS dailyDeaths,
  tt.active_cases AS activeCases,
  tt.serious_critical_cases AS totalCritical,
  CAST(tt.total_cases_per_million_pop AS UNSIGNED) AS totalConfirmedPerMillionPopulation,
  CAST(tt.total_deaths_per_million_pop AS UNSIGNED) AS totalDeathsPerMillionPopulation,
  (tt.total_deaths / tt.total_cases * 100) AS FR,
  (tt.total_recovered / tt.total_cases * 100) AS PR,
  tt.last_updated AS lastUpdated
FROM
  worldometers tt
INNER JOIN
  apps_countries ac ON ac.country_alias = tt.country AND ac.country_code = ?
ORDER BY
  last_updated DESC
LIMIT 1
`;

  const args = [countryCode];
  const result = await conn.query(query, args);
  const data = result[0][0];

  let customStats;
  try {
    customStats = await getCustomStats();
  }
  catch (ex) {
    console.log("[getCountryStatsByCountryCode][customStats] error:", ex);
    return data;
  }

  const countryCodeLowerCase = countryCode.toLowerCase();
  const customCountryStat = customStats.find(c => c.countryCode && c.countryCode.toLowerCase() === countryCodeLowerCase);

  if (!customCountryStat) {
    return data;
  }

  return {
    ...data,
    totalConfirmed: Math.max(data.totalConfirmed, customCountryStat.confirmed),
    totalDeaths: Math.max(data.totalDeaths, customCountryStat.deaths),
    totalRecovered: Math.max(data.totalRecovered, customCountryStat.recovered),
  }
}

async function updateCountryDetailStatsWithCustomStats(data, limit=999, getAllFlag=true) {
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

        if (!overriddenData.find(d => d.countryCode && d.countryCode.toLowerCase() === cs.countryCode.toLowerCase())) {
          overriddenData.push({
            countryCode: cs.countryCode,
            country: cs.countryName,
            lat: cs.lat || 0,
            lng: cs.lng || 0,
            totalConfirmed: cs.confirmed || 0,
            totalDeaths: cs.deaths || 0,
            totalRecovered: cs.recovered || 0,
            dailyConfirmed: cs.dailyConfirmed || 0,
            dailyDeaths: cs.dailyDeaths || 0,
            activeCases: cs.activeCases || 0,
            totalCritical: cs.totalCritical || 0,
            totalConfirmedPerMillionPopulation: cs.totalConfirmedPerMillionPopulation || 0,
            totalDeathsPerMillionPopulation: cs.totalDeathsPerMillionPopulation || 0,
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
    console.log("[updateCountryDetailStatsWithCustomStats] error:", e);
    return data;
  }
}

module.exports = {
  getStatsWithCountryDetail,
  getCountryStats,
};