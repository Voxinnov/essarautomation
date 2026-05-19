const express = require('express');
const router = express.Router();
const { getClients, createClient, getClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', hasPermission('clients_view'), getClients);
router.post('/', hasPermission('clients_create'), createClient);
router.get('/:id', hasPermission('clients_view'), getClient);
router.put('/:id', hasPermission('clients_edit'), updateClient);
router.delete('/:id', hasPermission('clients_delete'), deleteClient);

module.exports = router;
