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

    const overriddenData = [];
    if(date) {
      overriddenData.push(...data);
    }
    else {
      overriddenData.push(...data.map(d => {
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
      }));

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

module.exports = {
  getStatsWithCountryDetail,
};