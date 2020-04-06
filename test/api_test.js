var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();
chai.use(chaiHttp);

//1
describe("Get worldometer global stats overview", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/global")
      .end((err, result) => {
        var total_confirmed = result.body.totalConfirmed;
        console.log('got ' + total_confirmed + ' total_confirmed');
        if (total_confirmed > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 total_confirmed");
        }
        done();
      })
  })
})

//2
describe("Get worldometer top country stats", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry")
      .end((err, result) => {
        var country_count = result.body.length;
        console.log('got ' + country_count + ' countries');
        if (country_count > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + country_count + " countries. Expecting more than 0.");
        }
        done();
      })
  })
})

//3
describe("Get worldometer top 3 country stats", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?limit=3")
      .end((err, result) => {
        var country_count = result.body.length;
        console.log('got ' + country_count + ' countries');
        if (country_count == 3) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + country_count + " countries. Expecting 3.");
        }
        done();
      })
  })
})

describe("Get worldometer top country sort", function() {
  it("Should default sort by confirmed descending ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedDescending = firstCountry.totalConfirmed >= lastCountry.totalConfirmed;
        assert(isConfirmedDescending);
        done();
      })
  })

  it("Should sort by confirmed ascending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=confirmed")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedAscending = firstCountry.totalConfirmed <= lastCountry.totalConfirmed;
        assert(isConfirmedAscending);
        done();
      })
  })

  it("Should sort by confirmed descending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=-confirmed")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedDescending = firstCountry.totalConfirmed >= lastCountry.totalConfirmed;
        assert(isConfirmedDescending);
        done();
      })
  })

  it("Should sort by recovered ascending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=recovered")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedAscending = firstCountry.totalRecovered <= lastCountry.totalRecovered;
        assert(isConfirmedAscending);
        done();
      })
  })

  it("Should sort by recovered descending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=-recovered")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedDescending = firstCountry.totalRecovered >= lastCountry.totalRecovered;
        assert(isConfirmedDescending);
        done();
      })
  })

  it("Should sort by deaths ascending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=deaths")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedAscending = firstCountry.totalDeaths <= lastCountry.totalDeaths;
        assert(isConfirmedAscending);
        done();
      })
  })

  it("Should sort by deaths descending", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry?sort=-deaths")
      .end((err, result) => {
        result.should.have.status(200);

        const countries = result.body;
        const firstCountry = countries[0];
        const lastCountry = countries[countries.length - 1];

        const isConfirmedDescending = firstCountry.totalDeaths >= lastCountry.totalDeaths;
        assert(isConfirmedDescending);
        done();
      })
  })
})


//4
describe("Get worldometer total trending cases", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/totalTrendingCases")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' results');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 results");
        }
        done();
      })
  })
})

//5
describe("Get worldonmeter dailyNewStats (analytics)", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/analytics/dailyNewStats")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' results');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 results");
        }
        done();
      })
  })
})

//6
describe("Get worldonmeter dailyNewStats with limits (analytics)", function() {
  var limit = 2;
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/analytics/dailyNewStats?limit=" + limit)
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' results');
        if (num_results == limit) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + num_results + " results. Expecting 2.");
        }
        done();
      })
  })
})

//7
describe("Get worldometer 1 country stats", function() {
  let countryCode = "MY"
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/country?countryCode=" + countryCode)
      .end((err, result) => {
        var country_count = result.body.length;
        console.log('got ' + country_count + ' countries');
        if (country_count == 1) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + country_count + " countries. Expecting 1.");
        }
        done();
      })
  })
})

//8
describe("Get worldonmeter trend data of country (analytics). No parameter", function() {
  it("Should get ", (done) => {
    let expected_response = "Invalid date format"
    chai.request(server)
      .get("/v3/analytics/trend/country")
      .end((err, result) => {
        var response = result.body;
        console.log('got ' + response + ' response');
        if (response.includes(expected_response)) {
          console.log('Test pass');
        } else {
          assert.fail("Fail to fail.");
        }
        done();
      })
  })
})

//9
describe("Get worldonmeter trend data of a single country (analytics)", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/analytics/trend/country?countryCode=MY&startDate=2020-03-20&endDate=2020-03-24")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' data');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + num_results + " results. Expecting more");
        }
        done();
      })
  })
})

//10
describe("Get trending news", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/news/trending?limit=9&offset=0&countryCode=MY&country=Malaysia&language=en")
      .end((err, result) => {
        var num_results = result.body.total;
        console.log('got ' + num_results + ' data');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + num_results + " results.");
        }
        done();
      })
  })
})

//11
describe("Get worldonmeter trend data of multiple countries (analytics)", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/analytics/trend/country?countryCode=MY,CN&startDate=2020-03-20&endDate=2020-03-24")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' data');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are " + num_results + " results. Expecting more");
        }
        done();
      })
  })
})

//12
describe("Get worldometer stats", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/country")
      .end((err, result) => {
        var num_countries = result.body.length;
        console.log('got ' + num_countries + ' results');
        if (num_countries > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 countries");
        }
        done();
      })
  })
})

//13
describe("Get analytics per country", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v2/analytics/country")
      .end((err, result) => {
        var num_countries = result.body.length;
        console.log('got ' + num_countries + ' results');
        if (num_countries > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 countries");
        }
        done();
      })
  })
})

//14
describe("Get healthcare institutions", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v1/healthcare-institution")
      .end((err, result) => {
        var num_results = result.body.hospitalsAndHealthcareProviders.length;
        console.log('got ' + num_results + ' results');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 results");
        }
        done();
      })
  })
})

//15
describe("Get news", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/news")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' results');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 results");
        }
        done();
      })
  })
})

//16
describe("Get travel alert", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v1/travel-alert")
      .end((err, result) => {
        var num_results = result.body.length;
        console.log('got ' + num_results + ' results');
        if (num_results > 0) {
          result.should.have.status(200)
          console.log('Test pass');
        } else {
          assert.fail("There are 0 results");
        }
        done();
      })
  })
})
