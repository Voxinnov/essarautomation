const { Status } = require('../models');

const getStatuses = async (req, res, next) => {
    try {
        const statuses = await Status.findAll({ order: [['id', 'ASC']] });
        res.json({ success: true, data: statuses });
    } catch (error) { next(error); }
};

const createStatus = async (req, res, next) => {
    try {
        const { label, color } = req.body;
        const name = label.toLowerCase().replace(/\s+/g, '_');
        const status = await Status.create({ name, label, color });
        res.status(201).json({ success: true, data: status });
    } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
    try {
        const { label, color } = req.body;
        const status = await Status.findByPk(req.params.id);
        if (!status) return res.status(404).json({ success: false, message: 'Status not found' });
        
        const name = label.toLowerCase().replace(/\s+/g, '_');
        await status.update({ name, label, color });
        res.json({ success: true, data: status });
    } catch (error) { next(error); }
};

const deleteStatus = async (req, res, next) => {
    try {
        const status = await Status.findByPk(req.params.id);
        if (!status) return res.status(404).json({ success: false, message: 'Status not found' });
        if (status.is_system) return res.status(400).json({ success: false, message: 'System status cannot be deleted' });
        
        await status.destroy();
        res.json({ success: true, message: 'Status deleted' });
    } catch (error) { next(error); }
};

module.exports = { getStatuses, createStatus, updateStatus, deleteStatus };
