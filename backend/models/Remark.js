const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Remark = sequelize.define('Remark', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    remark: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'remarks' });

module.exports = Remark;
