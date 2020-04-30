define({ "api": [
  {
    "type": "get",
    "url": "/v2/analytics/country",
    "title": "By country",
    "name": "FetchAffectedCountries",
    "group": "Analytics",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "200",
            "description": "<p>limit the number of results</p>"
          }
        ]
      }
    },
    "filename": "routes/v2/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v3/analytics/dailyNewStats",
    "title": "By new daily cases and deaths",
    "name": "fetchTopCountryWithDailyNewStatsSortByNewCases",
    "group": "Analytics",
    "version": "3.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>limit the number of results</p>"
          }
        ]
      }
    },
    "filename": "routes/v3/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v3/analytics/newcases/country",
    "title": "get daily new incidences of a country between start and end dates",
    "name": "getNewCasesByCountry",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "countryCode",
            "description": "<p>Required Country code(s)</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "startDate",
            "description": "<p>Required Start date</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "endDate",
            "description": "<p>Required end date</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v3/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v3/analytics/trend/country",
    "title": "get data of a country between start and end dates",
    "name": "getTrendByCountry",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "countryCode",
            "description": "<p>Required Country code(s)</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "startDate",
            "description": "<p>Required Start date</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "endDate",
            "description": "<p>Required end date</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/v3/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v2/cache/clear",
    "title": "Clear cache",
    "name": "ClearCache",
    "group": "Cache",
    "description": "<p>Endpoint to clear redis cache</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "key",
            "description": "<p>Optional cache key to clear.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"success\": true,\n  \"numberCleared\": 25\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/v2/cache.js",
    "groupTitle": "Cache"
  },
  {
    "type": "get",
    "url": "/v1/healthcare-institution",
    "title": "List",
    "name": "FetchHealthcareInstitution",
    "group": "Healthcare_Institution",
    "version": "1.0.0",
    "description": "<p>Returns list of health care institutions</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"hospitalsAndHealthcareProviders\": [\n    {\n      \"id\": 2,\n      \"name\": \"Singapore General Hospital\",\n      \"description\": \"\",\n      \"address\": \"Outram Road, Singapore 169608\",\n      \"city\": \"SINGAPORE\",\n      \"state\": \"SINGAPORE\",\n      \"country\": \"SG\",\n      \"telNo\": \"+65 6222 3322\",\n      \"lat\": \"1.278523\",\n      \"long\": \"103.834011\",\n      \"addedBy\": \"ivan\",\n      \"source\": \"http://hcidirectory.sg/hcidirectory\",\n      \"officialAdvisory\": \"https://www.moh.gov.sg/2019-ncov-wuhan\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/healthcareInstitution.js",
    "groupTitle": "Healthcare_Institution"
  },
  {
    "type": "get",
    "url": "/health",
    "title": "Health check",
    "name": "Health",
    "group": "Miscellaneous",
    "version": "0.0.0",
    "description": "<p>Endpoint to check if the service is up.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"status\": \"OK\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/index.js",
    "groupTitle": "Miscellaneous"
  },
  {
    "type": "get",
    "url": "/timestamp",
    "title": "Timestamp",
    "name": "Timestamp",
    "group": "Miscellaneous",
    "version": "0.0.0",
    "description": "<p>Return current timestamp. Useful for debugging redis cache together with Timestamp cache endpoint.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "{\n  \"timestamp\": 1583419781518\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/index.js",
    "groupTitle": "Miscellaneous"
  },
  {
    "type": "get",
    "url": "/timestamp-cache",
    "title": "Timestamp cache",
    "name": "TimestampCache",
    "group": "Miscellaneous",
    "version": "0.0.0",
    "description": "<p>Endpoint to check if redis cache is working. If redis cache is working, the response should return the cached timestamp. Useful for debugging redis cache together with Timestamp endpoint.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "{\n  \"timestamp\": 1583419781500\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/index.js",
    "groupTitle": "Miscellaneous"
  },
  {
    "type": "get",
    "url": "/news/trending",
    "title": "List",
    "name": "FetchTrendingNews",
    "group": "News",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "9",
            "description": "<p>number of news to return</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "offset",
            "defaultValue": "0",
            "description": "<p>number of news to skip</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "country",
            "description": "<p>country name to search in title/description</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "countryCode",
            "description": "<p>countryCode to filter news by</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  \"total\": 9\n  \"items\": [\n    {\n      \"nid\": 1,\n      \"author\": \"BBC News\",\n      \"title\": \"Road blocks and ghost towns\",\n      \"description\": \"A BBC team travels into Hubei province, where the deadly new coronavirus originated.\",\n      \"url\": \"https://www.bbc.co.uk/news/av/world-asia-china-51255918/china-coronavirus-road-blocks-and-ghost-towns\",\n      \"urlToImage\": \"https://ichef.bbci.co.uk/news/1024/branded_news/1218D/production/_110652147_p081fsgp.jpg\",\n      \"publishedAt\": \"2020-01-26T11:44:46Z\",\n      \"content\": null,\n      \"countryCodes\": 'CN,SG'\n    }\n  ]\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/news.js",
    "groupTitle": "News"
  },
  {
    "type": "get",
    "url": "/v3/stats/custom-debug",
    "title": "Custom (for debug)",
    "name": "FetchCustomOverriddenStatsDebug",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>This endpoint is used for debugging purpose. It returns the list of overridden stats in our google sheet.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"id\": 2,\n    \"countryCode\": \"SG\",\n    \"countryName\": \"Singapore\",\n    \"confirmed\": 89,\n    \"recovered\": 51,\n    \"deaths\": 0,\n    \"created\": \"2020-02-23 (UTC 1355)\",\n    \"createdBy\": \"\",\n    \"sourceUrl\": \"https://www.cna.com.tw/news/aopl/202002230219.aspx\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats",
    "title": "",
    "name": "FetchStats",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>Returns the stats of top X countries sorted by number of confirmed cases.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "country",
            "description": "<p>Optional Country to retrieve the stats for.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"confirmed\": 96785,\n  \"deaths\": 3303,\n  \"recovered\": 53610,\n  \"created\": \"2020-03-05T14:35:03.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/stats",
    "title": "",
    "name": "FetchStats",
    "group": "Stats",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "country",
            "description": "<p>Optional Country to retrieve the stats for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/totalTrendingCases",
    "title": "",
    "name": "GetTotalTrendingCases",
    "group": "Stats",
    "version": "3.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Limit to top N trending stats</p>"
          }
        ]
      }
    },
    "description": "<p>Returns total trending cases</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"totalConfirmed\": 378560,\n    \"totalDeaths\": 16495,\n    \"totalRecovered\": 101608,\n    \"lastUpdated\": \"2020-03-24T00:10:06.000Z\"\n  },\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/global",
    "title": "Global Stats Overview",
    "name": "globalStatsOverview",
    "group": "Stats_-_Worldometer",
    "version": "3.0.0",
    "description": "<p>Returns global stats based on worldometer data, used in home and analytics page</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"totalConfirmed\": 276113,\n  \"totalDeaths\": 11402,\n  \"totalRecovered\": 91952,\n  \"totalNewCases\": 562,\n  \"totalNewDeaths\": 23,\n  \"totalActiveCases\": 172759,\n  \"totalCasesPerMillionPop\": 35,\n  \"created\": \"2020-03-21T13:00:13.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats_-_Worldometer"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/country",
    "title": "all country or country-specific stats",
    "name": "worldometer",
    "group": "Stats_-_Worldometer",
    "version": "3.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "countryCode",
            "description": "<p>Optional countryCode to retrieve the stats for</p>"
          }
        ]
      }
    },
    "description": "<p>Returns all country data or country-specific stats based on worldometer data.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"CN\",\n    \"country\": \"China\",\n    \"lat\": 35.86166,\n    \"lng\": 104.195397,\n    \"totalConfirmed\": 81470,\n    \"totalDeaths\": 3304,\n    \"totalRecovered\": 75700,\n    \"dailyConfirmed\": 31,\n    \"dailyDeaths\": 4,\n    \"activeCases\": 2466,\n    \"totalCritical\": 633,\n    \"totalConfirmedPerMillionPopulation\": 57,\n    \"totalDeathsPerMillionPopulation\": 2,\n    \"FR\": \"4.0555\",\n    \"PR\": \"92.9176\",\n    \"lastUpdated\": \"2020-03-30T21:00:13.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats_-_Worldometer"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/topCountry",
    "title": "Top N countries",
    "name": "worldometer",
    "group": "Stats_-_Worldometer",
    "version": "3.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Limit to top N countries to return</p>"
          }
        ]
      }
    },
    "description": "<p>Returns N country data or country-specific stats based on worldometer data.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"US\",\n    \"country\": \"USA\",\n    \"lat\": 37.09024,\n    \"lng\": -95.712891,\n    \"totalConfirmed\": 159689,\n    \"totalDeaths\": 2951,\n    \"totalRecovered\": 5220,\n    \"dailyConfirmed\": 16198,\n    \"dailyDeaths\": 368,\n    \"activeCases\": 151518,\n    \"totalCritical\": 3402,\n    \"totalConfirmedPerMillionPopulation\": 482,\n    \"totalDeathsPerMillionPopulation\": 9,\n    \"FR\": \"1.8480\",\n    \"PR\": \"3.2689\",\n    \"lastUpdated\": \"2020-03-30T21:00:11.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats_-_Worldometer"
  },
  {
    "type": "get",
    "url": "/v1/travel-alert",
    "title": "List",
    "name": "FetchTravelAlert",
    "group": "Travel_Alert",
    "version": "1.0.0",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"AG\",\n    \"countryName\": \"ANTIGUA AND BARBUDA\",\n    \"publishedDate\": \"2020-03-04T00:00:00.000Z\",\n    \"alertMessage\": \"1. Visitors and airline crew who have been in China (People's Rep.) in the past 28 days are not allowed to enter Antigua and Barbuda.||2. Nationals and resident diplomats of Antigua and Barbuda who have been in China (People's Rep.) in the past 28 days are allowed to enter Antigua and Barbuda. Airlines must provide their advance passenger information before departure. ||3. Visitors and airline crew who have been in Italy (in cities and towns which have been quarantined by the Government of Italy) are not allowed to enter Antigua and Barbuda.  |-This does not apply to nationals of Antigua and Barbuda and resident diplomats.\"\n  },\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/travelAlert.js",
    "groupTitle": "Travel_Alert"
  }
] });
