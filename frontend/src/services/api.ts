import axios from 'axios'

const API_BASE_URL = "https://cssu-royalty-system.vercel.app/"

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