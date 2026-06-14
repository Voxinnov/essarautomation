const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getToday,
    getMyAttendance,
    getAllAttendance,
    getSummary,
    getLiveLocations,
    getTravelReport,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getToday);
router.get('/my', protect, getMyAttendance);

// Admin/Manager routes
router.get('/live', protect, authorize('admin', 'manager'), getLiveLocations);
router.get('/travel-report', protect, authorize('admin', 'manager'), getTravelReport);
router.get('/all', protect, authorize('admin', 'manager'), getAllAttendance);
router.get('/summary', protect, authorize('admin', 'manager'), getSummary);

module.exports = router;
