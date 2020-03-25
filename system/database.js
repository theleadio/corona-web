require('dotenv').config()
const mysql = require('mysql2');

const readPool = mysql.createPool({
    host: process.env.DB_HOST_READ,
    user: process.env.DB_USER_READ,
    password: process.env.DB_PASSWORD_READ,
    database: process.env.DB_TABLE_READ,

    // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
    timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
});

readPool.on('connection', conn => {
    conn.query("SET time_zone='+00:00';", error => {
        if (error) {
            console.log('Error connecting to read database:', error);
            throw error;
        }
    });
});

const writePool = mysql.createPool({
    host: process.env.DB_HOST_WRITE,
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_TABLE_WRITE,

    // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
    timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
});

writePool.on('connection', conn => {
    conn.query("SET time_zone='+00:00';", error => {
        if (error) {
            console.log('Error connecting to write database:', error);
            throw error;
        }
    });
});

module.exports = {
    conn: readPool,
    connWrite: writePool,
}