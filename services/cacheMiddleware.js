function cacheCheck(req, res, next) {
  const adminSecretKey = process.env.ADMIN_SECRET_KEY;

  if (!adminSecretKey) {
    return next();
  }

  const { secretKey } = req.query;

  if (!secretKey || secretKey !== adminSecretKey) {
    return next();
  }

  // Disable cache if there is nocache in the query parameter.
  res.use_express_redis_cache = !req.query.nocache;

  next();
}

module.exports = {
  cacheCheck,
};