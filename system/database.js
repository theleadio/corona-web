let mysql = require('mysql2');
let pool = mysql.createPool({
    host: 'coronatracker.coehycitad7u.ap-southeast-1.rds.amazonaws.com',
    user: 'corona',
    password: 'corona0106',
    database: 'coronatracker',

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