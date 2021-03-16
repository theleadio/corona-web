require('dotenv').config()
const fs = require('fs');
const mysql = require('mysql2');

const Database = (() => {
    const baseConfig = {
        // https://github.com/sidorares/node-mysql2/issues/642#issuecomment-347500996
        timezone: '+00:00', // Interpret all received timestamps as UTC. Otherwise local timezone is assumed.
    };

    const readConfig = {
        ...baseConfig,
        host: process.env.DB_HOST_READ,
        user: process.env.DB_USER_READ,
        password: process.env.DB_PASSWORD_READ,
        database: process.env.DB_TABLE_READ,
    };
    const writeConfig = {
        ...baseConfig,
        host: process.env.DB_HOST_WRITE,
        user: process.env.DB_USER_WRITE,
        password: process.env.DB_PASSWORD_WRITE,
        database: process.env.DB_TABLE_WRITE,
    };

    if (process.env.DB_READ_SSL_CERT_PATH) {
        readConfig.ssl = {
            ca: fs.readFileSync(__dirname + process.env.DB_READ_SSL_CERT_PATH),
        };
    }
    if (process.env.DB_WRITE_SSL_CERT_PATH) {
        writeConfig.ssl = {
            ca: fs.readFileSync(__dirname + process.env.DB_WRITE_SSL_CERT_PATH),
        };
    }

    const setTimeZone = (conn, pool_name) => {
        conn.query("SET time_zone='+00:00';", error => {
            if (error) {
                console.log(`Error connecting to ${pool_name} database:`, error);
                throw error;
            }
        });
    };

    const readPool = mysql.createPool(readConfig);
    const writePool = mysql.createPool(writeConfig);

    readPool.on('connection', conn => setTimeZone(conn, 'read'));
    writePool.on('connection', conn => setTimeZone(conn, 'write'));

    return {
        conn: readPool,
        connWrite: writePool,
    };
}());

module.exports = Database;
