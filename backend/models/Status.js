const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Status = sequelize.define('Status', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    label: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: '#9e9e9e' }, // Hex color
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false }, // System statuses can't be deleted easily
}, { tableName: 'statuses' });

module.exports = Status;
