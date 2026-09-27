import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api' })
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('restaurant-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const errorMessage = (error) => error.response?.data?.error || error.response?.data?.message || error.message || 'Something went wrong.'
export default api