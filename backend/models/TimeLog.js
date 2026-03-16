const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeLog = sequelize.define('TimeLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    total_hours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    description: { type: DataTypes.TEXT },
    is_manual: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'time_logs' });

module.exports = TimeLog;
