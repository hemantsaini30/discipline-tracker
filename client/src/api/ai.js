import api from './axios.js';
export const getAIInsights = () => api.post('/ai/insights');
