var options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: (process.env.REDIS_PORT && parseInt(process.env.REDIS_PORT)) || 6379,
  expire: (process.env.REDIS_EXPIRE && parseInt(process.env.REDIS_EXPIRE)) || 60,
};

if (process.env.REDIS_AUTH_PASS) {
  options.auth_pass = process.env.REDIS_AUTH_PASS;
}

var cache = require('express-redis-cache')(options);

cache.on('error', function(error) {
  console.error('cache error:', error);
});

module.exports = cache;
