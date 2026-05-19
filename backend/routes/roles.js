const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole, getPermissions } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/permissions', getPermissions);
router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;
