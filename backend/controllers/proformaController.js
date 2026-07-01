const { ProformaInvoice, ProformaInvoiceItem, Client, BankAccount, User, Product, Billing, Hospital, Doctor, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const total = await ProformaInvoice.count();
        const pending = await ProformaInvoice.count({ where: { status: { [Op.in]: ['Draft', 'Sent'] } } });
        const approved = await ProformaInvoice.count({ where: { status: 'Approved' } });
        const expired = await ProformaInvoice.count({ where: { status: 'Expired' } });
        
        // Revenue estimate (sum of grand_total for non-expired/draft)
        const revenueResult = await ProformaInvoice.sum('grand_total', { where: { status: { [Op.in]: ['Sent', 'Approved', 'Converted to Invoice'] } } });
        const revenue = revenueResult || 0;

        res.status(200).json({ success: true, data: { total, pending, approved, expired, revenue } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProformaInvoices = async (req, res) => {
    try {
        const invoices = await ProformaInvoice.findAll({
            include: [
                { model: Client, as: 'client' },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
                { model: User, as: 'sales_person_ref', attributes: ['id', 'name'] },
                { model: Hospital, as: 'referred_hospital', attributes: ['id', 'hospital_name'] },
                { model: Doctor, as: 'referred_doctor', attributes: ['id', 'doctor_name'] },
                { 
                    model: ProformaInvoiceItem, 
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProformaInvoice = async (req, res) => {
    try {
        const invoice = await ProformaInvoice.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: BankAccount, as: 'bank_account' },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
                { model: User, as: 'sales_person_ref', attributes: ['id', 'name'] },
                { model: Hospital, as: 'referred_hospital', attributes: ['id', 'hospital_name'] },
                { model: Doctor, as: 'referred_doctor', attributes: ['id', 'doctor_name'] },
                { 
                    model: ProformaInvoiceItem, 
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const generateInvoiceNumber = async () => {
    const lastInvoice = await ProformaInvoice.findOne({
        order: [['id', 'DESC']]
    });
    
    if (!lastInvoice) {
        return 'PI-1001';
    }
    
    // Extract number from format like "PI-1005"
    const match = lastInvoice.invoice_number.match(/PI-(\d+)/);
    if (match && match[1]) {
        const nextNum = parseInt(match[1]) + 1;
        return `PI-${nextNum}`;
    }
    
    // Fallback if format is different
    return `PI-${lastInvoice.id + 1000}`;
};

exports.createProformaInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            client_id, date, valid_until, po_number, items,
            sub_total, cgst, sgst, rounding, grand_total,
            notes, terms_conditions, bank_account_id,
            sales_person_id, referred_by_hospital_id, referred_by_doctor_id,
            shipping_address
        } = req.body;

        const invoice_number = await generateInvoiceNumber();

        const invoice = await ProformaInvoice.create({
            invoice_number, client_id: client_id || null, date, valid_until, po_number,
            sub_total, cgst, sgst, rounding, grand_total,
            notes, terms_conditions, bank_account_id: bank_account_id || null,
            status: 'Draft',
            created_by: req.user.id,
            sales_person_id: sales_person_id || null,
            referred_by_hospital_id: referred_by_hospital_id || null,
            referred_by_doctor_id: referred_by_doctor_id || null,
            shipping_address
        }, { transaction: t });

        if (items && items.length > 0) {
            const itemsData = items.map(item => ({
                proforma_invoice_id: invoice.id,
                product_id: item.product_id,
                quantity: item.quantity,
                rate: item.rate,
                mrp: item.mrp,
                hsn_code: item.hsn_code,
                amount: item.amount
            }));
            await ProformaInvoiceItem.bulkCreate(itemsData, { transaction: t });
        }

        await t.commit();
        
        // Fetch full invoice to return
        const createdInvoice = await ProformaInvoice.findByPk(invoice.id, {
            include: [{ model: ProformaInvoiceItem, as: 'items' }, { model: Client, as: 'client' }]
        });
        
        res.status(201).json({ success: true, data: createdInvoice });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProformaInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const invoice = await ProformaInvoice.findByPk(req.params.id);
        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
        }

        const {
            client_id, date, valid_until, po_number, items,
            sub_total, cgst, sgst, rounding, grand_total,
            notes, terms_conditions, bank_account_id, status,
            sales_person_id, referred_by_hospital_id, referred_by_doctor_id,
            shipping_address
        } = req.body;

        await invoice.update({
            client_id: client_id || null, date, valid_until, po_number,
            sub_total, cgst, sgst, rounding, grand_total,
            notes, terms_conditions, bank_account_id: bank_account_id || null, status,
            sales_person_id: sales_person_id || null,
            referred_by_hospital_id: referred_by_hospital_id || null,
            referred_by_doctor_id: referred_by_doctor_id || null,
            shipping_address
        }, { transaction: t });

        if (items) {
            // Delete existing items
            await ProformaInvoiceItem.destroy({ where: { proforma_invoice_id: invoice.id }, transaction: t });
            
            // Add new items
            if (items.length > 0) {
                const itemsData = items.map(item => ({
                    proforma_invoice_id: invoice.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    rate: item.rate,
                    mrp: item.mrp,
                    hsn_code: item.hsn_code,
                    amount: item.amount
                }));
                await ProformaInvoiceItem.bulkCreate(itemsData, { transaction: t });
            }
        }

        await t.commit();
        
        const updatedInvoice = await ProformaInvoice.findByPk(invoice.id, {
            include: [{ model: ProformaInvoiceItem, as: 'items' }]
        });
        
        res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.convertToInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const proforma = await ProformaInvoice.findByPk(req.params.id, {
            include: [{ model: ProformaInvoiceItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        });

        if (!proforma) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
        }

        if (proforma.status === 'Converted to Invoice') {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Proforma Invoice already converted' });
        }

        // Map proforma items to billing items format
        const billingItems = proforma.items.map(item => ({
            name: item.product ? item.product.name : 'Unknown Product',
            qty: item.quantity,
            price: item.rate,
            total: item.amount,
            hsn_code: item.hsn_code,
            mrp: item.mrp
        }));

        // Generate a unique invoice number
        const lastBilling = await Billing.findOne({ 
            where: { invoice_prefix: 'ESSAR' },
            order: [['id', 'DESC']] 
        });
        let next_no = 1001;
        if (lastBilling && lastBilling.invoice_no) {
            const lastNo = parseInt(lastBilling.invoice_no);
            if (!isNaN(lastNo)) next_no = lastNo + 1;
        }
        // Ensure uniqueness with a loop
        let invoice_number = `ESSAR-${next_no}`;
        let attempts = 0;
        while (attempts < 10) {
            const existing = await Billing.findOne({ where: { invoice_number } });
            if (!existing) break;
            next_no++;
            invoice_number = `ESSAR-${next_no}`;
            attempts++;
        }

        const billing = await Billing.create({
            client_id: proforma.client_id,
            bank_account_id: proforma.bank_account_id,
            amount: proforma.grand_total,
            sub_total: proforma.sub_total,
            cgst: proforma.cgst,
            sgst: proforma.sgst,
            rounding: proforma.rounding,
            items: billingItems,
            invoice_number,
            invoice_prefix: 'ESSAR',
            invoice_no: next_no.toString(),
            invoice_date: new Date(),
            due_date: proforma.valid_until || new Date(),
            status: 'pending',
            terms_conditions: proforma.terms_conditions,
            notes: proforma.notes,
            billing_type: 'fixed',
            created_by: req.user.id,
            sales_person_id: proforma.sales_person_id,
            referred_by_hospital_id: proforma.referred_by_hospital_id,
            referred_by_doctor_id: proforma.referred_by_doctor_id,
            shipping_address: proforma.shipping_address
        }, { transaction: t });

        // Update Proforma status
        await proforma.update({ status: 'Converted to Invoice' }, { transaction: t });

        await t.commit();
        res.status(200).json({ success: true, data: billing });
    } catch (error) {
        await t.rollback();
        console.error('Convert Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProformaInvoice = async (req, res) => {
    try {
        const invoice = await ProformaInvoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
        }
        await invoice.destroy();
        res.status(200).json({ success: true, message: 'Proforma Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
