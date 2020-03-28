const axios = require('axios');
const cache = require('../system/redis-cache');

async function getCustomStats() {
  const cacheKey = 'custom-stats';

  if (!cache.connected) {
    const data = await fetchDataFromGoogleSheet();
    // console.log("getCustomStats:", data);

    return data;
  }

  return new Promise((resolve, reject) => {
    cache.get(cacheKey, async function (error, entries) {
      if (error) {
        console.log("[getCustomStats] error when retrieving from cache:", error);
        return resolve([]);
      }

      if (entries && entries.length) {
        // console.log("[getCustomStats] entries:", entries);
        try {
          const parsedData = JSON.parse(entries[[0]].body);
          return resolve(parsedData);
        }
        catch (ex) {
          console.log("[getCustomStats] failed to parse cache entry");
          // Continue
        }
      }

      const data = await fetchDataFromGoogleSheet();
      const expires = data && !data.length
        // Cache for 5 minutes.
        // Empty data indicates something goes wrong. cache it anyway for a shorter time
        // to reduce repeated requests during high load.
        ? 5 * 60
        : 120 * 60; // 2 hours

      cache.add(cacheKey, JSON.stringify(data), {
        expires,
        type: 'json',
      }, function (error, added) {
        if (error) {
          console.log("[getCustomStats] error when writing to cache:", error);
        }
      });

      //console.log("[getCustomStats] data:", data);
      return resolve(data);
    });
  });
}

async function fetchDataFromGoogleSheet() {
  try {
    const { data } = await axios.get('https://v2-api.sheety.co/3d29e508008ed3f47cc52f6aaf321f51/coronaSources/latestStats');
    return data && data.latestStats;
  }
  catch (ex) {
    console.log('Error when getting data from sheety', ex && ex.response && ex.response.statusCode);
    return [];
  }
}

module.exports = {
  getCustomStats,
  fetchDataFromGoogleSheet,
};