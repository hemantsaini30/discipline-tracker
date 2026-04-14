import api from './axios.js';
export const getGlobalAnalytics = () => api.get('/analytics/global');
export const getTaskAnalytics = (taskId) => api.get(`/analytics/task/${taskId}`);
