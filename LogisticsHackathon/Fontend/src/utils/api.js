import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' 
        ? 'https://lorri-ai-hackathon.onrender.com/api' 
        : 'http://localhost:8000/api'),
    withCredentials: true,
});

export default api;
