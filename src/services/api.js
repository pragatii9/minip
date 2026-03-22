import axios from 'axios'

// ✅ FIXED: Direct backend URL (no env issues)

  baseURL: "http://localhost:5000",
});

// ✅ Request interceptor (optional token)
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

// ✅ Response interceptor (just logs errors, no redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ✅ BYPASS LOGIN (no backend auth needed)
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

// ✅ CERTIFICATE APIs
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