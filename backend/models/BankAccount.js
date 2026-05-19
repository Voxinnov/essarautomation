const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bank_name: { type: DataTypes.STRING, allowNull: false },
    account_name: { type: DataTypes.STRING, allowNull: false },
    account_number: { type: DataTypes.STRING, allowNull: false },
    ifsc_code: { type: DataTypes.STRING, allowNull: false },
    branch: { type: DataTypes.STRING },
    upi_id: { type: DataTypes.STRING },
    qr_code: { type: DataTypes.STRING }, // path to qr code image
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'bank_accounts' });

module.exports = BankAccount;
