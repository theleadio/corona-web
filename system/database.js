require('dotenv').config()
const fs = require('fs');
const mysql = require('mysql2');

class DatabaseConnector {
    conn; // Read pool
    connWrite; // Write pool

    constructor() {
        // Ensure there only ever exists a single instance of DatabaseConnector
        if (DatabaseConnector._instance) {
            return DatabaseConnector._instance;
        }

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

        this.readPool = mysql.createPool(readConfig);
        this.writePool = mysql.createPool(writeConfig);

        this.readPool.on('connection', conn => this._setTimeZone(conn, 'read'));
        this.writePool.on('connection', conn => this._setTimeZone(conn, 'write'));

        DatabaseConnector._instance = this;
        return DatabaseConnector._instance;
    }

    get conn() {
        return this.readPool;
    }

    get connWrite() {
        return this.writePool;
    }

    _setTimeZone(conn, poolName) => {
        conn.query("SET time_zone='+00:00';", error => {
            if (error) {
                console.log(`Error connecting to ${pool_name} database:`, error);
                throw error;
            }
        });
    }
}

module.exports = new DatabaseConnector();
