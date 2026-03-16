const { Billing, Task, Client } = require('../models');
const { Op } = require('sequelize');

const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}${month}-${random}`;
};

const getBillings = async (req, res, next) => {
    try {
        const { status, client_id, search, page = 1, limit = 10 } = req.query;
        const where = {};
        if (status) where.status = status;
        if (client_id) where.client_id = client_id;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Billing.findAndCountAll({
            where,
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Client, as: 'client', attributes: ['id', 'patient_name'] },
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
        });
        res.json({ success: true, count, totalPages: Math.ceil(count / parseInt(limit)), currentPage: parseInt(page), data: rows });
    } catch (error) { next(error); }
};

const createBilling = async (req, res, next) => {
    try {
        const invoice_number = generateInvoiceNumber();
        const billing = await Billing.create({ ...req.body, invoice_number });
        res.status(201).json({ success: true, data: billing });
    } catch (error) { next(error); }
};

const getBilling = async (req, res, next) => {
    try {
        const billing = await Billing.findByPk(req.params.id, {
            include: [
                { model: Task, as: 'task' },
                { model: Client, as: 'client' },
            ],
        });
        if (!billing) return res.status(404).json({ success: false, message: 'Billing not found' });
        res.json({ success: true, data: billing });
    } catch (error) { next(error); }
};

const updateBilling = async (req, res, next) => {
    try {
        const billing = await Billing.findByPk(req.params.id);
        if (!billing) return res.status(404).json({ success: false, message: 'Billing not found' });
        await billing.update(req.body);
        res.json({ success: true, data: billing });
    } catch (error) { next(error); }
};

const deleteBilling = async (req, res, next) => {
    try {
        const billing = await Billing.findByPk(req.params.id);
        if (!billing) return res.status(404).json({ success: false, message: 'Billing not found' });
        await billing.destroy();
        res.json({ success: true, message: 'Billing record deleted' });
    } catch (error) { next(error); }
};

module.exports = { getBillings, createBilling, getBilling, updateBilling, deleteBilling };
