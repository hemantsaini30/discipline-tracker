import api from './axios.js';
export const getLogsForDate = (date) => api.get('/logs', { params: { date } });
export const getLogsRange = (from, to, taskId) => api.get('/logs/range', { params: { from, to, taskId } });
export const upsertLog = (data) => api.post('/logs', data);
export const deleteLog = (id) => api.delete(`/logs/${id}`);
