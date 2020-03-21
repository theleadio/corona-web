const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const analyticsRouter = require('./routes/analytics');
const healthcareInstitutionRouter = require('./routes/healthcareInstitution');
const indexRouter = require('./routes/index');
const newsRouter = require('./routes/news');
const statsRouter = require('./routes/stats');
const travelAlertRouter = require('./routes/travelAlert');
const imageProxyRouter = require('./routes/imageProxy');

const v2AnalyticsRouter = require('./routes/v2/analytics');
const v2CacheRouter = require('./routes/v2/cache');
const v2StatsRouter = require('./routes/v2/stats');
const v3StatsRouter = require('./routes/v3/stats');
const v3StatsBnoRouter = require('./routes/v3/stats/bno');
const v3StatsWorldometerRouter = require('./routes/v3/stats/worldometer');

const cors = require('cors')

const app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/v3/stats', v3StatsRouter);
app.use('/v3/stats/bno', v3StatsBnoRouter);
app.use('/v3/stats/worldometer', v3StatsWorldometerRouter);
app.use('/v2/cache', v2CacheRouter);

app.use('/image-proxy', imageProxyRouter);
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
