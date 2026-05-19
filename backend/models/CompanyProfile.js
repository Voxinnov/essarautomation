const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyProfile = sequelize.define('CompanyProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    company_name: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    pin_code: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    service_tax_no: { type: DataTypes.STRING },
    tax_inclusive_rates: { type: DataTypes.BOOLEAN, defaultValue: false },
    default_currency: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    address_line_1: { type: DataTypes.STRING },
    address_line_2: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING },
    taxation_type: { type: DataTypes.STRING },
    contact_name: { type: DataTypes.STRING },
    logo: { type: DataTypes.STRING }
}, {
    tableName: 'company_profiles',
    timestamps: true
});

module.exports = CompanyProfile;
