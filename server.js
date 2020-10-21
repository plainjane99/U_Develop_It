// =========================== dependencies start here =========================== // 
// import express at the top of the file
const express = require('express');
// import modularized file
const db = require('./db/database');
// =========================== dependencies end here =========================== // 

const PORT = process.env.PORT || 3001;
const app = express();
const apiRoutes = require('./routes/apiRoutes');

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// define path for router
app.use('/api', apiRoutes);

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