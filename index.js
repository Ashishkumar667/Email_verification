const express = require("express"); 
const mongoose = require("./config/db");
const bodyparser = require("body-parser");
const path = require("path");

const port = process.env.PORT || 3000;

const app = express();

// Body parser middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Log requests middleware
const logRequest = (req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] Request Made to : ${req.originalUrl}`);
    next(); // Move on to the next phase
}

// Import the user routes
const UserRoutes = require('./Routes/UserRoutes');

// Use the user routes for '/user'
app.use('/user', logRequest, UserRoutes);


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
