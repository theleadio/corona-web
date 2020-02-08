var cache = require('express-redis-cache')({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  expire: process.env.REDIS_EXPIRE || 60,
});

cache.on('error', function(error) {
  console.error('cache error:', error);
});

module.exports = cache;
