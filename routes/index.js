const express = require('express');
const router = express.Router();
const cache = require('../system/redis-cache');
const asyncHandler = require("express-async-handler");
const db = require('../system/database');
const { cacheCheck } = require('../services/cacheMiddleware');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * @api {get} /health Health check
 * @apiName Health
 * @apiGroup Miscellaneous
 * @apiVersion 0.0.0
 * @apiDescription Endpoint to check if the service is up.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "status": "OK"
}
 */
router.get('/health', function(req, res, next) {
  return res.json({ status: 'OK' });
});

/**
 * @api {get} /timestamp Timestamp
 * @apiName Timestamp
 * @apiGroup Miscellaneous
 * @apiVersion 0.0.0
 * @apiDescription Return current timestamp.
 * Useful for debugging redis cache together with Timestamp cache endpoint.
 * @apiSuccessExample Response (example):
{
  "timestamp": 1583419781518
}
 */
router.get('/timestamp', function(req, res, next) {
  return res.json({ timestamp: new Date().getTime() });
});

/**
 * @api {get} /timestamp-cache Timestamp cache
 * @apiName TimestampCache
 * @apiGroup Miscellaneous
 * @apiVersion 0.0.0
 * @apiDescription Endpoint to check if redis cache is working.
 * If redis cache is working, the response should return the cached timestamp.
 * Useful for debugging redis cache together with Timestamp endpoint.
 * @apiSuccessExample Response (example):
{
  "timestamp": 1583419781500
}
 */
router.get('/timestamp-cache', cacheCheck, cache.route(), function(req, res, next) {
  return res.json({ timestamp: new Date().getTime() });
});

router.get('/countries', cache.route(), asyncHandler(async function(req, res, next) {
  const conn = db.conn.promise();
  let query = 'SELECT country_code, country_name, latitude + 0.0 AS latitude, longitude + 0.0 AS longitude FROM apps_countries';
  let result = await conn.query(query);

  return res.json(result[0]);
}));

module.exports = router;
