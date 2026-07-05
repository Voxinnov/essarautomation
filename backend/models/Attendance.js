const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    check_in_time: { type: DataTypes.DATE, allowNull: true },
    check_out_time: { type: DataTypes.DATE, allowNull: true },
    total_hours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('present', 'late', 'half_day', 'absent'), defaultValue: 'absent' },
    check_in_latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    check_in_longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    check_in_address: { type: DataTypes.STRING(500), allowNull: true },
    check_out_latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    check_out_longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    check_out_address: { type: DataTypes.STRING(500), allowNull: true },
    current_latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    current_longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    current_address: { type: DataTypes.STRING(500), allowNull: true },
    current_location_updated_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'attendance' });

module.exports = Attendance;
