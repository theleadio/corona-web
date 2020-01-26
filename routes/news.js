var express = require('express');
var router = express.Router();
//var mysql = require('mysql2');
let db = require("../system/database");

/* GET home page. */
router.get('/', function(req, res, next) {

    let conn = db.conn;
    
  /* var conn = mysql.createPool({
      host : 'coronatracker.coehycitad7u.ap-southeast-1.rds.amazonaws.com',
      user : 'corona',
      password : 'corona0106',
      database: 'coronatracker',
  });

  conn.connect();
 */
  conn.query('SELECT * FROM news LIMIT 10', function(error, results){
      if ( error ){
          res.status(400).send('Error in database operation');
      } else {
          res.json(results);
      }
  });

});

module.exports = router;
