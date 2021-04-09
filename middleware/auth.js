const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/users");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    jwt.verify(token, config.get("jwtSecret"), async (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        const findUser = await User.findById(decoded.user.id);

        if (findUser) {
          req.user = findUser;
          next();
        } else return res.status(401).json({ msg: "Not authorized!" });
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};