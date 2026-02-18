// This file handles authentication routes and delegates all logic to the user controller.”
const express = require("express");
const router = express.Router(); // mini express app
const { signup, login } = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
