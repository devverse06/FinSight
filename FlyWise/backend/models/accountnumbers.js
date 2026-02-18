const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  account_number: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('accountnumbers', accountSchema);
