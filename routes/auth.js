const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const auth2 = require('../middleware/auth2');
const {user_by_token,auth_token,user_by_token2} = require('../controllers/auth');
const { ConnectionStates } = require('mongoose');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth,  (req, res) => {
  console.log("1")
  user_by_token(req,res);
  console.log("end1")
});

router.get('/fin', auth2, (req, res) => {
  console.log("123455")
  user_by_token2(req,res);
  console.log("end1123455")
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
   (req, res) => {
    
    auth_token(req,res);
  }
);

module.exports = router;