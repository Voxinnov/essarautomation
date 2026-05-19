const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkUpdate = sequelize.define('WorkUpdate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, references: { model: 'tasks', key: 'id' } },
    size: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    update_note: { type: DataTypes.TEXT },
    update_date: { type: DataTypes.DATEONLY },
    updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    latitude: { type: DataTypes.STRING(50) },
    longitude: { type: DataTypes.STRING(50) },
    location_address: { type: DataTypes.TEXT },
}, { tableName: 'work_updates' });

module.exports = WorkUpdate;
