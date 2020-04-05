const newrelic = require('newrelic');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');

const analyticsRouter = require('./routes/analytics');
const healthcareInstitutionRouter = require('./routes/healthcareInstitution');
const indexRouter = require('./routes/index');
const newsRouter = require('./routes/news');
const statsRouter = require('./routes/stats');
const travelAlertRouter = require('./routes/travelAlert');
const imageProxyRouter = require('./routes/imageProxy');
const sharingRouter = require('./routes/sharing');

const v2AnalyticsRouter = require('./routes/v2/analytics');
const v2CacheRouter = require('./routes/v2/cache');
const v2StatsRouter = require('./routes/v2/stats');
const v3AnalyticsRouter = require('./routes/v3/analytics');
const v3StatsRouter = require('./routes/v3/stats');
const v3StatsBnoRouter = require('./routes/v3/stats/bno');
const v3StatsWorldometerRouter = require('./routes/v3/stats/worldometer');

const cors = require('cors');

const app = express();

app.use(cors());

//rate limiting
const rateLimitTimeMinutes = process.env.RATE_LIMIT_TIME_MINUTES;
const rateLimitRequests = process.env.RATE_LIMIT_REQUESTS;
const whitelist = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [];

if (rateLimitTimeMinutes && rateLimitRequests) {
  app.use(rateLimit({
    windowMs: parseInt(rateLimitTimeMinutes) * 60 * 1000,
    max: parseInt(rateLimitRequests),
    skip: function(req) {
      //should be happening automatically w/ trust proxy setting below - keeping for reference only
      //let ip = (req.headers['x-real-ip'] || req.connection.remoteAddress) || req.ip;

      //skipping whitelisted and internal IP's
      let ip = req.ip;
      return !ip || ip === '::1' || whitelist.indexOf(ip) > -1;
    },
    onLimitReached: function(req) {
      console.log('limit reached: ' + req.ip + ', all headers: ' + JSON.stringify(req.headers));
    }
  }));

  // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev', {
  skip: function(req, res) { return res.statusCode < 400 }
}));

app.use('/', indexRouter);
app.use('/news', newsRouter);
app.use('/stats', statsRouter);
app.use('/analytics', analyticsRouter);

app.use('/v1/news', newsRouter);
app.use('/v1/healthcare-institution', healthcareInstitutionRouter);
app.use('/v1/stats', statsRouter);
app.use('/v1/travel-alert', travelAlertRouter);
app.use('/v1/analytics', analyticsRouter);

app.use('/v2/analytics', v2AnalyticsRouter);
app.use('/v2/stats', v2StatsRouter);
app.use('/v3/analytics', v3AnalyticsRouter);
app.use('/v3/stats', v3StatsRouter);
app.use('/v3/stats/bno', v3StatsBnoRouter);
app.use('/v3/stats/worldometer', v3StatsWorldometerRouter);
app.use('/v2/cache', v2CacheRouter);

app.use('/image-proxy', imageProxyRouter);
app.use('/sharing', sharingRouter);
app.use('/doc', express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log('[ERROR]', err.message);

  // render the error page
  const status = err.status || 500;
  res.status(status);
  // res.render('error');
  res.json({ status, message: 'An error has occurred.' })
});

module.exports = app;
