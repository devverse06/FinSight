// This controller manages user authentication and session initialization.
const { v4: uuidv4 } = require("uuid"); // UUID v4 gives globally unique, random identifiers safe for external exposure.
const User = require("../models/user");
const Account = require("../models/accountnumbers");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { username, phone_number, email, password, name } = req.body;

    // check if user already exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const user_id = uuidv4();

    const newUser = new User({
      user_id,
      username,
      phone_number,
      email,
      password,
      name
    });

    await newUser.save();

    // all the cash transactions are stored under this dummy account
    const defaultAccount = new Account({
      user_id,
      account_number: "XXXXXXXXXXXXXXXX"
    });

    await defaultAccount.save();

    res
      .cookie("user_id", user_id, { httpOnly: true })
      .cookie("username", username, { httpOnly: true })
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res
      .cookie("user_id", user.user_id, { httpOnly: true })
      .cookie("username", user.username, { httpOnly: true })
      .json({ success: true, message: "Login successful" });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};
