// This controller manages transaction CRUD operations and ensures only authenticated users can access their data
// imports the version-4 UUID generator from the uuid library and renames it as uuidv4 for usage in code.
const { v4: uuidv4 } = require("uuid"); // Universally Unique Identifier; Generates globally unique reference numbers (No collision risk), v4: No timestamp leakage, Practically collision-free
const Transaction = require("../models/transactions");

exports.getTransactions = async (req, res) => {
  try {
    const user_id = req.cookies.user_id;

    if (!user_id) return res.status(401).json({ message: "Not authenticated" });

    const transactions = await Transaction.find({ user_id });

    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.addCashTransaction = async (req, res) => {
  try {
    const user_id = req.cookies.user_id;
    const { to_from, amount, date, credited_debited } = req.body;

    if (!user_id) return res.status(401).json({ message: "Not authenticated" });

    const newTransaction = new Transaction({
      user_id,
      account_number: "XXXXXXXXXXXXXXXX",
      to_from,
      amount,
      date,
      credited_debited,
      reference_number: uuidv4()
    });

    await newTransaction.save();

    res.status(201).json({ success: true, message: "Transaction added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Add transaction failed" });
  }
};
