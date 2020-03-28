const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const cache = require('../system/redis-cache');
const puppeteer = require('puppeteer');

router.get('/globalStatsToday', cache.route(), asyncHandler(async function (req, res, next) {
  try {
    //get screenshot binary
    //TODO: use correct path
    const image = await getScreenshot(
      process.env.SITE_URL + '/iframe/live-stats',
      { width: 480, height: 350 }
    );

    //return screenshot
    res.contentType('image/jpeg');
    res.send(image);
  }
  catch (error) {
    console.log('[/sharing/globalStats] error', error);
    return res.json(error);
  }
}));

router.get('/countryStatsToday', cache.route(), asyncHandler(async function (req, res, next) {
  try {
    const { countryCode } = req.query;

    //get screenshot binary
    //TODO: use correct path
    const image = await getScreenshot(
      process.env.SITE_URL + '/iframe/live-stats',
      { width: 480, height: 350 }
    );

    //return screenshot
    res.contentType('image/jpeg');
    res.send(image);
  }
  catch (error) {
    console.log('[/sharing/globalStats] error', error);
    return res.json(error);
  }
}));

router.get('/countryStatsRecent', cache.route(), asyncHandler(async function (req, res, next) {
  try {
    const { countryCode } = req.query;

    //get screenshot binary
    //TODO: use correct path
    const image = await getScreenshot(
      process.env.SITE_URL + '/iframe/live-stats',
      { width: 480, height: 350 }
    );

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
  //load puppeteer
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  //try to load the page
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: 'networkidle0' }); //waits until network calls are done, +500ms
  const image = await page.screenshot({ type: 'jpeg' });

  await page.close();
  await browser.close();

  //return screenshot data
  return image;
}

module.exports = router;
