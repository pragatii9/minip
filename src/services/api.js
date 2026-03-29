import axios from 'axios'

// ✅ Create axios instance (VERY IMPORTANT)
const api = axios.create({
  baseURL: "http://localhost:5000",
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

// BYPASS LOGIN
export const authAPI = {
  login: async () => {
    localStorage.setItem('adminToken', 'dummy-token')
    return {
      data: { token: 'dummy-token' },
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    return Promise.resolve()
  },
}

// CERTIFICATE APIs
export const certificateAPI = {
  upload: (formData) => {
    return api.post('/certificate/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  verify: (data) => {
    return api.post('/certificate/verify', data)
  },

  getRecords: () => {
    return api.get('/certificate/records')
  },

  getStats: () => {
    return api.get('/certificate/stats')
  },
}

export default api