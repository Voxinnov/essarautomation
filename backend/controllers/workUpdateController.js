const { WorkUpdate, Task, User } = require('../models');

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
