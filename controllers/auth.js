const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const Fin = require("../models/institution");
const config = require("config");


const auth_token = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password, user_type } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    log_and_send_error(err.message, 500, "Server Error");
  }
};
const user_by_token = async (req, res) => {
  try {
    console.log("1")
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    log_and_send_error(err.message, 500, "Server Error");
  }
};


const user_by_token2 = async (req, res) => {
  try {
    console.log("1")
    console.log("user_buttoenenken")
    //console.log(req);
    const user = await Fin.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    console.log(err.message, "Server Error");
  }
};
module.exports = { auth_token, user_by_token,user_by_token2 };