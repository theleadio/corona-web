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

describe ("Get diff stats using bno", function(){

    it ("Should get ", (done)=>{
        chai.request(server)
            .get("/v3/stats/bno/diff/global")
            .end((err, result)=>{                    
                result.should.have.status(200)
                //console.log("Successfully fetch info", result.body)
                done()
            })
    })
})