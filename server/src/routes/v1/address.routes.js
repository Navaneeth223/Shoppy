'use strict';

const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/address.controller');
const { protect } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { addAddressRules } = require('../../validators/user.validator');

router.use(protect);

router.get('/', addressController.getAddresses);
router.post('/', addAddressRules, validate, addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/default', addressController.setDefaultAddress);

module.exports = router;
