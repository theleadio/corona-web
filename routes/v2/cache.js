const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const cache = require('../../system/redis-cache');

/**
 * @api {get} /v2/cache/clear
 * @apiName ClearCache
 * @apiGroup Cache
 * @apiParam {String} [key] Optional cache key to clear.
 */
router.get('/clear', asyncHandler(async function (req, res, next) {
  if (!cache.connected) {
    return res.json({ connected: false });
  }

  const { key = '*' } = req.query;

  cache.del(key, function(err, number) {
    if (err) {
      return res.json({ error: err });
    }

    return res.json({ success: true, numberCleared: number });
  });
}));

module.exports = router;
