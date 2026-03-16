const { Op } = require('sequelize');
const { Hospital, User } = require('../models');

const getHospitals = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const where = {};
        if (search) where[Op.or] = [{ hospital_name: { [Op.like]: `%${search}%` } }, { location: { [Op.like]: `%${search}%` } }];
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Hospital.findAndCountAll({
            where,
            include: [{ model: User, as: 'creator', attributes: ['name'] }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), data: rows });
    } catch (error) { next(error); }
};

const createHospital = async (req, res, next) => {
    try {
        req.body.created_by = req.user.id;
        const hospital = await Hospital.create(req.body);
        res.status(201).json({ success: true, data: hospital });
    } catch (error) { next(error); }
};

const getHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        res.json({ success: true, data: hospital });
    } catch (error) { next(error); }
};

const updateHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        await hospital.update(req.body);
        res.json({ success: true, data: hospital });
    } catch (error) { next(error); }
};

const deleteHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        await hospital.destroy();
        res.json({ success: true, message: 'Hospital deleted' });
    } catch (error) { next(error); }
};

module.exports = { getHospitals, createHospital, getHospital, updateHospital, deleteHospital };
