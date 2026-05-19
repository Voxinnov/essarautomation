const express = require('express');
const router = express.Router();
const { getProducts, getBrands, getCategories, createTransaction, getDashboard, createProduct, deleteProduct, getTransactions } = require('../controllers/stockController');
const { resolveBackorders, getAllBackorders } = require('../controllers/taskProductController');
const { protect } = require('../middleware/auth');

router.get('/products', protect, getProducts);
router.post('/products', protect, createProduct);
router.delete('/products/:id', protect, deleteProduct);
router.get('/brands', protect, getBrands);
router.get('/categories', protect, getCategories);
router.post('/transaction', protect, createTransaction);
router.get('/transactions', protect, getTransactions);
router.get('/dashboard', protect, getDashboard);
router.get('/backorders', protect, getAllBackorders);
router.post('/backorders/resolve', protect, resolveBackorders);

module.exports = router;
