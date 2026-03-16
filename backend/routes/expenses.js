const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, getExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.get('/:id', protect, getExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteExpense);

module.exports = router;
