const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctor_name: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING },
    hospital_id: { type: DataTypes.INTEGER, references: { model: 'hospitals', key: 'id' } },
    address: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
}, { tableName: 'doctors' });

module.exports = Doctor;
