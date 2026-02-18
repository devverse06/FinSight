const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  account_number: {
    type: String,
    required: true
  },
  to_from: {
    type: String,
    default: ''
  },
  reference_number: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  credited_debited: {
    type: String,
    required: true,
    enum: ['credited', 'debited']
  }
});

module.exports = mongoose.model('transactions', transactionSchema);
