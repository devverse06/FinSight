// This file handles routing for transaction-related operations and delegates logic to the transaction controller.
const express = require("express");
const router = express.Router(); // mini express app
const {
  getTransactions,
  addCashTransaction
} = require("../controllers/transactionController");

router.get("/all", getTransactions);
router.post("/add-cash", addCashTransaction);

module.exports = router;
