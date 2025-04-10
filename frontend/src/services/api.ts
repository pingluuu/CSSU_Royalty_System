import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        //Need bearer due to how backend was set up otherwise need to change backend. 
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

export default api 