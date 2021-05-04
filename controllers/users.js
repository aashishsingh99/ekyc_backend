const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const Fin = require("../models/institution");
const Conversation = require("../models/Chat");
const institution = require("../models/institution");
const config = require("config");
const io = require("../db/io");
const networkConnection = require("../utils/networkConnection");
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

const { user_by_token } = require("./auth");

exports.user_register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, dob, id } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    user = new User({
      name,
      email,
      password,
      dob,
      id,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

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

    try {
      const walletPath = path.join(process.cwd() + "/../../", "wallet");

      const wallet = new FileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(name);

      if (userExists) {
        console.log(
          'An identity for the user "user1" already exists in the wallet'
        );
        return;
      }

      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists("admin");
      if (!adminExists) {
        console.log(
          'An identity for the admin user "admin" does not exist in the wallet'
        );
        console.log("Run the enrollAdmin.js application before retrying");
        return;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();

      await gateway.connect(ccpPath, {
        wallet,
        identity: "admin",
        discovery: { enabled: true, asLocalhost: true },
      });

      // Get the CA client object from the gateway for interacting with the CA.
      const ca = gateway.getClient().getCertificateAuthority();
      const adminIdentity = gateway.getCurrentIdentity();

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register(
        { affiliation: "org1.department1", enrollmentID: name, role: "client" },
        adminIdentity
      );
      const enrollment = await ca.enroll({
        enrollmentID: name,
        enrollmentSecret: secret,
      });
      const userIdentity = X509WalletMixin.createIdentity(
        "Org1MSP",
        enrollment.certificate,
        enrollment.key.toBytes()
      );
      await wallet.import(name, userIdentity);
      console.log(
        'Successfully registered and enrolled admin user "user1" and imported it into the wallet'
      );
    } catch (error) {
      console.error(`Failed to register user "user1": ${error}`);
      process.exit(1);
    }
    //doing now adding the data into block chain
    try {
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd() + "/../../", "wallet");
      const wallet = new FileSystemWallet(walletPath);
      console.log("walletpath", walletPath, name);
      //console.log(`Wallet path: ${walletPath}`);
      console.log("125");
      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(name);
      console.log(userExists);
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
        identity: name,
        discovery: { enabled: true, asLocalhost: true },
      });

      const network = await gateway.getNetwork("mychannel");

      // Get the contract from the network.
      const contract = network.getContract("fabcar");

      const params = null;
      const result = await contract.submitTransaction(
        "createCar",
        name,
        email,
        "*********",
        "1/2/2000",
        "234"
      );

      gateway.disconnect();
      console.log("*************************");
      console.log(result);

      console.log(result.toString());
      console.log("Transaction has been submitted");

      // Disconnect from the gateway.
      await gateway.disconnect();
    } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
    }
  } catch (err) {
    //log_and_send_error(err.message, 500, "Server Error");
    console.log("error here");
  }
};

exports.user_register2 = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, password } = req.body;

  //console.log(id);
  try {
    let user = await Fin.findOne({ name });
    //console.log(user);
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    user = new Fin({
      name,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

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

    console.log("registered financial institution successfullly");
  } catch (error) {
    console.error(`Failed to register financial isntituiton: ${error}`);
    process.exit(1);
  }

  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, "..", "..", "..", "wallet");
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists("user1");
    if (!userExists) {
      console.log(
        'An identity for the user "user" does not exist in the wallet'
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

    const result = await contract.evaluateTransaction("queryAllCars");

    // res.json({result.toString()});

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    return result;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }

  //end
};

exports.all_users = async (req, res) => {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, "..", "..", "..", "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists("user1");
    if (!userExists) {
      console.log(
        'An identity for the user "user" does not exist in the wallet'
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

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR0')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')

    const result = await contract.evaluateTransaction("queryAllCars");

    //res.json({result.toString()});

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );

    var temp = JSON.parse(result);

    res.json(temp);
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
};
exports.getConversations = async (req, res) => {
  try {
    const { user_name } = req.body;
    let conversations = await Conversation.find({
      recipients: { $elemMatch: { $eq: req.user.id } },
    }).populate("recipients");

    res.status(200).send(conversations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.newConversation = async (req, res) => {
  const { user_name } = req.body;

  try {
    let otherUser = await User.findOne({ name: user_name }).select("-password");

    if (!otherUser) {
      res.status(404).send("This user does not exist");
    }

    let oldConvo = await Conversation.findOne({
      recipients: [req.user.id, otherUser.id],
    }).populate("recipients");

    if (oldConvo) {
      res.status(200).send(oldConvo);
    } else {
      let newConvo = new Conversation({
        recipients: [req.user.id, otherUser.id],
      });

      await newConvo.save();
      newConvo = await Conversation.findOne({
        recipients: [req.user.id, otherUser.id],
      }).populate("recipients");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.getChatById = async (req, res) => {
  const { chatid } = req.body;

  try {
    const chat = await Conversation.findById(chatid).populate("recipients");

    res.send(chat);
  } catch (err) {
    console.log("Server Error" + err);
  }
};
exports.Get_Keys = async (req, res) => {
  const { name } = req.body;
  console.log("inside controller of get_Keys", name);

  try {
    const wallet_path = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "wallet",
      name
    );
    console.log(wallet_path);
    var files = fs.readdirSync(wallet_path);

    var data2 = ["hi"];
    const wallet_path2 = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "wallet",
      name,
      files[0]
    );
    const wallet_path3 = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "wallet",
      name,
      files[1]
    );

    var data3 = fs.readFileSync(wallet_path2, "utf8");
    var data4 = fs.readFileSync(wallet_path3, "utf8");

    data2[1] = data3;
    data2[2] = data4;

    res.json(data2);
  } catch (err) {
    console.log("error in get_keys controller" + err);
  }
};
