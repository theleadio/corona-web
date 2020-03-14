require('dotenv').config()
let mysql = require('mysql2');

let pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_TABLE,

    // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
    timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
});

pool.on('connection', conn => {
    conn.query("SET time_zone='+00:00';", error => {
        if (error){
            throw error;
        }
    });
});

module.exports = {
    conn: pool
}