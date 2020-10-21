// =========================== dependencies start here =========================== // 
// import sqlite3 package
// sets execution mode to verbose to produce messages in the terminal
// regarding the state of the runtime
// this feature can help explain what the application is doing, specifically SQLite
const sqlite3 = require('sqlite3').verbose();
// =========================== dependencies end here =========================== // 

// Create a new object, db for an instance of database
// Connect to database
// callback function informs us if there's an error in the connection
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
      return console.error(err.message);
    }
  
    console.log('Connected to the election database.');
});

module.exports = db;