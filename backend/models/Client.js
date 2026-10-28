const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patient_name: { type: DataTypes.STRING, allowNull: false },
    customer_name: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.ENUM('client', 'vendor'), allowNull: false, defaultValue: 'client' },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    address: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
}, { tableName: 'clients' });

module.exports = Client;
