var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

router.get('/', function(req, res, next) {

  var conn = mysql.createConnection({
      host : 'coronatracker.coehycitad7u.ap-southeast-1.rds.amazonaws.com',
      user : 'corona',
      password : 'corona0106',
      database : 'coronatracker'
  });

  var q = req.query.q;
  var query = "SELECT * FROM newsapi LIMIT 50";
  if (q) {
    query = `SELECT * FROM newsapi WHERE description LIKE '%${q}%' LIMIT 50`
  }
  
  console.log(query);

  conn.connect();

  conn.query(query, function(error, results){
      if ( error ){
          res.status(400).send('Error in database operation');
      } else {
          res.json(results);
      }
  });

});

module.exports = router;
