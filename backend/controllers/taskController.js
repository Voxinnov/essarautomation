const { Op } = require('sequelize');
const { Task, Client, Hospital, Doctor, User, Role } = require('../models');

// @desc    Get all tasks with filters and pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
    try {
        const { status, priority, assigned_to, client_id, search, page = 1, limit = 10 } = req.query;
        const where = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assigned_to) where.assigned_to = assigned_to;
        if (client_id) where.client_id = client_id;
        if (search) where.title = { [Op.like]: `%${search}%` };

        // Staff can only see their assigned tasks
        if (req.user.role === 'staff') where.assigned_to = req.user.id;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Task.findAndCountAll({
            where,
            include: [
                { model: Client, as: 'client', attributes: ['id', 'patient_name', 'phone'] },
                { model: Hospital, as: 'hospital', attributes: ['id', 'hospital_name'] },
                { model: Doctor, as: 'doctor', attributes: ['id', 'doctor_name', 'department'] },
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
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

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
    try {
        const task = await Task.create({ ...req.body, created_by: req.user.id });
        const taskWithDetails = await Task.findByPk(task.id, {
            include: [
                { model: Client, as: 'client', attributes: ['id', 'patient_name'] },
                { model: Hospital, as: 'hospital', attributes: ['id', 'hospital_name'] },
                { model: Doctor, as: 'doctor', attributes: ['id', 'doctor_name'] },
                { model: User, as: 'assignee', attributes: ['id', 'name'] },
            ],
        });
        res.status(201).json({ success: true, data: taskWithDetails });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Hospital, as: 'hospital' },
                { model: Doctor, as: 'doctor' },
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
            ],
        });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
    try {
        let task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        await task.update(req.body);
        task = await Task.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client', attributes: ['id', 'patient_name'] },
                { model: Hospital, as: 'hospital', attributes: ['id', 'hospital_name'] },
                { model: Doctor, as: 'doctor', attributes: ['id', 'doctor_name'] },
                { model: User, as: 'assignee', attributes: ['id', 'name'] },
            ],
        });
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager)
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        await task.destroy();
        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get form options (clients, hospitals, doctors, staff users) - accessible to all with tasks_view
// @route   GET /api/tasks/options
// @access  Private (tasks_view)
const getTaskOptions = async (req, res, next) => {
    try {
        const [clients, hospitals, doctors, users] = await Promise.all([
            Client.findAll({
                attributes: ['id', 'patient_name', 'phone'],
                order: [['patient_name', 'ASC']],
                limit: 500,
            }),
            Hospital.findAll({
                attributes: ['id', 'hospital_name', 'location'],
                order: [['hospital_name', 'ASC']],
                limit: 500,
            }),
            Doctor.findAll({
                attributes: ['id', 'doctor_name', 'department', 'hospital_id'],
                order: [['doctor_name', 'ASC']],
                limit: 500,
            }),
            User.findAll({
                attributes: ['id', 'name', 'email', 'role'],
                where: { status: 'active' },
                order: [['name', 'ASC']],
                limit: 200,
            }),
        ]);

        res.json({
            success: true,
            data: { clients, hospitals, doctors, users },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, getTaskOptions };
