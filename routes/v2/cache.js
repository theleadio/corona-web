const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const cache = require('../../system/redis-cache');

/**
 * @api {get} /v2/cache/clear Clear cache
 * @apiName ClearCache
 * @apiGroup Cache
 * @apiDescription Endpoint to clear redis cache
 * @apiParam {String} [key] Optional cache key to clear.
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "success": true,
  "numberCleared": 25
}
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
