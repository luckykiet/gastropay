const express = require('express');
const config = require('../../config/config');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = config.PATHS.API.MERCHANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddleware');

router.post('/' + MERCHANT, authMiddleware, MerchantController.createMerchant);
router.put('/' + MERCHANT + '/:id', authMiddleware, MerchantController.updateMerchant);
router.delete('/' + MERCHANT + '/:id', authMiddleware, MerchantController.deleteMerchant);
router.get('/' + MERCHANT + '/check?', authMiddleware, MerchantController.checkMerchantByIcoOrEmail);
router.get('/' + MERCHANT + '?', authMiddleware, MerchantController.getMerchantByIdOrIco);
router.get('/' + MERCHANT + 's', authMiddleware, MerchantController.getMerchants);
router.get('/' + MERCHANT + 's?', authMiddleware, MerchantController.getMerchants);
router.get('/' + MERCHANT + 's/search?', authMiddleware, MerchantController.searchMerchants);

module.exports = router;