const express = require('express');
const config = require('../../src/config/config');
const AdminController = require('../controllers/AdminController');
const MERCHANT = config.PATHS.API.MERCHANT;
const RESTAURANT = config.PATHS.API.RESTAURANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');


module.exports = router;