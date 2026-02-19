import axios from "axios"
import { authStore } from "@/store/authStore"
import { useTenantStore } from "@/store/tenantStore"
import { ENV } from "@/core/config/env"

const api = axios.create({
  baseURL: ENV.API_BASE,
})

api.interceptors.request.use((config) => {
  const token = authStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const tenantId = useTenantStore.getState().currentTenantId
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        await authStore.getState().refreshToken()
        const newToken = authStore.getState().token
        if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`
            return api.request(error.config)
        }
      } catch (refreshError) {
        authStore.getState().logout()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
