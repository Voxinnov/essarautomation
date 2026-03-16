const { Remark, Task, User } = require('../models');

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
