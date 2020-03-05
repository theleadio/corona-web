const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const axios = require('axios');
const cache = require('../system/redis-cache');

/**
 * @api {get} /v1/healthcare-institution List
 * @apiName FetchHealthcareInstitution
 * @apiGroup Healthcare Institution
 * @apiVersion 1.0.0
 * @apiDescription Returns list of health care institutions
 * @apiSuccessExample Response (example):
 * HTTP/1.1 200 Success
{
  "hospitalsAndHealthcareProviders": [
    {
      "id": 2,
      "name": "Singapore General Hospital",
      "description": "",
      "address": "Outram Road, Singapore 169608",
      "city": "SINGAPORE",
      "state": "SINGAPORE",
      "country": "SG",
      "telNo": "+65 6222 3322",
      "lat": "1.278523",
      "long": "103.834011",
      "addedBy": "ivan",
      "source": "http://hcidirectory.sg/hcidirectory",
      "officialAdvisory": "https://www.moh.gov.sg/2019-ncov-wuhan"
    }
  ]
}
 */
router.get('/', cache.route({
  expire: {
    '2xx': 86400,
    'xxx': 1
  },
}), asyncHandler(async function (req, res, next) {
  try {
    const results = await axios.get('https://v2-api.sheety.co/3d29e508008ed3f47cc52f6aaf321f51/coronaInfo/hospitalsAndHealthcareProviders');
    return res.json(results.data);
  }
  catch (error) {
    console.log('[/healthcare-institution] error', error);
    return res.json(error);
  }
}));

module.exports = router;
