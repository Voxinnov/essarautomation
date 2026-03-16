const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Billing = sequelize.define('Billing', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    client_id: { type: DataTypes.INTEGER, references: { model: 'clients', key: 'id' } },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    billing_type: { type: DataTypes.ENUM('fixed', 'hourly'), defaultValue: 'fixed' },
    invoice_number: { type: DataTypes.STRING, unique: true },
    status: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT },
    due_date: { type: DataTypes.DATE },
}, { tableName: 'billing' });

module.exports = Billing;
