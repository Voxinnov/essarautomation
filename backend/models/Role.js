const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
    permissions: { 
        type: DataTypes.JSON, 
        defaultValue: [],
        allowNull: false
    },
}, {
    tableName: 'roles',
});

module.exports = Role;
