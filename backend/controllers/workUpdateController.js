const { WorkUpdate, Task, User } = require('../models');
const { sendNotification } = require('../utils/notifications');

const getWorkUpdates = async (req, res, next) => {
    try {
        const { task_id } = req.params;
        const updates = await WorkUpdate.findAll({
            where: { task_id },
            include: [
                { model: User, as: 'updater', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'] },
            ],
            order: [['created_at', 'DESC']],
        });
        res.json({ success: true, count: updates.length, data: updates });
    } catch (error) { next(error); }
};

const createWorkUpdate = async (req, res, next) => {
    try {
        const update = await WorkUpdate.create({ ...req.body, updated_by: req.user.id });

        // Retrieve task details to notify assigned users
        const task = await Task.findByPk(update.task_id);
        if (task) {
            // Notify assignee if not the updater
            if (task.assigned_to && task.assigned_to !== req.user.id) {
                await sendNotification(
                    task.assigned_to,
                    'New Work Update',
                    `${req.user.name} added a work update to task: "${task.title}"`,
                    'new_work_update',
                    { taskId: task.id }
                );
            }
            // Notify task creator if not the updater and not the assignee
            if (task.created_by && task.created_by !== req.user.id && task.created_by !== task.assigned_to) {
                await sendNotification(
                    task.created_by,
                    'New Work Update',
                    `${req.user.name} added a work update to task: "${task.title}"`,
                    'new_work_update',
                    { taskId: task.id }
                );
            }
        }

        res.status(201).json({ success: true, data: update });
    } catch (error) { next(error); }
};

const updateWorkUpdate = async (req, res, next) => {
    try {
        const update = await WorkUpdate.findByPk(req.params.id);
        if (!update) return res.status(404).json({ success: false, message: 'Work update not found' });
        await update.update(req.body);
        res.json({ success: true, data: update });
    } catch (error) { next(error); }
};

const deleteWorkUpdate = async (req, res, next) => {
    try {
        const update = await WorkUpdate.findByPk(req.params.id);
        if (!update) return res.status(404).json({ success: false, message: 'Work update not found' });
        await update.destroy();
        res.json({ success: true, message: 'Work update deleted' });
    } catch (error) { next(error); }
};

module.exports = { getWorkUpdates, createWorkUpdate, updateWorkUpdate, deleteWorkUpdate };
