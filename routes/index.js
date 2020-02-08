const express = require('express');
const router = express.Router();
const cache = require('../system/redis-cache');
const asyncHandler = require("express-async-handler");
const db = require('../system/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/health', function(req, res, next) {
  return res.json({ status: 'OK' });
});

router.get('/timestamp', function(req, res, next) {
  return res.json({ timestamp: new Date().getTime() });
});

router.get('/timestamp-cache', cache.route(), function(req, res, next) {
  return res.json({ timestamp: new Date().getTime() });
});

router.get('/countries', cache.route(), asyncHandler(async function(req, res, next) {
  const conn = db.conn.promise();
  let query = 'SELECT country_code, country_name, latitude + 0.0 AS latitude, longitude + 0.0 AS longitude FROM apps_countries';
  let result = await conn.query(query);

  return res.json(result[0]);
}));

module.exports = router;
