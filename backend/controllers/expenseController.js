const { Expense, User } = require('../models');
const { Op } = require('sequelize');

const getExpenses = async (req, res, next) => {
    try {
        const { category, start_date, end_date, search, page = 1, limit = 10 } = req.query;
        const where = {};
        if (category) where.category = category;
        if (search) where.title = { [Op.like]: `%${search}%` };
        if (start_date || end_date) {
            where.date = {};
            if (start_date) where.date[Op.gte] = start_date;
            if (end_date) where.date[Op.lte] = end_date;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Expense.findAndCountAll({
            where,
            include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
            limit: parseInt(limit),
            offset,
            order: [['date', 'DESC']],
        });
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), data: rows });
    } catch (error) { next(error); }
};

const createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create({ ...req.body, created_by: req.user.id });
        res.status(201).json({ success: true, data: expense });
    } catch (error) { next(error); }
};

const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: expense });
    } catch (error) { next(error); }
};

const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        await expense.update(req.body);
        res.json({ success: true, data: expense });
    } catch (error) { next(error); }
};

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        await expense.destroy();
        res.json({ success: true, message: 'Expense deleted' });
    } catch (error) { next(error); }
};

module.exports = { getExpenses, createExpense, getExpense, updateExpense, deleteExpense };
