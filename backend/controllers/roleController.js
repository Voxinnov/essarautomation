const { Role } = require('../models');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({ order: [['id', 'ASC']] });
        res.status(200).json({ success: true, count: roles.length, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private/Admin
exports.createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        await role.update(req.body);
        res.status(200).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        await role.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all available permissions
// @route   GET /api/roles/permissions
// @access  Private/Admin
exports.getPermissions = async (req, res) => {
    try {
        // Definitive static permission list grouped by module for frontend presentation
        const permissionGroups = [
            {
                module: 'Dashboard',
                permissions: [
                    { key: 'dashboard_view', label: 'View Dashboard' },
                    { key: 'dashboard_tasks_stats', label: 'View Tasks Stats (Stat Cards)' },
                    { key: 'dashboard_billing_stats', label: 'View Billing Stats (Stat Cards)' },
                    { key: 'dashboard_expenses_stats', label: 'View Expenses Stats (Stat Cards)' },
                    { key: 'dashboard_clients_stats', label: 'View Clients Stats (Stat Cards)' },
                    { key: 'dashboard_task_status_chart', label: 'View Task Status Distribution Chart' },
                    { key: 'dashboard_task_trend_chart', label: 'View Monthly Task Trend Chart' },
                    { key: 'dashboard_recent_tasks', label: 'View Recent Tasks Table' },
                    { key: 'dashboard_employee_hours', label: 'View Employee Work Hours List' }
                ]
            },
            {
                module: 'Tasks',
                permissions: [
                    { key: 'tasks_view', label: 'View Tasks' },
                    { key: 'tasks_create', label: 'Create Tasks' },
                    { key: 'tasks_edit', label: 'Edit Tasks' },
                    { key: 'tasks_delete', label: 'Delete Tasks' }
                ]
            },
            {
                module: 'Clients',
                permissions: [
                    { key: 'clients_view', label: 'View Clients' },
                    { key: 'clients_create', label: 'Create Clients' },
                    { key: 'clients_edit', label: 'Edit Clients' },
                    { key: 'clients_delete', label: 'Delete Clients' }
                ]
            },
            {
                module: 'Hospitals',
                permissions: [
                    { key: 'hospitals_view', label: 'View Hospitals' },
                    { key: 'hospitals_create', label: 'Create Hospitals' },
                    { key: 'hospitals_edit', label: 'Edit Hospitals' },
                    { key: 'hospitals_delete', label: 'Delete Hospitals' }
                ]
            },
            {
                module: 'Doctors',
                permissions: [
                    { key: 'doctors_view', label: 'View Doctors' },
                    { key: 'doctors_create', label: 'Create Doctors' },
                    { key: 'doctors_edit', label: 'Edit Doctors' },
                    { key: 'doctors_delete', label: 'Delete Doctors' }
                ]
            },
            {
                module: 'Work Updates',
                permissions: [
                    { key: 'work_updates_view', label: 'View Work Updates' },
                    { key: 'work_updates_create', label: 'Create Work Updates' },
                    { key: 'work_updates_edit', label: 'Edit Work Updates' },
                    { key: 'work_updates_delete', label: 'Delete Work Updates' }
                ]
            },
            {
                module: 'Time Tracking',
                permissions: [
                    { key: 'time_tracking_view', label: 'View Time Logs' },
                    { key: 'time_tracking_manage', label: 'Manage All Time Logs' }
                ]
            },
            {
                module: 'Attendance',
                permissions: [
                    { key: 'attendance_view', label: 'View Own Attendance' },
                    { key: 'attendance_checkin', label: 'Check In / Check Out' },
                    { key: 'attendance_view_all', label: 'View All Employees Attendance' },
                    { key: 'attendance_manage', label: 'Manage & Edit Attendance Records' },
                    { key: 'attendance_summary', label: 'View Monthly Summary Reports' }
                ]
            },
            {
                module: 'Billing',
                permissions: [
                    { key: 'billing_view', label: 'View Billing' },
                    { key: 'billing_create', label: 'Create Billing' },
                    { key: 'billing_edit', label: 'Edit Billing' },
                    { key: 'billing_delete', label: 'Delete Billing' },
                    { key: 'billing_manage', label: 'Manage/Approve Billing' }
                ]
            },
            {
                module: 'Proforma Invoices',
                permissions: [
                    { key: 'proforma_view', label: 'View Proforma Invoices' },
                    { key: 'proforma_create', label: 'Create Proforma' },
                    { key: 'proforma_edit', label: 'Edit Proforma' },
                    { key: 'proforma_delete', label: 'Delete Proforma' }
                ]
            },
            {
                module: 'Expenses',
                permissions: [
                    { key: 'expenses_view', label: 'View Expenses' },
                    { key: 'expenses_create', label: 'Create Expenses' },
                    { key: 'expenses_edit', label: 'Edit Expenses' },
                    { key: 'expenses_delete', label: 'Delete Expenses' },
                    { key: 'expenses_manage', label: 'Manage/Approve Expenses' }
                ]
            },
            {
                module: 'Stock Management',
                permissions: [
                    { key: 'stock_view', label: 'View Stock' },
                    { key: 'stock_create', label: 'Create Stock/Products' },
                    { key: 'stock_edit', label: 'Edit Stock/Products' },
                    { key: 'stock_delete', label: 'Delete Stock/Products' },
                    { key: 'stock_manage', label: 'Manage Stock Transactions' }
                ]
            },
            {
                module: 'Reports',
                permissions: [{ key: 'reports_view', label: 'View Reports' }]
            },
            {
                module: 'Leave Management',
                permissions: [
                    { key: 'leaves_view', label: 'View Leaves' },
                    { key: 'leaves_request', label: 'Request/Cancel Leaves' },
                    { key: 'leaves_approve', label: 'Approve/Reject Leaves' }
                ]
            },
            {
                module: 'Settings',
                permissions: [{ key: 'settings_view', label: 'View System Settings' }]
            },
            {
                module: 'User Management',
                permissions: [{ key: 'users_manage', label: 'Manage System Users' }]
            },
            {
                module: 'Role Management',
                permissions: [{ key: 'roles_manage', label: 'Manage Roles & Permissions' }]
            }
        ];

        // Also return a flat array for backwards compatibility if needed, but primary output is groups
        const flatPermissions = permissionGroups.reduce((acc, curr) => [...acc, ...curr.permissions], []);

        res.status(200).json({ 
            success: true, 
            data: flatPermissions,
            groups: permissionGroups 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
