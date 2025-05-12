import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({
      'username': email,
      'password': password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
  
  getMe: () => api.get('/auth/me'),
};

// Chat API
export const chatApi = {
  getChats: () => api.get('/chat'),
  
  getChat: (chatId: string) => api.get(`/chat/${chatId}`),
  
  createChat: (title: string) => api.post('/chat', { title }),
  
  deleteChat: (chatId: string) => api.delete(`/chat/${chatId}`),
  
  sendMessage: (chatId: string, content: string, role: 'user' | 'assistant' = 'user') =>
    api.post(`/chat/${chatId}/messages`, { content, role }),
  
  processText: (text: string) => api.post('/chat/process-text', { text }),
  
  processPdf: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/chat/process-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  processUrl: (url: string) => api.post('/chat/process-url', { url }),
};

export default api; 