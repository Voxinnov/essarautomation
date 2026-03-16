const { Op } = require('sequelize');
const { Doctor, Hospital } = require('../models');

const getDoctors = async (req, res, next) => {
    try {
        const { search, hospital_id, page = 1, limit = 10 } = req.query;
        const where = {};
        if (hospital_id) where.hospital_id = hospital_id;
        if (search) where[Op.or] = [{ doctor_name: { [Op.like]: `%${search}%` } }, { department: { [Op.like]: `%${search}%` } }];
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Doctor.findAndCountAll({
            where, limit: parseInt(limit), offset,
            include: [{ model: Hospital, as: 'hospital', attributes: ['id', 'hospital_name'] }],
            order: [['created_at', 'DESC']],
        });
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), data: rows });
    } catch (error) { next(error); }
};

const createDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.create(req.body);
        res.status(201).json({ success: true, data: doctor });
    } catch (error) { next(error); }
};

const getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [{ model: Hospital, as: 'hospital' }],
        });
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, data: doctor });
    } catch (error) { next(error); }
};

const updateDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        await doctor.update(req.body);
        res.json({ success: true, data: doctor });
    } catch (error) { next(error); }
};

const deleteDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        await doctor.destroy();
        res.json({ success: true, message: 'Doctor deleted' });
    } catch (error) { next(error); }
};

module.exports = { getDoctors, createDoctor, getDoctor, updateDoctor, deleteDoctor };
