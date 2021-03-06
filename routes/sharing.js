const express = require('express');
const path = require('path');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const cache = require('../system/redis-cache');
const puppeteer = require('puppeteer');

const cacheExpiry = 2592000000; // 30 days in milliseconds
router.get('/globalStatsToday', cache.route({
  expire: {
    '2xx': cacheExpiry,
    '3xx': cacheExpiry,
    'xxx': 1000,
  },
}), asyncHandler(async function (req, res, next) {
  try {
    //get screenshot binary
    const image = await getScreenshot(
      process.env.SITE_URL + '/share/global-stats-today',
      { width: 1337, height: 700 }
    );

    if (!image) {
      return res.sendFile(path.resolve('assets', 'og-corona.png'));
    }

    //return screenshot
    res.contentType('image/jpeg');
    res.send(image);
  }
  catch (error) {
    console.log('[/sharing/globalStats] error', error);
    return res.json(error);
  }
}));

router.get('/countryStatsToday', cache.route({
  expire: {
    '2xx': cacheExpiry,
    '3xx': cacheExpiry,
    'xxx': 1000,
  },
}), asyncHandler(async function (req, res, next) {
  try {
    const { countryCode } = req.query;

    //get screenshot binary
    const image = await getScreenshot(
      process.env.SITE_URL + '/share/country-stats-today/' + countryCode,
      { width: 720, height: 375 }
    );

    console.log("image:", image);

    if (!image) {
      return res.sendFile(path.resolve('assets', 'og-corona.png'));
    }

    //return screenshot
    res.contentType('image/jpeg');
    res.send(image);
  }
  catch (error) {
    console.log('[/sharing/globalStats] error', error);
    return res.json(error);
  }
}));

router.get('/countryStatsRecent', cache.route({
  expire: {
    '2xx': cacheExpiry,
    '3xx': cacheExpiry,
    'xxx': 1000,
  },
}), asyncHandler(async function (req, res, next) {
  try {
    const { countryCode } = req.query;

    //get screenshot binary
    const image = await getScreenshot(
      process.env.SITE_URL + '/share/country-stats-recent/' + countryCode,
      { width: 984, height: 515 }
    );

    if (!image) {
      return res.sendFile(path.resolve('assets', 'og-corona.png'));
    }

    //return screenshot
    res.contentType('image/jpeg');
    res.send(image);
  }
  catch (error) {
    console.log('[/sharing/globalStats] error', error);
    return res.json(error);
  }
}));

async function getScreenshot(url, viewport) {
  console.log('getScreenshot: ' + url);
  //load puppeteer
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  //try to load the page
  await page.setViewport(viewport);

  let image = null;

  const response = await page.goto(url, { waitUntil: 'networkidle0' }); //waits until network calls are done, +500ms
  if (response.status() < 400) {
    image = await page.screenshot({ type: 'jpeg' });
  }

  await page.close();
  await browser.close();

  //return screenshot data
  return image;
}

module.exports = router;
