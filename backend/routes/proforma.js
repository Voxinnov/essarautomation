const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getProformaInvoices, 
    getProformaInvoice, 
    createProformaInvoice, 
    updateProformaInvoice, 
    deleteProformaInvoice,
    convertToInvoice
} = require('../controllers/proformaController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/', getProformaInvoices);
router.post('/', createProformaInvoice);
router.post('/:id/convert', convertToInvoice);
router.get('/:id', getProformaInvoice);
router.put('/:id', updateProformaInvoice);
router.delete('/:id', deleteProformaInvoice);

module.exports = router;
