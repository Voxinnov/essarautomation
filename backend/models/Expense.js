const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { type: DataTypes.STRING },
    date: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
}, { tableName: 'expenses' });

module.exports = Expense;
