const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskProduct = sequelize.define('TaskProduct', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    product_id: { type: DataTypes.UUID, references: { model: 'products', key: 'id' } },
    quantity_required: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    quantity_fulfilled: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('pending', 'fulfilled', 'backordered'), defaultValue: 'pending' },
}, { tableName: 'task_products' });

module.exports = TaskProduct;
