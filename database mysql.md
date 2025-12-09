const mysql = require("mysql");
const dotenv = require("dotenv");

// configure .ENV file
dotenv.config();

// connect to Localhost mysql OR Clever CLoud Database
function connectToDatabase() {
  return mysql.createConnection({
  user: process.env.DBUser,
  host: process.env.DBHost,
  password: process.env.DBPassword,
  database: process.env.DBDatabase,
  });

//   return mysql.createConnection({
//     user: process.env.MYSQL_ROOT,
//     host: process.env.MYSQL_HOST,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//   });
}

const database = connectToDatabase();

module.exports = database;
