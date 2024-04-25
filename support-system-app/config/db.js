const mysql = require("mysql");


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "supportsys",
    password: "root",
    port: 3307

});

module.exports = db;