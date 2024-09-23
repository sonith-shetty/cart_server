const mysql = require('mysql2');
const { host, user, database, password, db_url } = require('../../utils/secret.utils');

const pool = mysql.createPool(db_url || { host, user, database, password }).promise();

module.exports = pool;