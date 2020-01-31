const express = require('express');
const asyncHandler = require('express-async-handler');
const { countries } = require('../../constants');

const router = express.Router();

/**
 * @api {get} /countries
 * @apiName FetchCountries
 * @apiGroup Countries
 *
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
    [
      {
        "code": "global",
        "name": "Global"
      }
    ]
 */
router.get(
  '/',
  asyncHandler(async function(_, res) {
    return res.status(200).json(countries);
  })
);

module.exports = router;
