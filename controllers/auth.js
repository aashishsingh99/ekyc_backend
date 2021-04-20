const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const Fin = require("../models/institution");
const config = require("config");
const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin,
} = require("fabric-network");
const path = require("path");
const ccpPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "first-network",
  "connection-org1.json"
);

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
    console.log("1");
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    log_and_send_error(err.message, 500, "Server Error");
  }
};

const user_by_token2 = async (req, res) => {
  try {
    console.log("1");
    console.log("user_buttoenenken");
    //console.log(req);
    const user = await Fin.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    console.log(err.message, "Server Error");
  }
};
const approve_user = async (req, res) => {
  try {
    console.log("inside approve controller");
    console.log(req.body);

    //const user = await Fin.findById(req.user.id).select("-password");
    try {
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd() + "/../../", "wallet");
      const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists("user1");
      if (!userExists) {
        console.log(
          'An identity for the user "user1" does not exist in the wallet'
        );
        console.log("Run the registerUser.js application before retrying");
        return;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccpPath, {
        wallet,
        identity: "user1",
        discovery: { enabled: true, asLocalhost: true },
      });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork("mychannel");

      // Get the contract from the network.
      const contract = network.getContract("fabcar");

      // Submit the specified transaction.
      // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
      // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
      await contract.submitTransaction(
        "changeCarOwner",
        req.body.Key,
        "Verified"
      );
      console.log("User has Been Verified");

      // Disconnect from the gateway.
      await gateway.disconnect();
    } catch (error) {
      console.error(`Failed to verify user: ${error}`);
      process.exit(1);
    }
    // res.json(user);
  } catch (err) {
    console.log(err.message, "Server Error");
  }
};
module.exports = { auth_token, user_by_token, user_by_token2, approve_user };
