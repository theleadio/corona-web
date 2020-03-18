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
                result.should.have.status(200)
                //console.log("Successfully fetch info", result.body)
                done()
            })
    })
})

describe ("Get diff stats using JHU Arcgis", function(){

    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v2/stats/diff/global")
            .end((err, result)=>{                    
                result.should.have.status(200)
                //console.log("Successfully fetch info", result.body)
                done()
            })
    })
})

describe ("Get diff stats for country JHU Arcgis", function(){
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v2/stats/diff/country")
            .end((err, result)=>{                    
                result.should.have.status(200)
                //console.log("Successfully fetch info", result.body)
                done()
            })
    })
})

describe ("Get diff stats using bno on per country basis", function(){
    countryCode = 'au';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/diff/country?countryCode="+countryCode)
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
                result.should.have.status(200)
                done();
            })
    })
})

describe ("Get daily cases using bno on per country basis", function(){
    countryCode = 'my';
    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/daily_cases/country?countryCode="+countryCode)
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