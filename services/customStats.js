const axios = require('axios');
const cache = require('../system/redis-cache');

async function getCustomStats() {
  const cacheKey = 'custom-stats';

  if (!cache.connected) {
    const data = await fetchDataFromGoogleSheet();
    console.log("latestStats:", data);

    return data;
  }

  return new Promise((resolve, reject) => {
    cache.get(cacheKey, async function (error, entries) {
      if (error) {
        console.log("[getCustomStats] error:", error);
        return resolve([]);
      }

      if (entries && entries.length) {
        console.log("[getCustomStats] entries:", entries);
        return resolve(entries);
      }

      let data = [];
      try {
        data = await fetchDataFromGoogleSheet();
      }
      catch (ex) {
        console.error('[getCustomStats] Error:', ex);
        return resolve(data);
      }

      cache.add(cacheKey, JSON.stringify(data), {
        expires: 60 * 60, // 1 hour
        type: 'json',
      }, function (error, added) {
        console.log("[getCustomStats] error, added:", error, added);
      });

      return resolve(data);
    });
  });
}

async function fetchDataFromGoogleSheet() {
  const { data } = await axios.get('https://v2-api.sheety.co/3d29e508008ed3f47cc52f6aaf321f51/coronaSources/latestStats');
  return data && data.latestStats;
}

module.exports = {
  getCustomStats
};