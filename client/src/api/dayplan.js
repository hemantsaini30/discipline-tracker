import api from './axios.js';
export const getDayPlan = (date) => api.get(`/dayplan/${date}`);
export const saveDayPlan = (data) => api.post('/dayplan', data);
