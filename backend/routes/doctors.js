const express = require('express');
const router = express.Router();
const { getDoctors, createDoctor, getDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', hasPermission('doctors_view'), getDoctors);
router.post('/', hasPermission('doctors_create'), createDoctor);
router.get('/:id', hasPermission('doctors_view'), getDoctor);
router.put('/:id', hasPermission('doctors_edit'), updateDoctor);
router.delete('/:id', hasPermission('doctors_delete'), deleteDoctor);

module.exports = router;
