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

describe ("Get stats overview", function(){
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

describe ("Get total trending cases", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/total_trending_cases")
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