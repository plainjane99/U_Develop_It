// =========================== dependencies start here =========================== // 
const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');
const { route } = require('./candidateRoutes');
// =========================== dependencies end here =========================== // 

// The front end will need to send us IDs for the voter and candidate. 
// Both fields are required, so we use inputCheck() function again
// We also want to avoid malicious SQL injection, 
// which warrants using prepared statements.
router.post('/vote', ({body}, res) => {
    // Data validation 
    const errors = inputCheck(body, 'voter_id', 'candidate_id');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
  
    // Prepare statement
    const sql = `INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)`;
    const params = [body.voter_id, body.candidate_id];
  
    // Execute
    db.run(sql, params, function(err, result) {
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

router.get('/vote', (req, res) => {
    const sql = `SELECT candidates.*, parties.name AS party_name, COUNT(candidate_id) AS count
                FROM votes
                LEFT JOIN candidates ON votes.candidate_id = candidates.id
                LEFT JOIN parties ON candidates.party_id = parties.id
                GROUP BY candidate_id ORDER BY count DESC`;
    
    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    })
})

module.exports = router;