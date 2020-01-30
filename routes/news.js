const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');

/**
 * @api {get} /news
 * @apiName FetchNews
 * @apiGroup News
 *
 * @apiParam {Number} limit number of news to return
 * @apiParam {Number} offset number of news to skip
 * @apiParam {String} country country name to search in title/description
 * @apiParam {String} countryCode countryCode to filter news by
 * @apiParam {String} sort field name to sort news by. `-field` to sort field in descending order.
 * @apiParam {String} q text to search in description
 * @apiSuccessExample Response (example):
 *     HTTP/1.1 200 Success
      [
        {
          "nid": 1,
          "author": "BBC News",
          "title": "Road blocks and ghost towns",
          "description": "A BBC team travels into Hubei province, where the deadly new coronavirus originated.",
          "url": "https://www.bbc.co.uk/news/av/world-asia-china-51255918/china-coronavirus-road-blocks-and-ghost-towns",
          "urlToImage": "https://ichef.bbci.co.uk/news/1024/branded_news/1218D/production/_110652147_p081fsgp.jpg",
          "publishedAt": "2020-01-26T11:44:46Z",
          "content": null,
          "countryCodes": 'CN,SG'
        }
      ]
 */
router.get('/', asyncHandler(async function (req, res, next) {
  const { limit, offset, country, countryCode, sort, q } = req.query;
  try {
    const results = await getNews({ limit, offset, country, countryCode, sort, q });
    return res.json(results);
  }
  catch (error) {
    console.log('[/news] error', error);
    return res.json(error);
  }
}));

/**
 * @api {get} /news/trending
 * @apiName FetchTrendingNews
 * @apiGroup News
 *
 * @apiParam {Number} limit number of news to return
 * @apiParam {Number} offset number of news to skip
 * @apiParam {String} country country name to search in title/description
 * @apiParam {String} countryCode countryCode to filter news by
 * @apiSuccessExample Response (example):
 *     HTTP/1.1 200 Success
      [
        "total": 9
        "items": [
          {
            "nid": 1,
            "author": "BBC News",
            "title": "Road blocks and ghost towns",
            "description": "A BBC team travels into Hubei province, where the deadly new coronavirus originated.",
            "url": "https://www.bbc.co.uk/news/av/world-asia-china-51255918/china-coronavirus-road-blocks-and-ghost-towns",
            "urlToImage": "https://ichef.bbci.co.uk/news/1024/branded_news/1218D/production/_110652147_p081fsgp.jpg",
            "publishedAt": "2020-01-26T11:44:46Z",
            "content": null,
            "countryCodes": 'CN,SG'
          }
        ]
      ]
 */
router.get('/trending', asyncHandler(async function (req, res, next) {
  const { limit = 9, offset, country, countryCode, language } = req.query;
  try {
    const items = await getNews({ limit, offset, country, countryCode, language, sort: '-publishedAt' });
    const total = await getNewsCount({ country, countryCode, language });
    return res.json({
      total,
      items,
    });
  }
  catch (error) {
    console.log('[/news] error', error);
    return res.json(error);
  }
}));

async function getNews({ limit = 10, offset = 0, country, countryCode, language = 'en', sort, q }) {
  limit = parseInt(limit);
  offset = parseInt(offset);

  const conn = db.conn.promise();

  const args = [];
  let whereClause = '';
  let whereConditions = [' status = 1 '];
  let havingClause = '';
  let orderByClause = '';
  let limitOffsetClause = '';

  if (q) {
    whereConditions.push(' n.description LIKE ? ');
    args.push(`%${q}%`);
  }

  if (country) {
    whereConditions.push(' n.description LIKE ? OR n.title LIKE ?');
    args.push(`%${country}%`, `%${country}%`);
  }

  if (language) {
    const languages = language.split(',').map(a => a.trim());
    whereConditions.push(' n.language IN (?) ');
    args.push(languages);
  }

  if (whereConditions.length) {
    whereClause = ` WHERE ` + whereConditions.join(' AND ');
  }

  if (countryCode) {
    havingClause = 'HAVING FIND_IN_SET( ? , countryCodes)';
    args.push(countryCode);
  }

  if (sort) {
    let order = sort[0];
    let field = sort.substr(1);
    let direction = 'ASC';

    if (order === '+') {
      direction = 'ASC'
    }
    else if (order === '-') {
      direction = 'DESC';
    }
    else {
      direction = 'ASC'
      field = sort;
    }

    orderByClause = ` ORDER BY ${conn.escapeId(field)} ${direction}`;
  }

  if (limit) {
    limitOffsetClause += ` LIMIT ? `;
    args.push(limit);
  }

  if (offset) {
    limitOffsetClause += ` OFFSET ? `;
    args.push(offset);
  }

  let query = `
SELECT n.*, GROUP_CONCAT(ncm.countryCode) as countryCodes
FROM newsapi_n AS n 
LEFT JOIN newsapi_countries_map AS ncm 
ON n.nid = ncm.nid
${whereClause}
GROUP BY n.nid
${havingClause}
${orderByClause}
${limitOffsetClause};
`;

  let result = await conn.query(query, args);
  return result[0];
}

async function getNewsCount({ country, countryCode, language = 'en' }) {
  const conn = db.conn.promise();
  const args = [];

  let joinClause = '';
  let groupByClause = '';
  let whereClause = '';
  let whereConditions = [' status = 1 '];

  if (country) {
    whereConditions.push(' n.description LIKE ? OR n.title LIKE ? ');
    args.push(`%${country}%`, `%${country}%`);
  }

  if (language) {
    const languages = language.split(',').map(a => a.trim());
    whereConditions.push(' n.language IN (?) ');
    args.push(languages);
  }

  if (whereConditions.length) {
    whereClause = ' WHERE ' + whereConditions.join(' AND ');
  }

  if (countryCode) {
    joinClause = ' INNER JOIN newsapi_countries_map AS ncm ON n.nid = ncm.nid AND ncm.countryCode = ? ';
    groupByClause = ' GROUP BY n.nid ';
    args.push(countryCode);
  }

  let query = `
SELECT COUNT(*) AS total FROM newsapi_n AS n
${joinClause} 
${whereClause}
${groupByClause} 
`;

  const result = await conn.query(query, args);
  return result[0] && result[0][0] && result[0][0].total || 0;
}

module.exports = router;
