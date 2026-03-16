const { Task, Billing, Expense, TimeLog, User, Client } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Task statistics
        const totalTasks = await Task.count();
        const pendingTasks = await Task.count({ where: { status: 'pending' } });
        const inProgressTasks = await Task.count({ where: { status: 'in_progress' } });
        const completedTasks = await Task.count({ where: { status: 'completed' } });
        const onHoldTasks = await Task.count({ where: { status: 'on_hold' } });

        // Billing summary
        const billingStats = await Billing.findAll({
            attributes: [
                'status',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['status'],
            raw: true,
        });

        const totalBilling = billingStats.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);
        const paidBilling = billingStats.find(b => b.status === 'paid')?.total || 0;
        const pendingBilling = billingStats.find(b => b.status === 'pending')?.total || 0;

        // Expense summary
        const totalExpenses = await Expense.sum('amount') || 0;
        const monthlyExpenses = await Expense.sum('amount', {
            where: { date: { [Op.between]: [firstDayMonth.toISOString().split('T')[0], lastDayMonth.toISOString().split('T')[0]] } },
        }) || 0;

        // Employee work hours
        const employeeHours = await TimeLog.findAll({
            attributes: [
                'user_id',
                [sequelize.fn('SUM', sequelize.col('TimeLog.total_hours')), 'total_hours'],
            ],
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
            group: ['user_id', 'user.id', 'user.name'],
            raw: false,
            order: [[sequelize.fn('SUM', sequelize.col('TimeLog.total_hours')), 'DESC']],
            limit: 10,
        });

        // Task status chart data
        const taskStatusData = [
            { name: 'Pending', value: pendingTasks, color: '#FF9800' },
            { name: 'In Progress', value: inProgressTasks, color: '#2196F3' },
            { name: 'Completed', value: completedTasks, color: '#4CAF50' },
            { name: 'On Hold', value: onHoldTasks, color: '#9E9E9E' },
        ];

        // Monthly task trend (last 6 months)
        const monthlyTasks = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const count = await Task.count({
                where: { created_at: { [Op.between]: [start, end] } },
            });
            monthlyTasks.push({
                month: start.toLocaleString('default', { month: 'short' }),
                count,
            });
        }

        // Recent tasks
        const recentTasks = await Task.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }],
        });

        // Totals
        const totalUsers = await User.count();
        const totalClients = await Client.count();

        res.json({
            success: true,
            data: {
                tasks: { total: totalTasks, pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks, onHold: onHoldTasks },
                billing: { total: totalBilling.toFixed(2), paid: parseFloat(paidBilling).toFixed(2), pending: parseFloat(pendingBilling).toFixed(2) },
                expenses: { total: totalExpenses.toFixed(2), monthly: monthlyExpenses.toFixed(2) },
                employeeHours,
                taskStatusData,
                monthlyTasks,
                recentTasks,
                totals: { users: totalUsers, clients: totalClients },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard };
