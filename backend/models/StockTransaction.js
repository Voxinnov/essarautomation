const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockTransaction = sequelize.define('StockTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reference_id: {
        type: DataTypes.STRING,
    },
    reference_type: {
        type: DataTypes.STRING,
    },
    notes: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = StockTransaction;
