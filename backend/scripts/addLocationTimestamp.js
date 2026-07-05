/**
 * Migration: Add current_location_updated_at column to attendance table
 * Run once: node scripts/addLocationTimestamp.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        await sequelize.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS current_location_updated_at DATETIME DEFAULT NULL;
        `);

        console.log('✅ Column current_location_updated_at added to attendance table.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

run();
