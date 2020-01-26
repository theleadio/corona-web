let mysql = require('mysql2');
let pool = mysql.createPool({
    host: 'coronatracker.coehycitad7u.ap-southeast-1.rds.amazonaws.com',
    user: 'corona',
    password: 'corona0106',
    database: 'coronatracker',
});

module.exports = {
    conn: pool
}