function cacheCheck(req, res, next) {
  // Disable cache if there is nocache in the query parameter.
  res.use_express_redis_cache = !req.query.nocache;

  next();
}

module.exports = {
  cacheCheck,
};