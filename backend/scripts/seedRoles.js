const { Role, User } = require('../models');

const seedRoles = async () => {
    try {
        const adminPermissions = [
            'dashboard_view',
            'dashboard_tasks_stats',
            'dashboard_billing_stats',
            'dashboard_expenses_stats',
            'dashboard_clients_stats',
            'dashboard_task_status_chart',
            'dashboard_task_trend_chart',
            'dashboard_recent_tasks',
            'dashboard_employee_hours',
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
            'users_manage',
            'leaves_view', 'leaves_request', 'leaves_approve'
        ];

        const managerPermissions = [
            'dashboard_view',
            'dashboard_tasks_stats',
            'dashboard_billing_stats',
            'dashboard_expenses_stats',
            'dashboard_clients_stats',
            'dashboard_task_status_chart',
            'dashboard_task_trend_chart',
            'dashboard_recent_tasks',
            'dashboard_employee_hours',
            'tasks_view', 'tasks_create', 'tasks_edit',
            'clients_view', 'clients_create', 'clients_edit',
            'hospitals_view', 'hospitals_create', 'hospitals_edit',
            'doctors_view', 'doctors_create', 'doctors_edit',
            'work_updates_view', 'work_updates_create', 'work_updates_edit',
            'time_tracking_view',
            'billing_view',
            'expenses_view',
            'stock_view',
            'reports_view',
            'leaves_view', 'leaves_request', 'leaves_approve'
        ];

        const staffPermissions = [
            'dashboard_view',
            'dashboard_tasks_stats',
            'dashboard_task_status_chart',
            'dashboard_task_trend_chart',
            'dashboard_recent_tasks',
            'tasks_view',
            'work_updates_view', 'work_updates_create',
            'time_tracking_view',
            'leaves_view', 'leaves_request'
        ];

        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: { description: 'Full system access', permissions: adminPermissions }
        });
        await adminRole.update({ permissions: adminPermissions });

        const [managerRole] = await Role.findOrCreate({
            where: { name: 'Manager' },
            defaults: { description: 'Management access', permissions: managerPermissions }
        });
        await managerRole.update({ permissions: managerPermissions });

        const [staffRole] = await Role.findOrCreate({
            where: { name: 'Staff' },
            defaults: { description: 'Standard employee access', permissions: staffPermissions }
        });
        await staffRole.update({ permissions: staffPermissions });

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

