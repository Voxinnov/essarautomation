const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hospital_name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.TEXT },

    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
}, { tableName: 'hospitals' });

module.exports = Hospital;
