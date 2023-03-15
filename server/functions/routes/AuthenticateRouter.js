const express = require('express');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = require('../config/api').LOGIN;
const PROTECTED = require('../config/api').PROTECTED;
const REGISTER = require('../config/api').REGISTER;
const CHANGE_PASSWORD = require('../config/api').CHANGE_PASSWORD;
const AUTH = require('../config/api').AUTH;
const LOGOUT = require('../config/api').LOGOUT;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + AUTH + '/' + LOGIN, AuthenticateController.login, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + LOGOUT, AuthenticateController.logout, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + REGISTER, AuthenticateController.register, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + CHANGE_PASSWORD, AuthenticateController.sendRequestRenewPassword, authMiddleware.validationHandlerMiddleware);

router.put('/' + AUTH + '/' + CHANGE_PASSWORD, authMiddleware.passwordResetTokenVerifyMiddleware, AuthenticateController.updatePassword, authMiddleware.validationHandlerMiddleware);

router.get('/' + AUTH + '/' + CHANGE_PASSWORD, authMiddleware.passwordResetTokenVerifyMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { email: req.email } });
});
router.get('/' + AUTH + '/check?', AuthenticateController.checkMerchantByIcoOrEmail);
router.get('/' + PROTECTED, authMiddleware.authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})

module.exports = router;