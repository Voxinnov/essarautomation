export const TASK_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'in_progress', label: 'In Progress', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'on_hold', label: 'On Hold', color: 'default' },
];

export const TASK_PRIORITIES = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'urgent', label: 'Urgent', color: 'error' },
];

export const BILLING_TYPES = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'hourly', label: 'Hourly' },
];

export const BILLING_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'paid', label: 'Paid', color: 'success' },
];

export const USER_ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
];

export const EXPENSE_CATEGORIES = [
    'Office Supplies', 'Travel', 'Utilities', 'Equipment', 'Software',
    'Marketing', 'Maintenance', 'Food & Beverages', 'Other',
];

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getStatusColor = (status) => {
    const statusMap = {
        pending: 'warning', in_progress: 'info', completed: 'success', on_hold: 'default',
        paid: 'success', low: 'success', medium: 'warning', high: 'error', urgent: 'error',
        Draft: 'default', Sent: 'info', Approved: 'success', Expired: 'error', 
        'Converted to Invoice': 'success'
    };
    return statusMap[status] || 'default';
};
