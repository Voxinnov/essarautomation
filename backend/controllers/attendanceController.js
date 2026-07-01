const { Attendance, User, TimeLog, Task } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// IST offset: UTC+5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Get current date and time in IST.
 */
const getISTNow = () => {
    const now = new Date();
    return new Date(now.getTime() + IST_OFFSET_MS);
};

/**
 * Get today's date string in IST (YYYY-MM-DD).
 */
const getTodayIST = () => {
    const ist = getISTNow();
    return ist.toISOString().split('T')[0];
};

/**
 * Check if a given UTC datetime is before 9:30 AM IST.
 */
const isBeforeCutoff = (utcDate) => {
    const istTime = new Date(new Date(utcDate).getTime() + IST_OFFSET_MS);
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    // Before 9:30 AM IST
    return (hours < 9) || (hours === 9 && minutes < 30);
};

/**
 * Determine attendance status based on check-in time and total hours.
 */
const computeStatus = (checkInTime, totalHours) => {
    const onTime = isBeforeCutoff(checkInTime);
    if (totalHours !== null && totalHours !== undefined && totalHours > 0) {
        if (totalHours < 4) {
            return 'half_day';
        }
        if (totalHours >= 4 && totalHours < 8) {
            return 'half_day';
        }
        // totalHours >= 8
        return onTime ? 'present' : 'late';
    }
    // No checkout yet — base on check-in time
    return onTime ? 'present' : 'late';
};

