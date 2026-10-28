const { Op } = require('sequelize');
const { Client } = require('../models');

const getClients = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, type } = req.query;
        const where = {};
        if (type) {
            where.type = type;
        }
        if (search) {
            where[Op.or] = [
                { customer_name: { [Op.like]: `%${search}%` } },
                { patient_name: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Client.findAndCountAll({ where, limit: parseInt(limit), offset, order: [['created_at', 'DESC']] });
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), data: rows });
    } catch (error) { next(error); }
};

const createClient = async (req, res, next) => {
    try {
        const body = { ...req.body };
        // Sync customer_name and patient_name
        if (body.customer_name && !body.patient_name) body.patient_name = body.customer_name;
        if (body.patient_name && !body.customer_name) body.customer_name = body.patient_name;
        const client = await Client.create(body);
        res.status(201).json({ success: true, data: client });
    } catch (error) { next(error); }
};

const getClient = async (req, res, next) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        res.json({ success: true, data: client });
    } catch (error) { next(error); }
};

const updateClient = async (req, res, next) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        const body = { ...req.body };
        // Sync customer_name and patient_name
        if (body.customer_name && !body.patient_name) body.patient_name = body.customer_name;
        if (body.patient_name && !body.customer_name) body.customer_name = body.patient_name;
        await client.update(body);
        res.json({ success: true, data: client });
    } catch (error) { next(error); }
};

const deleteClient = async (req, res, next) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        await client.destroy();
        res.json({ success: true, message: 'Client deleted' });
    } catch (error) { next(error); }
};

module.exports = { getClients, createClient, getClient, updateClient, deleteClient };
