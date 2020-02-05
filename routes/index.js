const express = require('express');
const router = express.Router();
const cache = require('../system/redis-cache');

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

module.exports = router;
