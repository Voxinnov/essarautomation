const express = require('express');
const router = express.Router();
const { getWorkUpdates, createWorkUpdate, updateWorkUpdate, deleteWorkUpdate } = require('../controllers/workUpdateController');
const { protect } = require('../middleware/auth');

router.get('/task/:task_id', protect, getWorkUpdates);
router.post('/', protect, createWorkUpdate);
router.put('/:id', protect, updateWorkUpdate);
router.delete('/:id', protect, deleteWorkUpdate);

module.exports = router;
