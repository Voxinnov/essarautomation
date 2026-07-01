const { LeaveRequest, User } = require('../models');
const { Op } = require('sequelize');
const { sendNotification } = require('../utils/notifications');

// Helper to calculate total days between two dates (inclusive)
const calculateDays = (startDate, endDate, halfDay) => {
    if (halfDay && halfDay !== 'none') {
        return 0.5;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff > 0 ? daysDiff : 0;
};

const validateLeaveRules = async (userId, leaveType, startDate, endDate, halfDay, totalDays, excludeLeaveId = null) => {
    const allowedTypes = ['casual', 'medical', 'emergency'];
    if (!allowedTypes.includes(leaveType)) {
        return 'Leave type must be one of: Casual Leave, Medical Leave, Emergency Leave';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsSpanned = new Set();
    
    let current = new Date(start);
    while (current <= end) {
        monthsSpanned.add(`${current.getFullYear()}-${current.getMonth() + 1}`);
        current.setDate(current.getDate() + 1);
    }

    const getLeaveDaysInMonth = async (uId, yr, mth) => {
        const startOfMonth = new Date(yr, mth - 1, 1);
        const endOfMonth = new Date(yr, mth, 0);

        const startStr = startOfMonth.toISOString().split('T')[0];
        const endStr = endOfMonth.toISOString().split('T')[0];

        const whereClause = {
            userId: uId,
            status: { [Op.in]: ['pending', 'approved'] },
            startDate: { [Op.lte]: endStr },
            endDate: { [Op.gte]: startStr }
        };
        if (excludeLeaveId) {
            whereClause.id = { [Op.ne]: excludeLeaveId };
        }

        const leaves = await LeaveRequest.findAll({ where: whereClause });

        let totalDaysVal = 0;
        for (const leave of leaves) {
            if (leave.halfDay && leave.halfDay !== 'none') {
                totalDaysVal += 0.5;
            } else {
                const overlapStart = new Date(Math.max(new Date(leave.startDate), startOfMonth));
                const overlapEnd = new Date(Math.min(new Date(leave.endDate), endOfMonth));
                const timeDiff = overlapEnd.getTime() - overlapStart.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                totalDaysVal += daysDiff > 0 ? daysDiff : 0;
            }
        }
        return totalDaysVal;
    };

    for (const key of monthsSpanned) {
        const [year, month] = key.split('-').map(Number);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        let newDays = 0;
        if (halfDay && halfDay !== 'none') {
            newDays = 0.5;
        } else {
            const overlapStart = new Date(Math.max(start, startOfMonth));
            const overlapEnd = new Date(Math.min(end, endOfMonth));
            const timeDiff = overlapEnd.getTime() - overlapStart.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            newDays = daysDiff > 0 ? daysDiff : 0;
        }

        const existingDays = await getLeaveDaysInMonth(userId, year, month);
        if (existingDays + newDays > 2) {
            return `Only 2 leave days can be applied for per month. You already have ${existingDays} day(s) of leave in ${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}.`;
        }
    }

    if (leaveType === 'casual') {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        const startD = new Date(startDate);
        startD.setHours(0, 0, 0, 0);
        
        const timeDiff = startD.getTime() - todayDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 2) {
            return 'Casual leave must be applied at least 2 days in advance';
        }
    }

    const getWeekRange = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDay();
        const s = new Date(date);
        s.setDate(date.getDate() - day);
        s.setHours(0, 0, 0, 0);

        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        e.setHours(23, 59, 59, 999);

        return { start: s, end: e };
    };

    const weeksToCheck = new Map();
    let currDate = new Date(start);
    while (currDate <= end) {
        const { start: s, end: e } = getWeekRange(currDate);
        const key = s.toISOString().split('T')[0];
        if (!weeksToCheck.has(key)) {
            weeksToCheck.set(key, { start: s, end: e });
        }
        currDate.setDate(currDate.getDate() + 1);
    }

    for (const [_, week] of weeksToCheck) {
        const startStr = week.start.toISOString().split('T')[0];
        const endStr = week.end.toISOString().split('T')[0];
        
        const whereClause = {
            userId,
            status: { [Op.in]: ['pending', 'approved'] },
            startDate: { [Op.lte]: endStr },
            endDate: { [Op.gte]: startStr }
        };
        if (excludeLeaveId) {
            whereClause.id = { [Op.ne]: excludeLeaveId };
        }

        const existingLeaves = await LeaveRequest.findAll({ where: whereClause });
        
        const leaveDates = new Set();
        const addDatesInRange = (rangeStartStr, rangeEndStr) => {
            let d = new Date(rangeStartStr);
            const limit = new Date(rangeEndStr);
            while (d <= limit) {
                if (d >= week.start && d <= week.end) {
                    leaveDates.add(d.toISOString().split('T')[0]);
                }
                d.setDate(d.getDate() + 1);
            }
        };

        for (const l of existingLeaves) {
            addDatesInRange(l.startDate, l.endDate);
        }
        addDatesInRange(startDate, endDate);

        if (leaveDates.size === 2) {
            const sortedDates = Array.from(leaveDates).sort();
            const d1 = new Date(sortedDates[0]);
            const d2 = new Date(sortedDates[1]);
            const diffTime = d2.getTime() - d1.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
            
            if (diffDays !== 1) {
                return `Leaves within the same week must be on consecutive days. You cannot have non-consecutive leaves (${sortedDates[0]} and ${sortedDates[1]}).`;
            }
        } else if (leaveDates.size > 2) {
            return 'You cannot apply for more than 2 leave days in a single week.';
        }
    }

    return null;
};

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = async (req, res, next) => {
    try {
        const { leaveType, startDate, endDate, halfDay, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const totalDays = calculateDays(startDate, endDate, halfDay);
        if (totalDays <= 0) {
            return res.status(400).json({ success: false, message: 'End date must be on or after start date' });
        }

        // Validate Leave Rules
        const validationError = await validateLeaveRules(req.user.id, leaveType, startDate, endDate, halfDay, totalDays);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        // Overlap Check: check if user already has an overlapping approved or pending leave request
        const overlap = await LeaveRequest.findOne({
            where: {
                userId: req.user.id,
                status: { [Op.in]: ['pending', 'approved'] },
                [Op.and]: [
                    { startDate: { [Op.lte]: endDate } },
                    { endDate: { [Op.gte]: startDate } }
                ]
            }
        });

        if (overlap) {
            return res.status(400).json({ 
                success: false, 
                message: `You already have an overlapping ${overlap.status} leave request from ${overlap.startDate} to ${overlap.endDate}` 
            });
        }

        const leave = await LeaveRequest.create({
            userId: req.user.id,
            leaveType,
            startDate,
            endDate,
            halfDay: halfDay || 'none',
            totalDays,
            reason,
            status: 'pending'
        });

        // Notify Admins and Managers
        const approvers = await User.findAll({
            where: {
                role: { [Op.in]: ['admin', 'manager'] },
                status: 'active',
                id: { [Op.ne]: req.user.id } // Don't notify self
            }
        });

        const notificationPromises = approvers.map(approver => 
            sendNotification(
                approver.id,
                'New Leave Request',
                `${req.user.name} requested ${totalDays} day(s) of ${leaveType} leave.`,
                'leave',
                { leaveRequestId: leave.id }
            )
        );
        await Promise.all(notificationPromises);

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user's leave requests
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaveRequests = async (req, res, next) => {
    try {
        const { status, leaveType, page = 1, limit = 10 } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (leaveType) where.leaveType = leaveType;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await LeaveRequest.findAndCountAll({
            where,
            include: [
                { model: User, as: 'approver', attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['startDate', 'DESC']]
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leave requests (Admin/Manager)
// @route   GET /api/leaves/all
// @access  Private (Admin/Manager)
const getAllLeaveRequests = async (req, res, next) => {
    try {
        const { userId, status, leaveType, start_date, end_date, page = 1, limit = 10 } = req.query;
        const where = {};

        if (userId) where.userId = userId;
        if (status) where.status = status;
        if (leaveType) where.leaveType = leaveType;
        if (start_date || end_date) {
            where[Op.or] = [
                { startDate: { [Op.between]: [start_date || '1970-01-01', end_date || '9999-12-31'] } },
                { endDate: { [Op.between]: [start_date || '1970-01-01', end_date || '9999-12-31'] } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await LeaveRequest.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
                { model: User, as: 'approver', attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single leave request details
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveRequest = async (req, res, next) => {
    try {
        const leave = await LeaveRequest.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
                { model: User, as: 'approver', attributes: ['id', 'name'] }
            ]
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        // Authorization: standard staff can only view their own leave requests
        if (req.user.role === 'staff' && leave.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
        }

        res.json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a pending leave request
// @route   PUT /api/leaves/:id
// @access  Private
const updateLeaveRequest = async (req, res, next) => {
    try {
        const { leaveType, startDate, endDate, halfDay, reason } = req.body;
        const leave = await LeaveRequest.findByPk(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        if (leave.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Can only update pending leave requests' });
        }

        const totalDays = calculateDays(
            startDate || leave.startDate,
            endDate || leave.endDate,
            halfDay !== undefined ? halfDay : leave.halfDay
        );

        if (totalDays <= 0) {
            return res.status(400).json({ success: false, message: 'End date must be on or after start date' });
        }

        // Validate Leave Rules
        const validationError = await validateLeaveRules(
            req.user.id,
            leaveType || leave.leaveType,
            startDate || leave.startDate,
            endDate || leave.endDate,
            halfDay !== undefined ? halfDay : leave.halfDay,
            totalDays,
            leave.id
        );
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        // Overlap Check (exclude current request)
        const overlap = await LeaveRequest.findOne({
            where: {
                id: { [Op.ne]: leave.id },
                userId: req.user.id,
                status: { [Op.in]: ['pending', 'approved'] },
                [Op.and]: [
                    { startDate: { [Op.lte]: endDate || leave.endDate } },
                    { endDate: { [Op.gte]: startDate || leave.startDate } }
                ]
            }
        });

        if (overlap) {
            return res.status(400).json({ 
                success: false, 
                message: `Overlapping leave request already exists from ${overlap.startDate} to ${overlap.endDate}` 
            });
        }

        await leave.update({
            leaveType: leaveType || leave.leaveType,
            startDate: startDate || leave.startDate,
            endDate: endDate || leave.endDate,
            halfDay: halfDay !== undefined ? halfDay : leave.halfDay,
            totalDays,
            reason: reason || leave.reason
        });

        res.json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel a pending leave request (delete)
// @route   DELETE /api/leaves/:id
// @access  Private
const cancelLeaveRequest = async (req, res, next) => {
    try {
        const leave = await LeaveRequest.findByPk(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        if (leave.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
        }

        if (leave.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Can only cancel pending leave requests' });
        }

        await leave.destroy();
        res.json({ success: true, message: 'Leave request cancelled successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve or reject a leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin/Manager only)
const approveRejectLeaveRequest = async (req, res, next) => {
    try {
        const { status, comment } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
        }

        const leave = await LeaveRequest.findByPk(req.params.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Can only review pending leave requests' });
        }

        await leave.update({
            status,
            comment: comment || null,
            approvedBy: req.user.id
        });

        // Send real-time notification to the request owner
        await sendNotification(
            leave.userId,
            `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status} by ${req.user.name}.`,
            'leave',
            { leaveRequestId: leave.id }
        );

        res.json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
const getLeaveStats = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        // If Admin/Manager, they get global stats + their own.
        // Otherwise, standard employees only see their own.
        const isApprover = ['admin', 'manager'].includes(req.user.role);

        let stats = {};

        if (isApprover) {
            // Approver overall company stats
            const pendingCount = await LeaveRequest.count({ where: { status: 'pending' } });
            const approvedCount = await LeaveRequest.count({ 
                where: { 
                    status: 'approved',
                    startDate: { [Op.between]: [startOfYear, endOfYear] }
                } 
            });
            const rejectedCount = await LeaveRequest.count({ 
                where: { 
                    status: 'rejected',
                    startDate: { [Op.between]: [startOfYear, endOfYear] }
                } 
            });

            // Employee distribution on leave today
            const todayStr = new Date().toISOString().split('T')[0];
            const onLeaveToday = await LeaveRequest.count({
                where: {
                    status: 'approved',
                    startDate: { [Op.lte]: todayStr },
                    endDate: { [Op.gte]: todayStr }
                }
            });

            stats = {
                company: {
                    pending: pendingCount,
                    approvedThisYear: approvedCount,
                    rejectedThisYear: rejectedCount,
                    onLeaveToday
                }
            };
        }

        // Personal user stats
        const myPending = await LeaveRequest.count({ where: { userId: req.user.id, status: 'pending' } });
        const myApprovedRows = await LeaveRequest.findAll({
            where: {
                userId: req.user.id,
                status: 'approved',
                startDate: { [Op.between]: [startOfYear, endOfYear] }
            }
        });

        const myApprovedDays = myApprovedRows.reduce((sum, item) => sum + parseFloat(item.totalDays || 0), 0);
        
        stats.personal = {
            pending: myPending,
            approvedDaysThisYear: myApprovedDays,
            totalRequestsThisYear: await LeaveRequest.count({
                where: {
                    userId: req.user.id,
                    startDate: { [Op.between]: [startOfYear, endOfYear] }
                }
            })
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
    getAllLeaveRequests,
    getLeaveRequest,
    updateLeaveRequest,
    cancelLeaveRequest,
    approveRejectLeaveRequest,
    getLeaveStats
};
