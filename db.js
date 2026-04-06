// db.js
const mysql = require('mysql2/promise'); // CommonJS com mysql2

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'seu_banco'
});

module.exports = db;