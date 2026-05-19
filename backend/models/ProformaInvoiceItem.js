const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProformaInvoiceItem = sequelize.define('ProformaInvoiceItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proforma_invoice_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'proforma_invoices', key: 'id' }, onDelete: 'CASCADE' },
    product_id: { type: DataTypes.UUID, references: { model: 'products', key: 'id' } },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    mrp: { type: DataTypes.DECIMAL(10, 2) },
    hsn_code: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
    tableName: 'proforma_invoice_items',
    timestamps: false
});

module.exports = ProformaInvoiceItem;
