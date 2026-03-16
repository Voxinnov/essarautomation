const express = require('express');
const router = express.Router();
const { getHospitals, createHospital, getHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getHospitals);
router.post('/', protect, createHospital);
router.get('/:id', protect, getHospital);
router.put('/:id', protect, updateHospital);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteHospital);

module.exports = router;
