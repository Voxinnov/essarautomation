const { Role, User } = require('../models');

const seedRoles = async () => {
    try {
        const adminPermissions = [
            'dashboard_view',
            'tasks_view', 'tasks_create', 'tasks_edit', 'tasks_delete',
            'clients_view', 'clients_create', 'clients_edit', 'clients_delete',
            'hospitals_view', 'hospitals_create', 'hospitals_edit', 'hospitals_delete',
            'doctors_view', 'doctors_create', 'doctors_edit', 'doctors_delete',
            'work_updates_view', 'work_updates_create', 'work_updates_edit', 'work_updates_delete',
            'time_tracking_view', 'time_tracking_manage',
            'billing_view', 'billing_manage',
            'expenses_view', 'expenses_manage',
            'stock_view', 'stock_manage',
            'reports_view',
            'settings_view',
            'roles_manage',
            'users_manage'
        ];

        const managerPermissions = [
            'dashboard_view',
            'tasks_view', 'tasks_create', 'tasks_edit',
            'clients_view', 'clients_create', 'clients_edit',
            'hospitals_view', 'hospitals_create', 'hospitals_edit',
            'doctors_view', 'doctors_create', 'doctors_edit',
            'work_updates_view', 'work_updates_create', 'work_updates_edit',
            'time_tracking_view',
            'billing_view',
            'expenses_view',
            'stock_view',
            'reports_view'
        ];

        const staffPermissions = [
            'dashboard_view',
            'tasks_view',
            'work_updates_view', 'work_updates_create',
            'time_tracking_view'
        ];

        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: { description: 'Full system access', permissions: adminPermissions }
        });

        const [managerRole] = await Role.findOrCreate({
            where: { name: 'Manager' },
            defaults: { description: 'Management access', permissions: managerPermissions }
        });

        const [staffRole] = await Role.findOrCreate({
            where: { name: 'Staff' },
            defaults: { description: 'Standard employee access', permissions: staffPermissions }
        });

        console.log('✅ Roles seeded successfully.');

        // Update existing users to point to roles
        await User.update({ roleId: adminRole.id }, { where: { role: 'admin' } });
        await User.update({ roleId: managerRole.id }, { where: { role: 'manager' } });
        await User.update({ roleId: staffRole.id }, { where: { role: 'staff' } });

        console.log('✅ Users linked to roles.');
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
    }
};

module.exports = seedRoles;
