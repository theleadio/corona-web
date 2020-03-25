define({ "api": [
  {
    "type": "get",
    "url": "/v3/analytics/country",
    "title": "By country",
    "name": "FetchAffectedCountries",
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
            "defaultValue": "200",
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
    "url": "/analytics/country",
    "title": "",
    "name": "FetchAffectedCountries",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Optional limit the number of results</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "date",
            "description": "<p>Optional. Get results for that date</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/analytics/trend/country",
    "title": "",
    "name": "FetchAnalyticsTrendByCountryAndDate",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "country_code",
            "description": "<p>Required Country code</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "start_date",
            "description": "<p>Required Start date</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "end_date",
            "description": "<p>Required end date</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v2/analytics/trend",
    "title": "By date",
    "name": "FetchAnalyticsTrendByDate",
    "group": "Analytics",
    "version": "2.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "start_date",
            "description": "<p>Start date in YYYY-MM-DD format</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "end_date",
            "description": "<p>End date in YYYY-MM-DD format</p>"
          }
        ]
      }
    },
    "filename": "routes/v2/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/analytics/trend",
    "title": "",
    "name": "FetchAnalyticsTrendByDate",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "start_date",
            "description": "<p>Required Start date</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": true,
            "field": "end_date",
            "description": "<p>Required end date</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v2/analytics/area",
    "title": "By area",
    "name": "FetchMostAffectedByArea",
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
            "defaultValue": "10",
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
    "url": "/analytics/area",
    "title": "",
    "name": "FetchMostAffectedbyArea",
    "group": "Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Optional limit the number of results</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/analytics.js",
    "groupTitle": "Analytics"
  },
  {
    "type": "get",
    "url": "/v3/analytics/daily",
    "title": "By new daily cases and deaths",
    "name": "fetchTopCountryWithDailyNewCases",
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
    "url": "/v3/stats/diff/country",
    "title": "Diff country stats",
    "name": "FetchCountryStatsDifferenceBetweenDays",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>Returns difference in country stats between days.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "confirmed",
            "description": "<p>The stats number to sort by in descending order. Valid values are 'confirmed', 'recover', 'death'</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryName\": \"Italy\",\n    \"todayConfirmed\": 7375,\n    \"ytdConfirmed\": 5883,\n    \"diffConfirmed\": 1492,\n    \"todayDeath\": 366,\n    \"ytdDeath\": 233,\n    \"diffDeath\": 133,\n    \"todayRecover\": 622,\n    \"ytdRecover\": 589,\n    \"diffRecover\": 33,\n    \"today\": \"2020-03-09T00:00:00.000Z\",\n    \"ytd\": \"2020-03-08T00:00:00.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v2/stats/diff/country",
    "title": "Diff country stats",
    "name": "FetchCountryStatsDifferenceBetweenDays",
    "group": "Stats",
    "version": "2.0.0",
    "description": "<p>Returns difference in country stats between days.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "confirmed",
            "description": "<p>The stats number to sort by in descending order. Valid values are 'confirmed', 'recover', 'death'</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryName\": \"Italy\",\n    \"todayConfirmed\": 7375,\n    \"ytdConfirmed\": 5883,\n    \"diffConfirmed\": 1492,\n    \"todayDeath\": 366,\n    \"ytdDeath\": 233,\n    \"diffDeath\": 133,\n    \"todayRecover\": 622,\n    \"ytdRecover\": 589,\n    \"diffRecover\": 33,\n    \"today\": \"2020-03-09T00:00:00.000Z\",\n    \"ytd\": \"2020-03-08T00:00:00.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/custom",
    "title": "Custom",
    "name": "FetchCustomOverriddenStats",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>Returns country stats combined with overridden stats in our google sheet.</p>",
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
    "url": "/v2/stats/custom",
    "title": "Custom",
    "name": "FetchCustomOverriddenStats",
    "group": "Stats",
    "version": "2.0.0",
    "description": "<p>Returns country stats combined with overridden stats in our google sheet.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"id\": 2,\n    \"countryCode\": \"SG\",\n    \"countryName\": \"Singapore\",\n    \"confirmed\": 89,\n    \"recovered\": 51,\n    \"deaths\": 0,\n    \"created\": \"2020-02-23 (UTC 1355)\",\n    \"createdBy\": \"\",\n    \"sourceUrl\": \"https://www.cna.com.tw/news/aopl/202002230219.aspx\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/custom-debug",
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
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats"
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
    "url": "/v2/stats/custom-debug",
    "title": "Custom (for debug)",
    "name": "FetchCustomOverriddenStatsDebug",
    "group": "Stats",
    "version": "2.0.0",
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
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/diff/global",
    "title": "Diff global stats",
    "name": "FetchGlobalStatsDifferenceBetweenDays",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>Returns difference in global stats between days.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"todayConfirmed\": 111243,\n    \"ytdConfirmed\": 107642,\n    \"diffConfirmed\": 3601,\n    \"todayDeath\": 3890,\n    \"ytdDeath\": 3655,\n    \"diffDeath\": 235,\n    \"todayRecover\": 62370,\n    \"ytdRecover\": 60655,\n    \"diffRecover\": 1715,\n    \"today\": \"2020-03-09T00:00:00.000Z\",\n    \"ytd\": \"2020-03-08T00:00:00.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v2/stats/diff/global",
    "title": "Diff global stats",
    "name": "FetchGlobalStatsDifferenceBetweenDays",
    "group": "Stats",
    "version": "2.0.0",
    "description": "<p>Returns difference in global stats between days.</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"todayConfirmed\": 111243,\n    \"ytdConfirmed\": 107642,\n    \"diffConfirmed\": 3601,\n    \"todayDeath\": 3890,\n    \"ytdDeath\": 3655,\n    \"diffDeath\": 235,\n    \"todayRecover\": 62370,\n    \"ytdRecover\": 60655,\n    \"diffRecover\": 1715,\n    \"today\": \"2020-03-09T00:00:00.000Z\",\n    \"ytd\": \"2020-03-08T00:00:00.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/latest",
    "title": "",
    "name": "FetchLatestStats",
    "group": "Stats",
    "version": "3.0.0",
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v2/stats/latest",
    "title": "",
    "name": "FetchLatestStats",
    "group": "Stats",
    "version": "2.0.0",
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/stats/latest",
    "title": "",
    "name": "FetchLatestStats",
    "group": "Stats",
    "version": "0.0.0",
    "filename": "routes/stats.js",
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
    "url": "/v2/stats",
    "title": "",
    "name": "FetchStats",
    "group": "Stats",
    "version": "2.0.0",
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
    "filename": "routes/v2/stats.js",
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
    "url": "/v3/stats/top",
    "title": "Top stats",
    "name": "FetchTopStats",
    "group": "Stats",
    "version": "3.0.0",
    "description": "<p>Returns the stats of top X countries sorted by number of confirmed cases.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "7",
            "description": "<p>Number of countries' stats to retrieve.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"CN\",\n    \"countryName\": \"China\",\n    \"confirmed\": 80411,\n    \"deaths\": 3013,\n    \"recovered\": 52201,\n    \"created\": \"2020-03-05T14:50:02.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v2/stats/top",
    "title": "Top stats",
    "name": "FetchTopStats",
    "group": "Stats",
    "version": "2.0.0",
    "description": "<p>Returns the stats of top X countries sorted by number of confirmed cases.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "7",
            "description": "<p>Number of countries' stats to retrieve.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"CN\",\n    \"countryName\": \"China\",\n    \"confirmed\": 80411,\n    \"deaths\": 3013,\n    \"recovered\": 52201,\n    \"created\": \"2020-03-05T14:50:02.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v2/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/stats/top",
    "title": "",
    "name": "FetchTopStats",
    "group": "Stats",
    "version": "0.0.0",
    "filename": "routes/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/total_trending_cases",
    "title": "",
    "name": "GetTotalTrendingCases",
    "group": "Stats",
    "version": "3.0.0",
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
    "filename": "routes/v3/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "/v3/stats/bno/daily_cases",
    "title": "Daily cases",
    "name": "daily_cases",
    "group": "Stats_-_BNO",
    "version": "3.0.0",
    "description": "<p>Return list of daily cases for each country</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"AD\",\n    \"country\": \"Andorra\",\n    \"dailyConfirmed\": 14,\n    \"ytdDailyConfirmed\": 14,\n    \"diffDailyConfirmed\": 0,\n    \"pctDiffconfirmed\": 0,\n    \"dailyDeaths\": 0,\n    \"ytdDailyDeaths\": 0,\n    \"diffDailyDeaths\": 0,\n    \"todayRecovered\": 0,\n    \"ytdRecovered\": 0,\n    \"diffDailyRecovered\": 0,\n    \"tdyFR\": 0,\n    \"ytdFR\": 0,\n    \"tdyPR\": 0,\n    \"ytdPR\": 0,\n    \"today\": \"2020-03-17T23:50:05.000Z\",\n    \"ytd\": \"2020-03-16T23:50:05.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/bno.js",
    "groupTitle": "Stats_-_BNO"
  },
  {
    "type": "get",
    "url": "/v3/stats/bno/daily_cases/country",
    "title": "Daily cases by country",
    "name": "daily_cases/country",
    "group": "Stats_-_BNO",
    "version": "3.0.0",
    "description": "<p>Return the daily cases for specific country</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "countryCode",
            "description": "<p>The country to retrieve the stats for</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"countryCode\": \"SG\",\n  \"country\": \"Singapore\",\n  \"dailyConfirmed\": 200,\n  \"ytdDailyConfirmed\": 178,\n  \"diffDailyConfirmed\": 22,\n  \"pctDiffconfirmed\": 5.82010582010582,\n  \"dailyDeaths\": 0,\n  \"ytdDailyDeaths\": 0,\n  \"diffDailyDeaths\": 0,\n  \"todayRecovered\": 97,\n  \"ytdRecovered\": 96,\n  \"diffDailyRecovered\": 1,\n  \"tdyFR\": 0,\n  \"ytdFR\": 0,\n  \"tdyPR\": 25.66137566137566,\n  \"ytdPR\": 53.93258426966292,\n  \"today\": \"2020-03-13T23:50:05.000Z\",\n  \"ytd\": \"2020-03-12T23:50:05.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/bno.js",
    "groupTitle": "Stats_-_BNO"
  },
  {
    "type": "get",
    "url": "/v3/stats/bno/total_daily_cases",
    "title": "Total daily cases",
    "name": "total_daily_cases",
    "group": "Stats_-_BNO",
    "version": "3.0.0",
    "description": "<p>Return list of total daily cases for each country</p>",
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"TR\",\n    \"countryName\": \"Turkey\",\n    \"confirmed\": 98,\n    \"deaths\": 1,\n    \"recovered\": 0,\n    \"critical\": 0,\n    \"serious\": 0,\n    \"activeCases\": 98,\n    \"created\": \"2020-03-18T03:35:05.000Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/bno.js",
    "groupTitle": "Stats_-_BNO"
  },
  {
    "type": "get",
    "url": "/v3/stats/bno/total_daily_cases/country",
    "title": "Total daily cases by country",
    "name": "total_daily_cases/country",
    "group": "Stats_-_BNO",
    "version": "3.0.0",
    "description": "<p>Return the total daily cases for specific country</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "countryCode",
            "description": "<p>The country to retrieve the stats for</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 200 Success\n{\n  \"countryCode\": \"MY\",\n  \"countryName\": \"Malaysia\",\n  \"confirmed\": 673,\n  \"deaths\": 2,\n  \"recovered\": 49,\n  \"critical\": 0,\n  \"serious\": 12,\n  \"activeCases\": 624,\n  \"created\": \"2020-03-18T03:35:05.000Z\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/bno.js",
    "groupTitle": "Stats_-_BNO"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/global",
    "title": "Global stats",
    "name": "stats_overview",
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
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"CN\",\n    \"country\": \"China\",\n    \"totalConfirmed\": 81008,\n    \"totalDeaths\": 3255,\n    \"totalRecovered\": 71740,\n    \"dailyConfirmed\": 41,\n    \"dailyDeaths\": 7,\n    \"activeCases\": 6013,\n    \"totalCritical\": 1927,\n    \"totalConfirmedPerMillionPopulation\": 56,\n    \"FR\": \"4.0181\",\n    \"PR\": \"88.5592\",\n    \"lastUpdated\": \"2020-03-21T04:00:12.000Z\"\n  },\n]",
          "type": "json"
        }
      ]
    },
    "filename": "routes/v3/stats/worldometer.js",
    "groupTitle": "Stats_-_Worldometer"
  },
  {
    "type": "get",
    "url": "/v3/stats/worldometer/top",
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
          "content": "HTTP/1.1 200 Success\n[\n  {\n    \"countryCode\": \"CN\",\n    \"country\": \"China\",\n    \"lat\": 35.86166,\n    \"lng\": 104.195397,\n    \"totalConfirmed\": 81171,\n    \"totalDeaths\": 3277,\n    \"totalRecovered\": 73159,\n    \"dailyConfirmed\": 0,\n    \"dailyDeaths\": 0,\n    \"activeCases\": 4735,\n    \"totalCritical\": 1573,\n    \"totalConfirmedPerMillionPopulation\": 56,\n    \"FR\": \"4.0372\",\n    \"PR\": \"90.1295\",\n    \"lastUpdated\": \"2020-03-25T08:50:30.000Z\"\n  }\n]",
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
