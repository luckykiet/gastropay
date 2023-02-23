const express = require('express');
const config = require('../config');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = config.PATHS.MERCHANT;
const router = express.Router();

router.post('/' + MERCHANT, MerchantController.createMerchant);
router.put('/' + MERCHANT + '/:id', MerchantController.updateMerchant);
router.delete('/' + MERCHANT + '/:id', MerchantController.deleteMerchant);
router.get('/' + MERCHANT + '/check?', MerchantController.checkMerchantByIco);
router.get('/' + MERCHANT + '?', MerchantController.getMerchantByIdOrIco);
router.get('/' + MERCHANT + 's', MerchantController.getMerchants);
router.get('/' + MERCHANT + 's?', MerchantController.getMerchants);
router.get('/' + MERCHANT + 's/search?', MerchantController.searchMerchants);

module.exports = router;