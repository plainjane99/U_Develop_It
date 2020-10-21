// =========================== dependencies start here =========================== // 
const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');
// =========================== dependencies end here =========================== // 

// gets all voters
router.get('/voters', (req, res) => {
    const sql = `SELECT * FROM voters ORDER BY last_name`;
    const params = [];
  
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: rows
      });
    });
});

module.exports = router;

// gets single voter
router.get('/voter/:id', (req, res) => {
    const sql = `SELECT * FROM voters WHERE id = ?`;
    const params = [req.params.id];
  
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: row
      });
    });
});

// allow people to register through the app
router.post('/voter', ({ body }, res) => {

    // prevent blank records from being created
    const errors = inputCheck(body, 'first_name', 'last_name', 'email');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // The ? prepared statements will protect us from malicious data
    const sql = `INSERT INTO voters (first_name, last_name, email) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.email];
  
    db.run(sql, params, function(err, data) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: body,
        id: this.lastID
      });
    });
});

// allow users to update their email address
// req.params (to capture who is being updated) 
// req.body (to capture what is being updated).
router.put('/voter/:id', (req, res) => {
    // Data validation
    const errors = inputCheck(req.body, 'email');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
  
    // Prepare statement
    const sql = `UPDATE voters SET email = ? WHERE id = ?`;
    const params = [req.body.email, req.params.id];
  
    // Execute
    db.run(sql, params, function(err, data) {
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

// remove voters from database
router.delete('/voter/:id', (req, res) => {
    const sql = `DELETE FROM voters WHERE id = ?`;
  
    db.run(sql, req.params.id, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
    
        res.json({ message: 'deleted', changes: this.changes });
    });
});
