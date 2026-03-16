import api from './api';

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    getUsers: () => api.get('/auth/users'),
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
    stop: (id) => api.post(`/time/stop/${id}`),
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
