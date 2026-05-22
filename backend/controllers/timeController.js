const { TimeLog, Task, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Start timer
// @route   POST /api/time/start
const startTimer = async (req, res, next) => {
    try {
        const { task_id, description, latitude, longitude, address } = req.body;
        // Check if there's already an active timer
        const active = await TimeLog.findOne({
            where: { user_id: req.user.id, end_time: null },
        });
        if (active) {
            return res.status(400).json({ success: false, message: 'You already have an active timer. Stop it first.' });
        }
        const log = await TimeLog.create({
            task_id, user_id: req.user.id, start_time: new Date(), description, is_manual: false,
            start_latitude: latitude || null,
            start_longitude: longitude || null,
            start_address: address || null,
        });
        res.status(201).json({ success: true, data: log });
    } catch (error) { next(error); }
};

// @desc    Stop timer
// @route   POST /api/time/stop/:id
const stopTimer = async (req, res, next) => {
    try {
        const { latitude, longitude, address } = req.body || {};
        const log = await TimeLog.findByPk(req.params.id);
        if (!log) return res.status(404).json({ success: false, message: 'Time log not found' });
        if (log.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const endTime = new Date();
        const totalHours = ((endTime - new Date(log.start_time)) / (1000 * 60 * 60)).toFixed(2);
        await log.update({
            end_time: endTime,
            total_hours: totalHours,
            stop_latitude: latitude || null,
            stop_longitude: longitude || null,
            stop_address: address || null,
        });
        res.json({ success: true, data: log });
    } catch (error) { next(error); }
};

// @desc    Manual time entry
// @route   POST /api/time/manual
const manualEntry = async (req, res, next) => {
    try {
        const { task_id, start_time, end_time, description } = req.body;
        const totalHours = ((new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60)).toFixed(2);
        const log = await TimeLog.create({
            task_id, user_id: req.user.id, start_time, end_time, total_hours: totalHours, description, is_manual: true,
        });
        res.status(201).json({ success: true, data: log });
    } catch (error) { next(error); }
};

// @desc    Get active timer
// @route   GET /api/time/active
const getActiveTimer = async (req, res, next) => {
    try {
        const active = await TimeLog.findOne({
            where: { user_id: req.user.id, end_time: null },
            include: [{ model: Task, as: 'task', attributes: ['id', 'title'] }],
        });
        res.json({ success: true, data: active });
    } catch (error) { next(error); }
};

// @desc    Get time report
// @route   GET /api/time/report
const getReport = async (req, res, next) => {
    try {
        const { user_id, task_id, start_date, end_date, page = 1, limit = 10 } = req.query;
        const where = {};
        if (req.user.role === 'staff') where.user_id = req.user.id;
        else if (user_id) where.user_id = user_id;
        if (task_id) where.task_id = task_id;
        if (start_date || end_date) {
            where.start_time = {};
            if (start_date) where.start_time[Op.gte] = new Date(start_date);
            if (end_date) where.start_time[Op.lte] = new Date(end_date + 'T23:59:59');
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await TimeLog.findAndCountAll({
            where,
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: User, as: 'user', attributes: ['id', 'name'] },
            ],
            limit: parseInt(limit),
            offset,
            order: [['start_time', 'DESC']],
        });

        const totalHours = rows.reduce((sum, log) => sum + parseFloat(log.total_hours || 0), 0);
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), totalHours: totalHours.toFixed(2), data: rows });
    } catch (error) { next(error); }
};

// @desc    Get all time logs
// @route   GET /api/time
const getTimeLogs = async (req, res, next) => {
    try {
        const where = req.user.role === 'staff' ? { user_id: req.user.id } : {};
        const logs = await TimeLog.findAll({
            where,
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: User, as: 'user', attributes: ['id', 'name'] },
            ],
            order: [['created_at', 'DESC']],
            limit: 50,
        });
        res.json({ success: true, data: logs });
    } catch (error) { next(error); }
};

module.exports = { startTimer, stopTimer, manualEntry, getActiveTimer, getReport, getTimeLogs };
