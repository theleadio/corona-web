var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Bad request');
  }

  res.redirect(url);
});

module.exports = router;
