const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');

const User = require('../models/users');
const userController= require('../controllers/users');


// @route    POST api/users
// @desc     Register user
// @access   Publi
router.post(
  '/',
   (req, res) => {
    userController.user_register(req, res);
  }
);
router.post(
  '/inst',
   (req, res) => {
    //  console.log("hsdasdahsda");
    // userController.user_register2(req, res);
    console.log("1")
  userController.user_register2(req, res);
  console.log("end1")
  }
);

// @route    POST api/users/conversations
// @desc     Get all conversations of a user
// @access   Private
router.get('/conversations',auth, userController.getConversations)
// @route    POST /api/users/getChatbychatid
// @desc     Get current conversation
// @access   Private
router.post('/conversation',auth, userController.getChatById)



// @route    POST api/users/newconversation
// @desc     Create new conversation with a user
// @access   Private
router.post('/newConversation',auth, userController.newConversation)
const mod = require("../controllers/users");
//private create a post
router.post("/getKeys", auth, async (req, res) => {
  console.log("in getkeys route");
  mod.Get_Keys(req, res);
  
});
//router.post('/getKeys',auth, userController.Get_Keys)

router.get('/getChatby')






module.exports = router;