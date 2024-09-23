const mysql = require('mysql2');
const { host, user, password, db_url } = require('../../utils/secret.utils');

const connection = mysql.createConnection(db_url);

module.exports = connection;