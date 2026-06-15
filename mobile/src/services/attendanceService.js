import api from './api';

export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  updateLocation: (data) => api.post('/attendance/update-location', data),
  getToday: () => api.get('/attendance/today'),
  getMy: (params) => api.get('/attendance/my', { params }),
};
