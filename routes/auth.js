const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {user_by_token,auth_token} = require('../controllers/auth');
const { ConnectionStates } = require('mongoose');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth,  (req, res) => {
  
  user_by_token(req,res);
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