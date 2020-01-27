const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');

/**
 * Example sort:
 * -publishedAt: ORDER BY publishedAt DESC
 * +publishedAt: ORDER BY publishedAt ASC
 * publishedAt: ORDER BY publishedAt ASC
 */
router.get('/', asyncHandler(async function(req, res, next) {
  const { limit, offset, country, sort, q } = req.query;
  try {
    const results = await getNews({ limit, offset, country, sort, q });
    return res.json(results);
  }
  catch (error) {
    console.log('[/news] error', error);
    return res.json(error);
  }
}));

router.get('/trending', asyncHandler(async function(req, res, next) {
  const { limit = 9, offset, country } = req.query;
  try {
    const items = await getNews({ limit, offset, country, sort: '-nid' });
    const total = await getNewsCount({ country });
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

async function getNews({ limit = 10, offset = 0, country, sort , q }) {
  limit = parseInt(limit);
  offset = parseInt(offset);

  const conn = db.conn.promise();

  const args = [];
  let whereClause ='';
  let whereConditions =[];
  let havingClause = '';
  let orderByClause = '';
  let limitOffsetClause = '';

  if (q) {
    whereConditions.push('`n.description` LIKE ? ');
    args.push(`%${q}%`);
  }

  if (whereConditions.length) {
    whereClause = ` WHERE ` + whereConditions.join(' AND ');
  }

  if (country) {
    havingClause = 'HAVING FIND_IN_SET( ? , countryCodes)';
    args.push(country);
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

async function getNewsCount({ country }) {
  const conn = db.conn.promise();
  let query = ' SELECT COUNT(*) AS total FROM newsapi_n AS n ';
  const args = [];

  if (country) {
    query += ' INNER JOIN newsapi_countries_map AS ncm ON n.nid = ncm.nid AND ncm.countryCode = ? GROUP BY n.nid';
    args.push(country);
  }

  const result = await conn.execute(query, args);
  return result[0] && result[0][0] && result[0][0].total || 0;
}

function obtainNews(page, limit) {
  let conn = db.conn;
  conn.query('SELECT * FROM news LIMIT 10', function (error, results) {
      if (error) {
          res.status(400).send('Error in database operation');
      } else {
          res.json(results);
      }
  });
}

/* GET home page. */
router.get('/:page?/:limit?', asyncHandler(async function (req, res, next) {
    try {
        let limit = req.params.limit || 10;
        let offset = req.params.page || 0;
        let page = limit * offset;

        let limit_query = req.params.limit ? " LIMIT ? OFFSET ?;" : ";";
        let args_query = req.params.limit ? [limit, page] : [];

        let conn = db.conn.promise();
        let query = await conn.execute("SELECT * FROM newsapi_n" + limit_query, args_query);
        let result = query[0];
        res.json(result);

    } catch (ex) {
        res.json({ status: 'error', message: ex.message });
    }
}));

module.exports = router;