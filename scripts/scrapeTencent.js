const https = require('https');
const db = require('../system/database');

const tencentUrl = 'https://view.inews.qq.com/g2/getOnsInfo?name=wuwei_ww_area_counts';

const countryMap = {
  "中国": "China",
  "加拿大": "Canada",
  "尼泊尔": "Nepal",
  "巴基斯坦": "Pakistan",
  "新加坡": "Singapore",
  "日本": "Japan",
  "法国": "France",
  "泰国": "Thailand",
  "澳大利亚": "Australia",
  "美国": "United States",
  "越南": "Vietnam",
  "韩国": "South Korea",
  "马来西亚": "Malaysia",
  "德国": "Germany",
  "斯里兰卡": "Sri Lanka",
  "芬兰": "Finland",
  "阿联酋": "United Arab Emirates",
  "菲律宾": "Philippines",
  "印度": "India",
};
const areaMap = {
  "湖北": "Hubei",
  "广东": "Guangdong",
  "浙江": "Zhejiang",
  "重庆": "Chongqing",
  "湖南": "Hunan",
  "安徽": "Anhui",
  "北京": "Beijing",
  "上海": "Shanghai",
  "河南": "Henan",
  "四川": "Sichuan",
  "山东": "Shandong",
  "广西": "Guangxi",
  "江西": "Jiangxi",
  "福建": "Fujian",
  "江苏": "Jiangsu",
  "海南": "Hainan",
  "辽宁": "Liaoning",
  "陕西": "Shaanxi",
  "云南": "Yunnan",
  "天津": "Tianjin",
  "黑龙江": "Heilongjiang",
  "河北": "Hebei",
  "山西": "Shanxi",
  "香港": "Hong Kong",
  "贵州": "Guizhou",
  "吉林": "Jilin",
  "甘肃": "Gansu",
  "宁夏": "Ningxia",
  "台湾": "Taiwan",
  "新疆": "Xinjiang",
  "澳门": "Macao",
  "内蒙古": "Inner Mongolia",
  "青海": "Qinghai",
  "西藏": "Tibet"
};

async function processData(data) {
  const translatedData = data
    .map(d => {
      if (countryMap[d.country]) {
        d.country = countryMap[d.country];
      }

      if (areaMap[d.area]) {
        d.area = areaMap[d.area];
      }

      return d;
    });

  const dataByArea = translatedData.reduce((accumulate, current) => {
      const { country, area, confirm, suspect, dead, heal } = current;
      const key = country + area;

      if (!accumulate[key]) {
        accumulate[key] = { country, area, confirm, suspect, dead, heal };
        return accumulate;
      }

      accumulate[key].confirm += confirm;
      accumulate[key].suspect += suspect;
      accumulate[key].dead += dead;
      accumulate[key].heal += heal;

      return accumulate;
  }, {});
  console.log("dataByArea:", Object.values(dataByArea));

  const conn = db.conn.promise();

  await importDataGroupByAreaToDb(conn, Object.values(dataByArea));

  const dataByCountry = translatedData.reduce((accumulate, current) => {
    const { country, confirm, suspect, dead, heal } = current;
    if (!accumulate[country]) {
      accumulate[country] = { country, confirm, suspect, dead, heal };
      return accumulate;
    }

    accumulate[country].confirm += confirm;
    accumulate[country].suspect += suspect;
    accumulate[country].dead += dead;
    accumulate[country].heal += heal;

    return accumulate;
  }, {});
  console.log("dataByCountry:", Object.values(dataByCountry));

  await importDataGroupByCountryToDb(conn, Object.values(dataByCountry));

  conn.end();
}

async function importDataGroupByAreaToDb(conn, data) {
  const currentTimestamp = Math.ceil(new Date().getTime() / 1000);

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const query = `INSERT INTO tencent_data_by_area (country, area, num_confirm, num_suspect, num_dead, num_heal, created) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const args = [d.country, d.area, d.confirm, d.suspect, d.dead, d.heal, currentTimestamp];

    try {
      await conn.execute(query, args);
    }
    catch (ex) {
      console.log(ex);
    }
  }
}

async function importDataGroupByCountryToDb(conn, data) {
  const currentTimestamp = Math.ceil(new Date().getTime() / 1000);

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const query = `INSERT INTO tencent_data_by_country (country, num_confirm, num_suspect, num_dead, num_heal, created) VALUES (?, ?, ?, ?, ?, ?)`;
    const args = [d.country, d.confirm, d.suspect, d.dead, d.heal, currentTimestamp];

    try {
      await conn.execute(query, args);
    }
    catch (ex) {
      console.log(ex);
    }
  }
}

https.get(tencentUrl, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', async () => {
    const json = JSON.parse(data);
    const statsData = JSON.parse(json.data);
    await processData(statsData);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});