var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server=require("../app");
let should = chai.should();
chai.use(chaiHttp);

describe ("Get stats using bno", function(){
	countryCode = 'sg';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno?countryCode="+countryCode)
            .end((err, result)=>{
                result.should.have.status(200)
                responseCountrycode = result.body.countryCode.toLowerCase();
                console.log("Successfully fetch and country code:", responseCountrycode);
                if (countryCode == responseCountrycode){
                    console.log('got the correct country code');
                    //console.log("Successfully fetch info", result.body)

                }
                else{
                    console.log('got the wrong country code');
                    assert.fail(responseCountrycode, 'au', "Country code does not match");
                }
                //console.log("Successfully fetch info", result.body)
                done()
            })
    })
})

describe ("Get stats using JHU Arcgis", function(){
	countryCode = 'sg';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v2/stats?countryCode="+countryCode)
            .end((err, result)=>{
                responseCountrycode = result.body.countryCode.toLowerCase();
                console.log("Successfully fetch and country code:", responseCountrycode);
                if (countryCode == responseCountrycode){
                    console.log('got the correct country code');
                    //console.log("Successfully fetch info", result.body)

                }
                else{
                    console.log('got the wrong country code');
                    assert.fail(responseCountrycode, 'au', "Country code does not match");
                }
                //console.log("Successfully fetch info", result.body)
                done();
            })
    })
})

describe ("Get diff stats using JHU Arcgis", function(){

    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v2/stats/diff/global")
            .end((err, result)=>{
                var num = result.body.length;
                console.log('got '+ num + ' results');
                if (num > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 results");
                }

                //console.log("Successfully fetch info", result.body)
                done();
            })
    })
})

describe ("Get diff stats for country JHU Arcgis", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v2/stats/diff/country")
            .end((err, result)=>{
                var num = result.body.length;
                console.log('got '+ num + ' results');
                if (num > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 results");
                }

                //console.log("Successfully fetch info", result.body)
                done();
            })
    })
})

describe ("Get diff stats using bno on per country basis", function(){
    countryCode = 'au';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/diff/country?countryCode="+countryCode)
            .end((err, result)=>{
                console.log('test pass');
                // result.should.have.status(200)
                // console.log(result.body);
                // responseCountryName = result.body.country.toLowerCase();
                // console.log("Successfully fetch and country code:", responseCountrycode);
                // if (responseCountryName == 'australia'){
                //     console.log('got the correct country code');
                //     //console.log("Successfully fetch info", result.body)

                // }
                // else{
                //     console.log('got the wrong country code');
                //     assert.fail(responseCountrycode, 'au', "Country code does not match");
                // }
                done();
            })
    })
})

describe ("Get total daily cases using bno on per country basis", function(){
    countryCode = 'my';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/total_daily_cases/country?countryCode="+countryCode)
            .end((err, result)=>{
                result.should.have.status(200)
                responseCountrycode = result.body.countryCode.toLowerCase();
                console.log("Successfully fetch and country code:", responseCountrycode);
                if (countryCode == responseCountrycode){
                    console.log('got the correct country code');
                    //console.log("Successfully fetch info", result.body)

                }
                else{
                    console.log('got the wrong country code');
                    assert.fail(responseCountrycode, 'au', "Country code does not match");
                }
                done();
            })
    })
})

describe ("Get total daily cases using bno globally", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/total_daily_cases")
            .end((err, result)=>{
                var num = result.body.length;
                console.log('got '+ num + ' results');
                if (num > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                    done();
                }
                else{
                    assert.fail("There are 0 results");
                }

                //console.log("Successfully fetch info", result.body)
                
            })
    })
})

describe ("Get daily cases using bno on per country basis", function(){
    countryCode = 'my';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/daily_cases/country?countryCode="+countryCode)
            .end((err, result)=>{
                result.should.have.status(200);
                console.log('done');
                // responseCountrycode = result.body.countryCode.toLowerCase();
                // console.log("Successfully fetch and country code:", responseCountrycode);
                // if (countryCode == responseCountrycode){
                //     console.log('got the correct country code');
                //     //console.log("Successfully fetch info", result.body)

                // }
                // else{
                //     console.log('got the wrong country code');
                //     assert.fail(responseCountrycode, 'au', "Country code does not match");
                // }
                done();
            })
    })
})

