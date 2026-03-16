const express = require('express');
const router = express.Router();
const { getRemarks, createRemark, deleteRemark } = require('../controllers/remarkController');
const { protect } = require('../middleware/auth');

router.get('/task/:task_id', protect, getRemarks);
router.post('/', protect, createRemark);
router.delete('/:id', protect, deleteRemark);

module.exports = router;
