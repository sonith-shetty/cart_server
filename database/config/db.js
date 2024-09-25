const mysql = require('mysql2');
const { host, user, database, password, db_url } = require('../../utils/secret.utils');

const db_port = 25686;
const pool = mysql.createPool(db_url || { host, user, database, password, port }).promise();

module.exports = pool;