describe ("Get daily cases using bno globally", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/daily_cases")
            .end((err, result)=>{
                result.should.have.status(200)
                done();
            })
    })
})

describe ("Get worldometer stats", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/country")
            .end((err, result)=>{
                var num_countries = result.body.length;
                console.log('got '+ num_countries + ' results');
                if (num_countries > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 countries");
                }
                done();
            })
    })
})

describe ("Get worldometer global stats overview", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/global")
            .end((err, result)=>{
                var total_confirmed = result.body.totalConfirmed;
                console.log('got '+ total_confirmed + ' total_confirmed');
                if (total_confirmed > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 total_confirmed");
                }
                done();
            })
    })
})

describe ("Get worldometer all country stats", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/country")
            .end((err, result)=>{
                var country_count = result.body.length;
                console.log('got '+ country_count + ' countries');
                if (country_count > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 countries");
                }
                done();
            })
    })
})

describe ("Get worldometer 1 country stats", function(){
    let countryCode = "MY"
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/country?countryCode=" + countryCode)
            .end((err, result)=>{
                var country_count = result.body.length;
                console.log('got '+ country_count + ' countries');
                if (country_count == 1){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + country_count + " countries. Expecting 1.");
                }
                done();
            })
    })
})

describe ("Get worldometer top country stats", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/topCountry")
            .end((err, result)=>{
                var country_count = result.body.length;
                console.log('got '+ country_count + ' countries');
                if (country_count > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + country_count + " countries. Expecting more than 0.");
                }
                done();
            })
    })
})

describe ("Get worldometer top 3 country stats", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/topCountry?limit=3")
            .end((err, result)=>{
                var country_count = result.body.length;
                console.log('got '+ country_count + ' countries');
                if (country_count == 3){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + country_count + " countries. Expecting 3.");
                }
                done();
            })
    })
})

describe ("Get worldometer total trending cases", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/worldometer/totalTrendingCases")
            .end((err, result)=>{
                var num_results = result.body.length;
                console.log('got '+ num_results + ' results');
                if (num_results > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 results");
                }
                done();
            })
    })
})

describe ("Get worldonmeter dailyNewStats (analytics)", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/analytics/dailyNewStats")
            .end((err, result)=>{
                var num_results = result.body.length;
                console.log('got '+ num_results + ' results');
                if (num_results > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are 0 results");
                }
                done();
            })
    })
})

describe ("Get worldonmeter dailyNewStats with limits (analytics)", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/analytics/dailyNewStats?limit=2")
            .end((err, result)=>{
                var num_results = result.body.length;
                console.log('got '+ num_results + ' results');
                if (num_results == 2){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + num_results + " results. Expecting 2.");
                }
                done();
            })
    })
})

describe ("Get worldonmeter trend data of country (analytics). No parameter", function(){
    it ("Should get ", (done)=>{
        let expected_response = "Invalid date format"
        chai.request(server)
            .get("/v3/analytics/trend/country")
            .end((err, result)=>{
                var response = result.body;
                console.log('got '+ response + ' response');
                if (response.includes(expected_response)){
                    console.log('Test pass');
                }
                else{
                    assert.fail("Fail to fail.");
                }
                done();
            })
    })
})

describe ("Get worldonmeter trend data of a single country (analytics)", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/analytics/trend/country?countryCode=MY&startDate=2020-03-20&endDate=2020-03-24")
            .end((err, result)=>{
                var num_results = result.body.length;
                console.log('got '+ num_results + ' data');
                if (num_results > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + num_results + " results. Expecting 2.");
                }
                done();
            })
    })
})


describe ("Get worldonmeter trend data of multiple countries (analytics)", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/analytics/trend/country?countryCode=MY,CN&startDate=2020-03-20&endDate=2020-03-24")
            .end((err, result)=>{
                var num_results = result.body.length;
                console.log('got '+ num_results + ' data');
                if (num_results > 0){
                    result.should.have.status(200)
                    console.log('Test pass');
                }
                else{
                    assert.fail("There are " + num_results + " results. Expecting 2.");
                }
                done();
            })
    })
})
