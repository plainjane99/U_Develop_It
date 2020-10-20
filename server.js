// import express at the top of the file
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// handle user requests that aren't supported by the app
// Default response for any other request (Not Found) Catch all
// needs to be last as it overrides all others
app.use((req, res) => {
    res.status(404).end();
});

// start express.js server on PORT 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});