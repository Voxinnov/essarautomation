const express = require('express');
const router = express.Router();
const { getDoctors, createDoctor, getDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.post('/', protect, createDoctor);
router.get('/:id', protect, getDoctor);
router.put('/:id', protect, updateDoctor);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteDoctor);

module.exports = router;
