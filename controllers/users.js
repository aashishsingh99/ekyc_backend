const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const Conversation = require("../models/Chat");
const institution = require("../models/institution");
const config = require("config");
const io = require('../db/io');
const networkConnection = require('../utils/networkConnection');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
//const { Wallets, X509WalletMixin } = require('fabric-network');
const ccpPath = path.resolve(__dirname, '..', '..','..','..','..', 'first-network', 'connection-org1.json');


// console.log(UserSocket, "HELLO ABHISHEK");
// UserSocket["mango"] = "juice";
// console.log(UserSocket, "HELLO ABHISHEK1");

const { user_by_token } = require("./auth");

exports.user_register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log("FUCKOFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
  const { name, email, password,dob,id } = req.body;
  console.log("DUFFFFFFF")
  console.log(id);
  try {
    let user = await User.findOne({ email });
    console.log(user);
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }
    console.log("email man ",email)
    user = new User({
      name,
      email,
      password,
      dob,
      id,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);
    console.log("going to save user table");
    await user.save();
    console.log("printing user id",user.id)
    const payload = {
      user: {
        id: user.id,
      },
    };
    console.log("55555",payload);

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
    //console.log("res",res);
    console.log("after jwt");
    try {

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd()+'/../../', 'wallet');
      console.log(walletPath);
      const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
      
      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(name);
      console.log("line 76")
      console.log("ccp path",ccpPath);
      if (userExists) {
          console.log('An identity for the user "user1" already exists in the wallet');
          return;
      }
      console.log("line 81")
      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists('admin');
      if (!adminExists) {
          console.log('An identity for the admin user "admin" does not exist in the wallet');
          console.log('Run the enrollAdmin.js application before retrying');
          return;
      }
      console.log("line 89")
      console.log(__dirname);
      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      console.log();
      console.log(gateway);
      await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
      console.log("line 93")
      
      // Get the CA client object from the gateway for interacting with the CA.
      const ca = gateway.getClient().getCertificateAuthority();
      const adminIdentity = gateway.getCurrentIdentity();

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID:name, role: 'client' }, adminIdentity);
      const enrollment = await ca.enroll({ enrollmentID: name, enrollmentSecret: secret });
      const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
      await wallet.import(name, userIdentity);
      console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

  } catch (error) {
      console.error(`Failed to register user "user1": ${error}`);
      process.exit(1);
  }
  //doing now adding into block chain
  try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd()+'/../../', 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    console.log("125")
    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(name);
    console.log(userExists);
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity: name, discovery: { enabled: true, asLocalhost: true } });
    //console.log("gateway",gateway,"ending gateway");
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');
    // console.log("network",network,"ending network");
    // Get the contract from the network.
    const contract = network.getContract('fabcar');
    console.log("contract",contract,"ending contract");
   
const params = null;
const result =
    //params ?
        //await contract.submitTransaction('createCar', ...params) :
        //console.log("detials****************")
        //console.log(typeof dob);
        //console.log(user,email,dob,id);
        
        await contract.submitTransaction('createCar',name,email, "*********", "1/2/2000","234");
        //await contract.submitTransaction('aks1');
  //await contract.submitTransaction('createCar')
gateway.disconnect();
console.log("*************************");
console.log(result);
console.log('Transaction has been submitted');
    //console.log("Result",result,"result2",result.toString('utf8'),"result3",result.toString());
    console.log("Result",result);
    

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
  //console.log("inside route add conversation");
  //user_name:recipients
  //me:mera user
  const { user_name } = req.body;
  //console.log(user_name);
  try {
    let otherUser = await User.findOne({ name: user_name }).select("-password");

    if (!otherUser) {
      res.status(404).send("This user does not exist");
    }
    //console.log(otherUser);
    let oldConvo = await Conversation.findOne({
      recipients: [req.user.id, otherUser.id],
    }).populate("recipients");

    if (oldConvo) {
      //console.log("inside route add conversation hello");
      res.status(200).send(oldConvo);
    } else {
      //console.log("inside route add conversation old");
      let newConvo = new Conversation({
        recipients: [req.user.id, otherUser.id],
      });
      //console.log("inside route add conversation2");
      await newConvo.save();
      newConvo = await Conversation.findOne({
        recipients: [req.user.id, otherUser.id],
      }).populate("recipients");
      //const user = User.findById(req.user.id);
      //console.log(req.socket.id, "my socket");
      // console.log(req.user.name, "my name");
      // console.log(user_name, "recipient");

      //prev one
      // console.log(UserSocket[user.name].id, "@@@@@@@");
      // await UserSocket[user.name].join(newConvo._id);

      // console.log(UserSocket[user.name].id, "my id ");
      // console.log(UserSocket[user_name], "OP");

      // if (UserSocket[user_name] !== undefined) {
      //   console.log(UserSocket[user_name], user_name, "s socket");
      //   await UserSocket[user_name].join(newConvo._id);
      //   console.log("emitiing addConversation", newConvo._id);
      //   await UserSocket[user.name]
      //     .in(newConvo._id)
      //     .emit("newConversation", { newConvo });
      // }
      // await res.status(200).send(newConvo);

      //new one using req
      
    //console.log(req.socket.id,UserSocket[user_name].id,'test1')
     
    //await req.socket.join(newConvo._id);
      
      
      // if (UserSocket[user_name] !== undefined) {
      //   await UserSocket[user_name].join(newConvo._id);
      //   await req.socket.in(newConvo._id).emit("newConversation", { newConvo });
      // }
      
      
      // await res.status(200).send(newConvo);



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

    res  .send(chat);
  } catch (err) {
    console.log("Server Error" + err);
  }
};
exports.Get_Keys = async (req, res) => {
  const { name } = req.body;
  console.log("inside controller of get_Keys",name);

  try {
    //const chat = await Conversation.findById(chatid).populate("recipients");
//get keys from wallet
const wallet_path=path.resolve(__dirname, '..', '..','..', 'fabcar', 'javascript','wallet',name);
// const public_key=wallet_path
console.log(wallet_path,"this is my wallet in controller");


res.json({ wallet_path });
  } catch (err) {
    console.log("Server Error" + err);
  }
};