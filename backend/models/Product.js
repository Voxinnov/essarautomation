const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    hsn_code: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.STRING,
    },
    units_per_box: {
        type: DataTypes.INTEGER,
    },
    mrp: {
        type: DataTypes.DECIMAL(10, 2),
    },
    ptr: {
        type: DataTypes.DECIMAL(10, 2),
    },
    pts: {
        type: DataTypes.DECIMAL(10, 2),
    },
    ptd: {
        type: DataTypes.DECIMAL(10, 2),
    },
    tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
    },
    current_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    reorder_level: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = Product;
