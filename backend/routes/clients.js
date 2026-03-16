const express = require('express');
const router = express.Router();
const { getClients, createClient, getClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getClients);
router.post('/', protect, createClient);
router.get('/:id', protect, getClient);
router.put('/:id', protect, updateClient);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteClient);

module.exports = router;
