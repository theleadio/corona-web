require('dotenv').config()
const fs = require('fs');
const mysql = require('mysql2');

const readConfig = {
    host: process.env.DB_HOST_READ,
    user: process.env.DB_USER_READ,
    password: process.env.DB_PASSWORD_READ,
    database: process.env.DB_TABLE_READ,

    // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
    timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
};

if (process.env.DB_READ_SSL_CERT_PATH) {
    readConfig.ssl = {
        ca: fs.readFileSync(__dirname + process.env.DB_READ_SSL_CERT_PATH),
    };
}

const readPool = mysql.createPool(readConfig);

readPool.on('connection', conn => {
    conn.query("SET time_zone='+00:00';", error => {
        if (error) {
            console.log('Error connecting to read database:', error);
            throw error;
        }
    });
});

const writeConfig = {
    host: process.env.DB_HOST_WRITE,
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_TABLE_WRITE,

    // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
    timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
};

if (process.env.DB_WRITE_SSL_CERT_PATH) {
    readConfig.ssl = {
        ca: fs.readFileSync(__dirname + process.env.DB_WRITE_SSL_CERT_PATH),
    };
}

const writePool = mysql.createPool(writeConfig);

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