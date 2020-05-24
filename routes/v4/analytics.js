const router = express.Router();

/**
 * @api {get} /v4/analytics/trend/country get data of a country between start and end dates
 * @apiName getTrendByCountry
 * @apiGroup Analytics
 * @apiVersion 4.0.0
 *
 * @apiParam {String} [countryCode] Required Country code
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/trend/country', cache.route(), asyncHandler(async function(req, res, next) {
  const { countryCode, startDate, endDate } = req.query;

  // Enforce date format
  if (
    moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== startDate ||
    moment(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== endDate
  ) {
    res.status(400).json('Invalid date format. Date format should be YYYY-MM-DD');
  }

  // Make sure endDate is after startDate
  if (moment(endDate).isBefore(startDate)) {
    res.status(400).json('Invalid date');
  }

  try {
    const results = await fetchTrendByCountryAndDate(countryCode, startDate, endDate);
    return res.json(results);
  } catch (error) {
    console.log('[/v4/analytics/trend/country] error', error);

    return res.json(error);
  }
}))

/**
 * @api {get} /v4/analytics/newcases/country get daily new incidences of a country between start and end dates
 * @apiName getNewCasesByCountry
 * @apiGroup Analytics
 * @apiVersion 4.0.0
 *
 * @apiParam {String} [countryCode] Required Country code
 * @apiParam {Date} [startDate] Required Start date
 * @apiParam {Date} [endDate] Required end date
 */
router.get('/newcases/country', cache.route(), asyncHandler(async function(req, res, next) {
  const { countryCode, startDate, endDate } = req.query;

  // Enforce date format
  if (
    moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== startDate ||
    moment(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD') !== endDate
  ) {
    res.status(400).json('Invalid date format. Date format should be YYYY-MM-DD')
  }

  // Make sure endDate is after startDate
  if (moment(endDate).isBefore(startDate)) {
    res.status(400).json('Invalid date')
  }

  try {
    const results = await fetchNewCasesByCountryAndDate(countryCode, startDate, endDate)
    return res.json(results)
  } catch (error) {
    console.log('[/v4/analytics/newcases/country] error:', error)

    return res.json(error)
  }
}));

async function fetchNewCasesByCountryAndDate(countryCode, startDate, endDate) {
  const result = await fetchTrendByCountryAndDate(countryCode, startDate, endDate);

  // From
  // country: "Malaysia"
  // country_code: "MY"
  // last_updated: "2020-05-11T00:00:09.000Z"
  // total_confirmed: 6726
  // total_deaths: 109
  // total_recovered: 5113

  // To
  // country: "Malaysia"
  // country_code: "MY"
  // last_updated: "2020-03-26T00:00:00.000Z"
  // new_deaths: 4
  // new_infections: 235
  // new_recovered: 16

  const newCasesResult = [];

  for (let i = 1; i < result.length; i++) {
    const yesterdayData = result[i - 1];
    const todayData = result[i];

    newCasesResult.push({
      country: todayData.country,
      country_code: todayData.country_code,
      last_updated: todayData.last_updated,
      new_deaths: todayData.total_deaths - yesterdayData.total_deaths,
      new_infections: todayData.total_confirmed - yesterdayData.total_confirmed,
      new_recovered: todayData.total_recovered - yesterdayData.total_recovered,
    });
  }

  return newCasesResult;
}

async function fetchTrendByCountryAndDate(countryCode, startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('Invalid start date or end date.');
  }

  const conn = db.conn.promise()
  let args = [startDate, endDate]

  if (!countryCode) {
    throw new Error('v4/analytics/fetchTrendByCountryAndDate - req.query.countryCode is invalid or null');
  } else {
    args.push(countryCode);
  }

  const query = `
SELECT ac.country_code,
tt.country,
MAX(tt.total_cases) AS total_confirmed,
MAX(tt.total_deaths) AS total_deaths,
MAX(tt.total_recovered) AS total_recovered,
tt.last_updated
FROM worldometers tt
INNER JOIN
(
SELECT country,
last_updated
FROM worldometers tt
where country not in ("Sint Maarten","Congo", "South Korea", "Czechia Republic", "Czech Republic", "Others")
GROUP BY country
)
groupedtt ON tt.country = groupedtt.country
LEFT JOIN
(
SELECT country_name,
country_code,
country_alias
FROM apps_countries
)
AS ac ON tt.country = ac.country_alias
WHERE tt.last_updated >= ?
AND tt.last_updated <= ?
AND ac.country_code = ?
GROUP BY date(tt.last_updated), tt.country
ORDER BY tt.last_updated ASC;`
  let result = await conn.query(query, args)
  return result[0]
}
