const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProformaInvoice = sequelize.define('ProformaInvoice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    client_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' } },
    date: { type: DataTypes.DATE, allowNull: false },
    valid_until: { type: DataTypes.DATE },
    po_number: { type: DataTypes.STRING },
    sub_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    cgst: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    sgst: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    rounding: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    grand_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    terms_conditions: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Draft', 'Sent', 'Approved', 'Expired', 'Converted to Invoice'), defaultValue: 'Draft' },
    bank_account_id: { type: DataTypes.INTEGER, references: { model: 'bank_accounts', key: 'id' } },
    created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }
}, {
    tableName: 'proforma_invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ProformaInvoice;
