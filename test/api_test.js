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
        result.should.have.status(200)

        const { totalConfirmed } = result.body;
        assert(totalConfirmed >
          0, `Expect to have more than 0 totalConfirmed but got ${totalConfirmed}.`);
        done();
      });
  });
});

//2
describe("Get worldometer top country stats", function() {
  it("Should retrieve country stats", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/topCountry")
      .end((err, result) => {
        result.should.have.status(200)

        const countryCount = result.body.length;
        assert(countryCount > 0, `Expect to have more than 0 countries but got ${countryCount}.`);
        done();
      });
  });

  it("Should retrieve country stats by limit", (done) => {
    const limit = 3;

    chai.request(server)
      .get(`/v3/stats/worldometer/topCountry?limit=${limit}`)
      .end((err, result) => {
        result.should.have.status(200)

        const countryCount = result.body.length;
        assert(countryCount === limit, `Expect to have ${limit} counties but got ${countryCount}.`);
        done();
      });
  });

  it("Should default sort by confirmed descending", (done) => {
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
      });
  });

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
      });
  });

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
      });
  });

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
      });
  });

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
      });
  });

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
      });
  });

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
      });
  });
});

//3
describe("Get worldometer total trending cases", function() {
  it("Should retrieve trending cases", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/totalTrendingCases")
      .end((err, result) => {
        result.should.have.status(200)

        const numResults = result.body.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`)
        done();
      });
  });
});

//4
// describe("Get worldometer dailyNewStats (analytics)", function() {
//   it("Should retrieve dailyNewStats", (done) => {
//     chai.request(server)
//       .get("/v3/analytics/dailyNewStats")
//       .end((err, result) => {
//         result.should.have.status(200)
//
//         const numResults = result.body.length;
//         assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`)
//         done();
//       });
//   });
//
//   it("Should retrieve trending cases by limit", (done) => {
//     const limit = 2;
//
//     chai.request(server)
//       .get(`/v3/analytics/dailyNewStats?limit=${limit}`)
//       .end((err, result) => {
//         result.should.have.status(200)
//
//         const numResults = result.body.length;
//         assert(numResults === limit, `Expect to have ${limit} results but got ${numResults}.`);
//         done();
//       });
//   });
// });

//5
describe("Get worldometer 1 country stats", function() {
  it("Should get ", (done) => {
    const countryCode = "MY";

    chai.request(server)
      .get(`/v3/stats/worldometer/country?countryCode=${countryCode}`)
      .end((err, result) => {
        result.should.have.status(200)

        const countryCount = result.body.length;
        assert(countryCount === 1, `Expect to have 1 country but got ${countryCount}.`);
        done();
      });
  });
});

//6
describe("Get worldometer trend data of country", function() {
  it("Should get error if no date param is provided.", (done) => {
    const expectedResponse = "Invalid date format"

    chai.request(server)
      .get("/v5/analytics/trend/country")
      .end((err, result) => {
        result.should.have.status(400);

        const response = result.body;
        assert(response.includes(expectedResponse), `Expect to have ${expectedResponse} but got ${response}`);
        done();
      });
  });

  it("Should get data of a single country (analytics)", (done) => {
    chai.request(server)
      .get("/v5/analytics/trend/country?countryCode=MY&startDate=2020-03-20&endDate=2020-03-24")
      .end((err, result) => {
        result.should.have.status(200);

        const numResults = result.body.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`);
        done();
      });
  });
});

//7
describe("Get worldometer stats", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v3/stats/worldometer/country")
      .end((err, result) => {
        result.should.have.status(200)

        const numCountries = result.body.length;
        assert(numCountries > 0, `Expect to have more than 0 countries but got ${numCountries}.`);
        done();
      });
  });
});

//8
describe("Get analytics per country", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v5/analytics/country")
      .end((err, result) => {
        result.should.have.status(200);

        const numCountries = result.body.length;
        assert(numCountries > 0, `Expect to have more than 0 countries but got ${numCountries}.`);
        done();
      });
  });
});

//9
describe("Get news", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/news")
      .end((err, result) => {
        result.should.have.status(200);

        const numResults = result.body.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`);
        done();
      });
  });
});

//10
describe("Get trending news", function() {
  it("Should get trending news", (done) => {
    chai.request(server)
      .get("/news/trending?limit=9&offset=0&countryCode=MY&country=Malaysia&language=en")
      .end((err, result) => {
        result.should.have.status(200);

        const numResults = result.body.total;
        assert(`Expect to have more than 0 results but got ${numResults}`);
        done();
      })
  })
})

//11
describe("Get worldonmeter trend data of multiple countries (analytics)", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v5/analytics/trend/country?countryCode=MY,CN&startDate=2020-03-20&endDate=2020-03-24")
      .end((err, result) => {
        result.should.have.status(200)

        const numResults = result.body.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`);
        done();
      });
  });
});

//12
describe("Get healthcare institutions", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v1/healthcare-institution")
      .end((err, result) => {
        result.should.have.status(200);

        const numResults = result.body.hospitalsAndHealthcareProviders.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`);
        done();
      });
  });
});

//13
describe("Get travel alert", function() {
  it("Should get ", (done) => {
    chai.request(server)
      .get("/v1/travel-alert")
      .end((err, result) => {
        result.should.have.status(200);

        const numResults = result.body.length;
        assert(numResults > 0, `Expect to have more than 0 results but got ${numResults}.`);
        done();
      });
  });
});
