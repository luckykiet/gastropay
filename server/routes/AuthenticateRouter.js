const express = require('express');
const config = require('../../src/config/config');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = config.PATHS.API.LOGIN;
const PROTECTED = config.PATHS.API.PROTECTED;
const REGISTER = config.PATHS.API.REGISTER;
const ADMIN = config.PATHS.API.ADMIN;
const AUTH = config.PATHS.API.AUTH;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + AUTH + '/' + LOGIN, AuthenticateController.login);
router.post('/' + AUTH + '/' + REGISTER, AuthenticateController.register);

router.get('/' + AUTH + '/check?', AuthenticateController.checkMerchantByIcoOrEmail);
router.get('/' + PROTECTED, authMiddleware.authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})
router.get('/' + ADMIN + '/' + PROTECTED, authMiddleware.authAdminMiddleware(ADMIN), (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})

module.exports = router;