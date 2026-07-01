import api from './api';

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    getUsers: () => api.get('/auth/users'),
    createUser: (data) => api.post('/auth/register', data), // Reuse register logic
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const roleService = {
    getAll: () => api.get('/roles'),
    getById: (id) => api.get(`/roles/${id}`),
    create: (data) => api.post('/roles', data),
    update: (id, data) => api.put(`/roles/${id}`, data),
    delete: (id) => api.delete(`/roles/${id}`),
    getPermissions: () => api.get('/roles/permissions'),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard'),
};

export const taskService = {
    getAll: (params) => api.get('/tasks', { params }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

export const clientService = {
    getAll: (params) => api.get('/clients', { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
};

export const hospitalService = {
    getAll: (params) => api.get('/hospitals', { params }),
    getById: (id) => api.get(`/hospitals/${id}`),
    create: (data) => api.post('/hospitals', data),
    update: (id, data) => api.put(`/hospitals/${id}`, data),
    delete: (id) => api.delete(`/hospitals/${id}`),
};

export const doctorService = {
    getAll: (params) => api.get('/doctors', { params }),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (data) => api.post('/doctors', data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
};

export const workUpdateService = {
    getByTask: (taskId) => api.get(`/work-updates/task/${taskId}`),
    create: (data) => api.post('/work-updates', data),
    update: (id, data) => api.put(`/work-updates/${id}`, data),
    delete: (id) => api.delete(`/work-updates/${id}`),
};

export const timeService = {
    getAll: (params) => api.get('/time', { params }),
    start: (data) => api.post('/time/start', data),
    stop: (id, data) => api.post(`/time/stop/${id}`, data || {}),
    manualEntry: (data) => api.post('/time/manual', data),
    getActive: () => api.get('/time/active'),
    getReport: (params) => api.get('/time/report', { params }),
};

export const billingService = {
    getAll: (params) => api.get('/billing', { params }),
    getById: (id) => api.get(`/billing/${id}`),
    create: (data) => api.post('/billing', data),
    update: (id, data) => api.put(`/billing/${id}`, data),
    delete: (id) => api.delete(`/billing/${id}`),
};

export const expenseService = {
    getAll: (params) => api.get('/expenses', { params }),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
};

export const remarkService = {
    getByTask: (taskId) => api.get(`/remarks/task/${taskId}`),
    create: (data) => api.post('/remarks', data),
    delete: (id) => api.delete(`/remarks/${id}`),
};

export const stockService = {
    getProducts: () => api.get('/stock/products'),
    createProduct: (data) => api.post('/stock/products', data),
    deleteProduct: (id) => api.delete(`/stock/products/${id}`),
    getBrands: () => api.get('/stock/brands'),
    getCategories: () => api.get('/stock/categories'),
    createTransaction: (data) => api.post('/stock/transaction', data),
    getTransactions: () => api.get('/stock/transactions'),
    getDashboard: () => api.get('/stock/dashboard'),
};

export const statusService = {
    getAll: () => api.get('/statuses/'),
    create: (data) => api.post('/statuses/', data),
    update: (id, data) => api.put(`/statuses/${id}/`, data),
    delete: (id) => api.delete(`/statuses/${id}/`),
};

export const taskProductService = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/products`),
    create: (taskId, data) => api.post(`/tasks/${taskId}/products`, data),
    getBackorders: () => api.get('/stock/backorders'),
    resolveBackorders: () => api.post('/stock/backorders/resolve'),
};

export const proformaService = {
    getDashboard: () => api.get('/proforma/dashboard'),
    getAll: (params) => api.get('/proforma', { params }),
    getById: (id) => api.get(`/proforma/${id}`),
    create: (data) => api.post('/proforma', data),
    update: (id, data) => api.put(`/proforma/${id}`, data),
    delete: (id) => api.delete(`/proforma/${id}`),
    convertToInvoice: (id) => api.post(`/proforma/${id}/convert`),
};

export const companyProfileService = {
    get: () => api.get('/company-profile'),
    update: (data) => api.put('/company-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const attendanceService = {
    checkIn: (data) => api.post('/attendance/check-in', data),
    checkOut: (data) => api.post('/attendance/check-out', data),
    getToday: () => api.get('/attendance/today'),
    getMy: (params) => api.get('/attendance/my', { params }),
    getAll: (params) => api.get('/attendance/all', { params }),
    getSummary: (params) => api.get('/attendance/summary', { params }),
    getLive: () => api.get('/attendance/live'),
    getTravelReport: (params) => api.get('/attendance/travel-report', { params }),
};

export const notificationService = {
    getAll: (params) => api.get('/notifications', { params }),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    getStreamUrl: () => {
        const baseURL = api.defaults.baseURL || '';
        const token = localStorage.getItem('token');
        return `${baseURL}/notifications/stream?token=${token}`;
    }
};

export const leaveService = {
    getAll: (params) => api.get('/leaves/all', { params }),
    getMy: (params) => api.get('/leaves/my', { params }),
    getById: (id) => api.get(`/leaves/${id}`),
    create: (data) => api.post('/leaves', data),
    update: (id, data) => api.put(`/leaves/${id}`, data),
    delete: (id) => api.delete(`/leaves/${id}`),
    approve: (id, data) => api.put(`/leaves/${id}/approve`, data),
    getStats: (params) => api.get('/leaves/stats', { params }),
};

