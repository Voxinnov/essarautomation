const express = require('express');
const router = express.Router();
const {
    createLeaveRequest,
    getMyLeaveRequests,
    getAllLeaveRequests,
    getLeaveRequest,
    updateLeaveRequest,
    cancelLeaveRequest,
    approveRejectLeaveRequest,
    getLeaveStats
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyLeaveRequests);
router.get('/all', protect, authorize('admin', 'manager'), getAllLeaveRequests);
router.get('/stats', protect, getLeaveStats);
router.post('/', protect, createLeaveRequest);
router.get('/:id', protect, getLeaveRequest);
router.put('/:id', protect, updateLeaveRequest);
router.delete('/:id', protect, cancelLeaveRequest);
router.put('/:id/approve', protect, authorize('admin', 'manager'), approveRejectLeaveRequest);

module.exports = router;
