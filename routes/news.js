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
router.get('/', async function(req, res, next) {
  const { limit, offset, sort, q } = req.query;
  try {
    const results = await getNews({ limit, offset, sort, q });
    return res.json(results);
  }
  catch (error) {
    console.log('[/news] error', error);
    return res.json(error);
  }
});

async function getNews({ limit = 10, offset = 0, sort , q }) {
  limit = parseInt(limit);
  offset = parseInt(limit);

  const conn = db.conn.promise();

  let query = "SELECT * FROM newsapi ";
  let args = [];

  if (q) {
    query += ` WHERE description LIKE %?% `;
    args.push(q);
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

    query += ` ORDER BY ${conn.escapeId(field)} ${direction}`;
  }

  if (limit) {
    query += ` LIMIT ? `;
    args.push(limit);
  }

  if (offset) {
    query += ` OFFSET ? `;
    args.push(offset);
  }

  query += ';';

  let result = await conn.query(query, args);
  return result[0];
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
        let query = await conn.execute("SELECT * FROM news" + limit_query, args_query);
        let result = query[0];
        res.json(result);

    } catch (ex) {
        res.json({ status: 'error', message: ex.message });
    }
}));

module.exports = router;
