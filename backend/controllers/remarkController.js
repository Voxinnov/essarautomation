const { Remark, Task, User } = require('../models');
const { sendNotification } = require('../utils/notifications');

const getRemarks = async (req, res, next) => {
    try {
        const { task_id } = req.params;
        const remarks = await Remark.findAll({
            where: { task_id },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role'] }],
            order: [['created_at', 'DESC']],
        });
        res.json({ success: true, count: remarks.length, data: remarks });
    } catch (error) { next(error); }
};

const createRemark = async (req, res, next) => {
    try {
        const remark = await Remark.create({ ...req.body, user_id: req.user.id });

        // Retrieve task details to notify assigned users
        const task = await Task.findByPk(remark.task_id);
        if (task) {
            // Notify assignee if not the remark creator
            if (task.assigned_to && task.assigned_to !== req.user.id) {
                await sendNotification(
                    task.assigned_to,
                    'New Remark on Task',
                    `${req.user.name} added a remark to task: "${task.title}"`,
                    'new_remark',
                    { taskId: task.id }
                );
            }
            // Notify creator if not the remark creator and not the assignee
            if (task.created_by && task.created_by !== req.user.id && task.created_by !== task.assigned_to) {
                await sendNotification(
                    task.created_by,
                    'New Remark on Task',
                    `${req.user.name} added a remark to task: "${task.title}"`,
                    'new_remark',
                    { taskId: task.id }
                );
            }
        }

        const remarkWithUser = await Remark.findByPk(remark.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role'] }],
        });
        res.status(201).json({ success: true, data: remarkWithUser });
    } catch (error) { next(error); }
};

const deleteRemark = async (req, res, next) => {
    try {
        const remark = await Remark.findByPk(req.params.id);
        if (!remark) return res.status(404).json({ success: false, message: 'Remark not found' });
        if (remark.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await remark.destroy();
        res.json({ success: true, message: 'Remark deleted' });
    } catch (error) { next(error); }
};

module.exports = { getRemarks, createRemark, deleteRemark };
