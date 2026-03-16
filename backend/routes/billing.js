const express = require('express');
const router = express.Router();
const { getBillings, createBilling, getBilling, updateBilling, deleteBilling } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getBillings);
router.post('/', protect, authorize('admin', 'manager'), createBilling);
router.get('/:id', protect, getBilling);
router.put('/:id', protect, authorize('admin', 'manager'), updateBilling);
router.delete('/:id', protect, authorize('admin'), deleteBilling);

module.exports = router;
