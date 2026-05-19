const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models (alter in dev, no-sync in prod)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            console.log('✅ Database synced successfully.');

            // Create default admin user if not exists
            const { User } = require('./models');
            const adminExists = await User.findOne({ where: { email: 'admin@office.com' } });
            if (!adminExists) {
                await User.create({
                    name: 'Admin User',
                    email: 'admin@office.com',
                    password: 'admin123',
                    role: 'admin',
                    status: 'active',
                });
                console.log('✅ Default admin created: admin@office.com / admin123');
            }

            // Seed roles and permissions
            const seedRoles = require('./scripts/seedRoles');
            await seedRoles();

            // Seed statuses
            const seedStatuses = require('./seedStatuses');
            await seedStatuses();
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
