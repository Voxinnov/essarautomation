const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    client_id: { type: DataTypes.INTEGER, references: { model: 'clients', key: 'id' } },
    hospital_id: { type: DataTypes.INTEGER, references: { model: 'hospitals', key: 'id' } },
    doctor_id: { type: DataTypes.INTEGER, references: { model: 'doctors', key: 'id' } },
    assigned_to: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    status: { type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'on_hold'), defaultValue: 'pending' },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
    created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    due_date: { type: DataTypes.DATE },
}, { tableName: 'tasks' });

module.exports = Task;
