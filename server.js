// =========================== dependencies start here =========================== // 
// import express at the top of the file
const express = require('express');
// import sqlite3 package
// sets execution mode to verbose to produce messages in the terminal
// regarding the state of the runtime
// this feature can help explain what the application is doing, specifically SQLite
const sqlite3 = require('sqlite3').verbose();
// import function for use in this file
const inputCheck = require('./utils/inputCheck');
// =========================== dependencies end here =========================== // 

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create a new object, db for an instance of database
// Connect to database
// callback function informs us if there's an error in the connection
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
      return console.error(err.message);
    }
  
    console.log('Connected to the election database.');
});

// This method is the key component that allows SQL commands to be written in a Node.js application
// rows returns objects representing each row of data within the database
// request a list of all potential candidates
// use the get() method to retrieve all the candidates from the candidates table. 
// This route is designated with the endpoint /api/candidates
// req, res callback function will handle the client's request and the database's response.
app.get('/api/candidates', (req, res) => {
    // assign sql statement to a variable
    // sql statement takes all data * from candidates table and only parties.name data
    // renames the parties.name data column to party_name
    // then joins parties data (right) to candidate data (left)
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id`;
    // no placeholders in sql statement so we assign to empty array
    const params = [];
    // database call
    // .all retrieves all rows
    // the all() method runs the SQL query 
    // and executes the callback with all the resulting rows that match the query
    // the callback function captures the responses from the query in two variables: 
    // the err, which is the error response, and 
    // rows, which is the database query response. 
    db.all(sql, params, (err, rows) => {
        // if there is an error, send back status message 500
        // and the error message is json
        if (err) {
            res.status(500).json({ error: err.message });
            // return in order to exit out of the database call once error is encountered
            return;
        }
        // if no error, then err = null and the response is sent back
        // instead of logging the result, rows, from the database, 
        // we'll send this response as a JSON object to the browser, 
        // using res in the Express.js route callback.
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// return a single candidate from the candidates table based on their id
// GET a single candidate
// the endpoint has a route parameter that will hold the value of the id 
// to specify which candidate we'll select from the database
// we'll assign the captured value populated in the req.params object with the key id to params
app.get('/api/candidate/:id', (req, res) => {
    // database call will then query the candidates table with id and retrieve the row specified
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    // Because params can be accepted in the database call as an array, 
    // params is assigned as an array with a single element, req.params.id
    const params = [req.params.id];
    // We're using the Database method get() to return a single row from the database call
    db.get(sql, params, (err, row) => {
        // if error, error status code was changed to 400 to 
        // notify the client that their request wasn't accepted and to try a different request
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // In the route response, we'll send the row back to the client in a JSON object
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete candidate request
// The method run() will execute an SQL query but won't retrieve any result data.
// The endpoint used here also includes a route parameter to uniquely identify the candidate to remove. 
app.delete('/api/candidate/:id', (req, res) => {
    // we're using a prepared SQL statement with a placeholder
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    //  database call uses the ES5 function callback, to use the Statement object's changes property
    db.run(sql, params, function(err, result) {

        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
        // The JSON object route response will be a message, 
        // with the changes property set to this.changes. 
        // Again, this will verify whether any rows were changed.
        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

// Create a candidate
// we use the HTTP request method post() to insert a candidate into the candidates table
// use the object req.body to populate the candidate's data
// use object destructuring to pull the body property out of the request object
app.post('/api/candidate', ({ body }, res) => {
    // In the callback function block, we assign errors to receive the return from the inputCheck function
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    // If the inputCheck() function returns an error, 
    // an error message is returned to the client as a 400 status code, 
    // to prompt for a different user request with a JSON object 
    // that contains the reasons for the errors
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // Create a candidate
    // sql and params were assigned to improve legibility of call function to the database
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
                    VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    // the database call here uses a prepared statement
    // The params assignment contains three elements in its array that 
    // contains the user data collected in req.body
    // Using the run() method, we can execute the prepared SQL statement
    // We use the ES5 function in the callback to use the Statement object that's bound to this
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // we send the response using the res.json() method with this.lastID, 
        // the id of the inserted row
        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});


// handle user requests that aren't supported by the app
// Default response for any other request (Not Found) Catch all
// needs to be last as it overrides all others
app.use((req, res) => {
    res.status(404).end();
});

// start express.js server on PORT 3001
// but only after DB connection
// by wrapping the express.js connection in an event handler
db.on('open', () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});