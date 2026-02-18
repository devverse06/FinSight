//  This file bootstraps the backend application and wires together middleware, database connection, and route modules.
const express = require('express');// minimal web framework on top of Node.js, we don't need to manually parse requests, routes, headers, clean APIs and scalability
const dotenv = require('dotenv'); // imports dotenv package
const cors = require('cors'); // Frontend and backend run on different origins, Browser blocks cross-origin requests by default, If we remove cors then frontend requests will fail with CORS error
const cookieParser = require('cookie-parser'); // Parses(takes out) cookies from request headers ()

// Route imports
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const ConnectMongo = require('./config/db');


dotenv.config(); // Loads variables from .env into process.env

const app = express(); // create an express application (main app)
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // if false cookies will not be allowed
}));
app.use(express.json()); // Parses(takes out) JSON request body, Required for POST/PUT APIs, if missing -> req.body -> undefined
app.use(cookieParser()); // All routes can access req.cookies

ConnectMongo();

// Routes
app.use("/api/user", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000; // fallback
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`)); // Node event loop starts listening, Server becomes active
