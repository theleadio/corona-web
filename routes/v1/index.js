/**
 * This file contains all the routes and corresponding handlers for /v1
 * Please create a /v2 directory in routes/ if you're working on v2 etc
 * @see https://stackoverflow.com/questions/46783270/expressjs-best-way-to-add-prefix-versioning-routes/46783520#46783520
 */
const express = require('express');
const news = require('./news');
const stats = require('./stats');
const users = require('./users');

const router = express.Router();

router.use('/news', news);
router.use('/stats', stats)
router.use('/users', users)

module.exports = router;