// @desc    Check in for today
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res, next) => {
    try {
        const { latitude, longitude, address } = req.body;
        const todayStr = getTodayIST();

        // Check if already checked in today
        const existing = await Attendance.findOne({
            where: { user_id: req.user.id, date: todayStr },
        });
        if (existing && existing.check_in_time) {
            return res.status(400).json({
                success: false,
                message: 'You have already checked in today.',
            });
        }

        const now = new Date();
        const status = isBeforeCutoff(now) ? 'present' : 'late';

        let attendance;
        if (existing) {
            // Update existing record (e.g., was marked absent)
            await existing.update({
                check_in_time: now,
                status,
                check_in_latitude: latitude || null,
                check_in_longitude: longitude || null,
                check_in_address: address || null,
            });
            attendance = existing;
        } else {
            attendance = await Attendance.create({
                user_id: req.user.id,
                date: todayStr,
                check_in_time: now,
                status,
                check_in_latitude: latitude || null,
                check_in_longitude: longitude || null,
                check_in_address: address || null,
            });
        }

        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

// @desc    Check out for today
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
    try {
        const { latitude, longitude, address } = req.body;
        const todayStr = getTodayIST();

        const attendance = await Attendance.findOne({
            where: { user_id: req.user.id, date: todayStr },
        });

        if (!attendance || !attendance.check_in_time) {
            return res.status(400).json({
                success: false,
                message: 'You have not checked in today.',
            });
        }

        if (attendance.check_out_time) {
            return res.status(400).json({
                success: false,
                message: 'You have already checked out today.',
            });
        }

        const now = new Date();
        const totalHours = ((now - new Date(attendance.check_in_time)) / (1000 * 60 * 60)).toFixed(2);
        const status = computeStatus(attendance.check_in_time, parseFloat(totalHours));

        await attendance.update({
            check_out_time: now,
            total_hours: totalHours,
            status,
            check_out_latitude: latitude || null,
            check_out_longitude: longitude || null,
            check_out_address: address || null,
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

// @desc    Get today's attendance for current user
// @route   GET /api/attendance/today
// @access  Private
const getToday = async (req, res, next) => {
    try {
        const todayStr = getTodayIST();
        const attendance = await Attendance.findOne({
            where: { user_id: req.user.id, date: todayStr },
        });
        res.json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res, next) => {
    try {
        const { start_date, end_date, page = 1, limit = 30 } = req.query;
        const where = { user_id: req.user.id };

        if (start_date || end_date) {
            where.date = {};
            if (start_date) where.date[Op.gte] = start_date;
            if (end_date) where.date[Op.lte] = end_date;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Attendance.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['date', 'DESC']],
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users' attendance (admin/manager)
// @route   GET /api/attendance/all
// @access  Private (admin/manager)
const getAllAttendance = async (req, res, next) => {
    try {
        const { user_id, start_date, end_date, status, page = 1, limit = 50 } = req.query;
        const where = {};

        if (user_id) where.user_id = user_id;
        if (status) where.status = status;
        if (start_date || end_date) {
            where.date = {};
            if (start_date) where.date[Op.gte] = start_date;
            if (end_date) where.date[Op.lte] = end_date;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Attendance.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
            limit: parseInt(limit),
            offset,
            order: [['date', 'DESC'], ['check_in_time', 'DESC']],
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get monthly summary (admin/manager)
// @route   GET /api/attendance/summary
// @access  Private (admin/manager)
const getSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        const records = await Attendance.findAll({
            where: {
                date: { [Op.gte]: startDate, [Op.lte]: endDate },
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
            order: [['user_id', 'ASC'], ['date', 'ASC']],
        });

        // Group by user
        const userSummary = {};
        records.forEach((record) => {
            const uid = record.user_id;
            if (!userSummary[uid]) {
                userSummary[uid] = {
                    user: record.user,
                    present: 0,
                    late: 0,
                    half_day: 0,
                    absent: 0,
                    total_hours: 0,
                };
            }
            userSummary[uid][record.status]++;
            userSummary[uid].total_hours += parseFloat(record.total_hours || 0);
        });

        const summary = Object.values(userSummary).map((s) => ({
            ...s,
            total_hours: parseFloat(s.total_hours.toFixed(2)),
            total_days: s.present + s.late + s.half_day + s.absent,
            working_days: s.present + s.late + s.half_day,
        }));

        res.json({
            success: true,
            month: targetMonth,
            year: targetYear,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all checked-in users' locations for today (admin/manager)
// @route   GET /api/attendance/live
// @access  Private (admin/manager)
const getLiveLocations = async (req, res, next) => {
    try {
        const todayStr = getTodayIST();
        const records = await Attendance.findAll({
            where: {
                date: todayStr,
                check_in_time: { [Op.ne]: null }
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
            order: [['check_in_time', 'DESC']],
        });
        res.json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(3)); // 3 decimal precision
};

// @desc    Get travel expense and distance report for a given date
// @route   GET /api/attendance/travel-report
// @access  Private (admin/manager)
const getTravelReport = async (req, res, next) => {
    try {
        const { date } = req.query;
        const targetDate = date || getTodayIST();

        // Fetch all attendance records for this date
        const records = await Attendance.findAll({
            where: { date: targetDate },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
            order: [['check_in_time', 'ASC']]
        });

        const reportData = [];

        for (const record of records) {
            if (!record.check_in_time) continue;

            const checkInTime = record.check_in_time;
            const checkOutTime = record.check_out_time;

            // Fetch all time logs during the shift
            const timeLogWhere = {
                user_id: record.user_id,
                start_time: {
                    [Op.gte]: checkInTime
                }
            };

            if (checkOutTime) {
                timeLogWhere.start_time[Op.lte] = checkOutTime;
            }

            const timeLogs = await TimeLog.findAll({
                where: timeLogWhere,
                order: [['start_time', 'ASC']],
                include: [{ model: Task, as: 'task', attributes: ['id', 'title'] }]
            });

            // Assemble chronological route points
            const points = [];

            // Add Check-in point
            if (record.check_in_latitude && record.check_in_longitude) {
                points.push({
                    type: 'check-in',
                    time: record.check_in_time,
                    lat: parseFloat(record.check_in_latitude),
                    lng: parseFloat(record.check_in_longitude),
                    address: record.check_in_address || 'Check-in Location',
                    description: 'Shift Started / Checked In'
                });
            }

            // Add Time logs points
            timeLogs.forEach(log => {
                if (log.start_latitude && log.start_longitude) {
                    points.push({
                        type: 'task-start',
                        time: log.start_time,
                        lat: parseFloat(log.start_latitude),
                        lng: parseFloat(log.start_longitude),
                        address: log.start_address || 'Task Start Location',
                        description: `Started Task: ${log.task?.title || 'Untitled'}`
                    });
                }
                if (log.stop_latitude && log.stop_longitude) {
                    points.push({
                        type: 'task-stop',
                        time: log.end_time || log.updatedAt || log.updated_at || new Date(),
                        lat: parseFloat(log.stop_latitude),
                        lng: parseFloat(log.stop_longitude),
                        address: log.stop_address || 'Task Stop Location',
                        description: `Stopped Task: ${log.task?.title || 'Untitled'}`
                    });
                }
            });

            // Add Check-out point
            if (checkOutTime && record.check_out_latitude && record.check_out_longitude) {
                points.push({
                    type: 'check-out',
                    time: record.check_out_time,
                    lat: parseFloat(record.check_out_latitude),
                    lng: parseFloat(record.check_out_longitude),
                    address: record.check_out_address || 'Check-out Location',
                    description: 'Shift Completed / Checked Out'
                });
            }

            // Calculate total distance between sequential coordinates
            let totalDistance = 0;
            const validPoints = points.filter(p => p.lat && p.lng);
            for (let i = 0; i < validPoints.length - 1; i++) {
                const dist = getDistanceKm(
                    validPoints[i].lat,
                    validPoints[i].lng,
                    validPoints[i + 1].lat,
                    validPoints[i + 1].lng
                );
                totalDistance += dist;
            }

            reportData.push({
                user: record.user,
                attendance: {
                    id: record.id,
                    check_in_time: record.check_in_time,
                    check_out_time: record.check_out_time,
                    status: record.status
                },
                points: validPoints,
                totalDistanceKm: parseFloat(totalDistance.toFixed(2))
            });
        }

        res.json({ success: true, data: reportData });
    } catch (error) {
        next(error);
    }
};

// @desc    Update live location
// @route   POST /api/attendance/update-location
// @access  Private
const updateLocation = async (req, res, next) => {
    try {
        const { latitude, longitude, address } = req.body;

        // Validation: Check presence
        if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required.',
            });
        }

        // Validation: Convert to number and check validity/ranges
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);
        if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates. Latitude must be between -90 and 90. Longitude must be between -180 and 180.',
            });
        }

        const todayStr = getTodayIST();

        const attendance = await Attendance.findOne({
            where: { user_id: req.user.id, date: todayStr },
        });

        if (!attendance || !attendance.check_in_time || attendance.check_out_time) {
            return res.status(400).json({
                success: false,
                message: 'Not currently checked in.',
            });
        }

        await attendance.update({
            current_latitude: latNum,
            current_longitude: lngNum,
            current_address: address || attendance.current_address,
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

module.exports = { checkIn, checkOut, getToday, getMyAttendance, getAllAttendance, getSummary, getLiveLocations, getTravelReport, updateLocation };

