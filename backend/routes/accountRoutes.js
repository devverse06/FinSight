// This file handles routing for account-related operations and delegates actual logic to controllers.
// This file defines RESTful account-related routes using Express Router and delegates all business logic to controller functions.
const express = require("express");
const router = express.Router(); // mini express app
const {
  addAccountNumber,
  deleteAccountNumber,
  getAccountNumbers
} = require("../controllers/accountController");

router.post("/add", addAccountNumber);
router.delete("/delete", deleteAccountNumber);
router.get("/all", getAccountNumbers);

module.exports = router;
