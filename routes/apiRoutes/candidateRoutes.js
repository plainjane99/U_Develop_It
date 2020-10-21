// =========================== dependencies start here =========================== // 
const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');
// =========================== dependencies end here =========================== // 

// This method is the key component that allows SQL commands to be written in a Node.js application
// rows returns objects representing each row of data within the database
// request a list of all potential candidates
// use the get() method to retrieve all the candidates from the candidates table. 
// This route is designated with the endpoint /api/candidates
// req, res callback function will handle the client's request and the database's response.
router.get('/candidates', (req, res) => {
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
router.get('/candidate/:id', (req, res) => {
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
router.delete('/candidate/:id', (req, res) => {
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

// update party affiliation
// affected row's id should always be part of the route 
router.put('/candidate/:id', (req, res) => {

    // makes sure that party_id was provided before we attempt to update the database
    // this forces our PUT request to include a party_id
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
    
        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});

// Create a candidate
// we use the HTTP request method post() to insert a candidate into the candidates table
// use the object req.body to populate the candidate's data
// use object destructuring to pull the body property out of the request object
router.post('/candidate', ({ body }, res) => {
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

module.exports = router;