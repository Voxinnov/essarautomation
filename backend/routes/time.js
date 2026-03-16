const express = require('express');
const router = express.Router();
const { startTimer, stopTimer, manualEntry, getActiveTimer, getReport, getTimeLogs } = require('../controllers/timeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTimeLogs);
router.post('/start', protect, startTimer);
router.post('/stop/:id', protect, stopTimer);
router.post('/manual', protect, manualEntry);
router.get('/active', protect, getActiveTimer);
router.get('/report', protect, getReport);

module.exports = router;
