const express = require('express');
const moment = require('moment');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');
const cache = require('../system/redis-cache');

router.get('/', cache.route(), asyncHandler(async function (req, res, next) {
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
 * @api {get} /news/trending List
 * @apiName FetchTrendingNews
 * @apiGroup News
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} [limit=9] number of news to return
 * @apiParam {Number} [offset=0] number of news to skip
 * @apiParam {String} [country] country name to search in title/description
 * @apiParam {String} [countryCode] countryCode to filter news by
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
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
router.get('/trending', cache.route(), asyncHandler(async function (req, res, next) {
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
  let orConditions = [];
  let orderByClause = '';
  let limitOffsetClause = '';

  if (country) {
    orConditions.push(' n.description LIKE ? ', ' n.title LIKE ? ');
    args.push(`%${country}%`, `%${country}%`);
  }

  if (countryCode) {
    orConditions.push(' n.countryCode = ? ');
    args.push(countryCode);
  }

  if (orConditions.length) {
    whereConditions.push('(' + orConditions.join('OR') + ')');
  }

  if (q) {
    whereConditions.push(' n.description LIKE ? ');
    args.push(`%${q}%`);
  }

  if (language) {
    const languages = language.split(',').map(a => a.trim());
    whereConditions.push(' n.language IN (?) ');
    args.push(languages);
  }

  if (whereConditions.length) {
    whereClause = ` WHERE ` + whereConditions.join(' AND ');
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
SELECT *
FROM newsapi_n AS n 
${whereClause}
${orderByClause}
${limitOffsetClause};
`;

  let result = await conn.query(query, args);

  return result[0].map(result => {
    result.publishedAt = moment(result.publishedAt).utc().format();
    result.addedOn = moment(result.addedOn).utc().format();
    return result;
  });
}

async function getNewsCount({ country, countryCode, language = 'en' }) {
  const conn = db.conn.promise();
  const args = [];

  let whereClause = '';
  let whereConditions = [' status = 1 '];
  let orConditions = [];

  if (country) {
    orConditions.push(' n.description LIKE ? ', ' n.title LIKE ? ');
    args.push(`%${country}%`, `%${country}%`);
  }

  if (countryCode) {
    orConditions.push(' n.countryCode = ? ');
    args.push(countryCode);
  }

  if (orConditions.length) {
    whereConditions.push('(' + orConditions.join('OR') + ')');
  }

  if (language) {
    const languages = language.split(',').map(a => a.trim());
    whereConditions.push(' n.language IN (?) ');
    args.push(languages);
  }

  if (whereConditions.length) {
    whereClause = ' WHERE ' + whereConditions.join(' AND ');
  }

  let query = `
SELECT COUNT(*) AS total FROM newsapi_n AS n
${whereClause}
`;

  const result = await conn.query(query, args);
  return result[0] && result[0][0] && result[0][0].total || 0;
}

module.exports = router;
