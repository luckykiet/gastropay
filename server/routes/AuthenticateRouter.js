const express = require('express');
const config = require('../config');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = config.PATHS.LOGIN;
const PROTECTED = config.PATHS.PROTECTED;
const REGISTER = config.PATHS.REGISTER;
const router = express.Router();

router.post('/' + LOGIN, AuthenticateController.login);
router.post('/' + REGISTER, AuthenticateController.register);
router.get('/' + PROTECTED, AuthenticateController.authenticateToken)
module.exports = router;