const express = require('express');
const config = require('../../src/config/config');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = config.PATHS.API.LOGIN;
const PROTECTED = config.PATHS.API.PROTECTED;
const REGISTER = config.PATHS.API.REGISTER;
const router = express.Router();
const authMiddleware = require('./AuthMiddleware');

router.post('/' + LOGIN, AuthenticateController.login);
router.post('/' + REGISTER, AuthenticateController.register);
router.get('/' + PROTECTED, authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})
module.exports = router;