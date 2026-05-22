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
    start_latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    start_longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    stop_latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    stop_longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    start_address: { type: DataTypes.STRING(500), allowNull: true },
    stop_address: { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'time_logs' });

module.exports = TimeLog;
