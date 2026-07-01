const { sequelize } = require('../models');
const seedRoles = require('./seedRoles');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await seedRoles();
        console.log('Seeding complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
