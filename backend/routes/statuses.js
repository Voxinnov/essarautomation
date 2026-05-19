const express = require('express');
const router = express.Router();
const { getStatuses, createStatus, updateStatus, deleteStatus } = require('../controllers/statusController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', getStatuses);
router.get('', getStatuses);
router.post('/', hasPermission('settings_manage'), createStatus);
router.post('', hasPermission('settings_manage'), createStatus);
router.put('/:id', hasPermission('settings_manage'), updateStatus);
router.delete('/:id', hasPermission('settings_manage'), deleteStatus);

module.exports = router;
