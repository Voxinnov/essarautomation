const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Billing = sequelize.define('Billing', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    client_id: { type: DataTypes.INTEGER, references: { model: 'clients', key: 'id' } },
    bank_account_id: { type: DataTypes.INTEGER, references: { model: 'bank_accounts', key: 'id' }, allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    billing_type: { type: DataTypes.ENUM('fixed', 'hourly'), defaultValue: 'fixed' },
    invoice_number: { type: DataTypes.STRING, unique: true },
    invoice_prefix: { type: DataTypes.STRING, defaultValue: 'vox' },
    invoice_no: { type: DataTypes.STRING },
    invoice_date: { type: DataTypes.DATEONLY },
    due_date: { type: DataTypes.DATEONLY },
    po_no: { type: DataTypes.STRING },
    po_date: { type: DataTypes.DATEONLY },
    payment_terms: { type: DataTypes.STRING },
    sales_person: { type: DataTypes.STRING },
    items: { type: DataTypes.JSON }, // Store items as JSON array: [{name, unit, qty, price, discount, tax, total}]
    shipping_charges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    discount_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    custom_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    advance_payment: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    terms_conditions: { type: DataTypes.TEXT },
    sub_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    cgst: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    sgst: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    rounding: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    cgst_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 9 },
    sgst_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 9 },
    private_notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT },
}, { tableName: 'billing' });

module.exports = Billing;
