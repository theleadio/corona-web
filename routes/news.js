const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");

const db = require("../system/database");

function obtainNews(page, limit) {
    let conn = db.conn;
    conn.query('SELECT * FROM news LIMIT 10', function (error, results) {
        if (error) {
            res.status(400).send('Error in database operation');
        } else {
            res.json(results);
        }
    });
}

/* GET home page. */
router.get('/:page?/:limit?', asyncHandler(async function (req, res, next) {
    try {
        let limit = req.params.limit || 10;
        let offset = req.params.page || 0;
        let page = limit * offset;

        let limit_query = req.params.limit ? " LIMIT ? OFFSET ?;" : ";";
        let args_query = req.params.limit ? [limit, page] : [];

        let conn = db.conn.promise();
        let query = await conn.execute("SELECT * FROM news" + limit_query, args_query);
        let result = query[0];
        res.json(result);
        
    } catch (ex) {
        res.json({ status: 'error', message: ex.message });
    }
}));

module.exports = router;
