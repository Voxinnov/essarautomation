const express = require('express');
const router = express.Router();
const { getBillings, createBilling, getBilling, updateBilling, deleteBilling } = require('../controllers/billingController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', hasPermission('billing_view'), getBillings);
router.post('/', hasPermission('billing_create'), createBilling);
router.get('/:id', hasPermission('billing_view'), getBilling);
router.put('/:id', hasPermission('billing_edit'), updateBilling);
router.delete('/:id', hasPermission('billing_delete'), deleteBilling);

module.exports = router;
