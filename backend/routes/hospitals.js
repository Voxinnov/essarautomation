const express = require('express');
const router = express.Router();
const { getHospitals, createHospital, getHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', hasPermission('hospitals_view'), getHospitals);
router.post('/', hasPermission('hospitals_create'), createHospital);
router.get('/:id', hasPermission('hospitals_view'), getHospital);
router.put('/:id', hasPermission('hospitals_edit'), updateHospital);
router.delete('/:id', hasPermission('hospitals_delete'), deleteHospital);

module.exports = router;
