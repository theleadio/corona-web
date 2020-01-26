const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require('../system/database');

router.get('/', function(req, res, next) {
  var conn = db.conn
  var q = req.query.q;
  var query = "SELECT * FROM newsapi LIMIT 5";
  if (q) {
    query = `SELECT * FROM newsapi WHERE description LIKE '%${q}%' LIMIT 50`
  }

  conn.query(query, function(error, results){
      if ( error ){
          res.status(400).send('Error in database operation');
      } else {
          res.json(results);
      }
  });
});

module.exports = router;