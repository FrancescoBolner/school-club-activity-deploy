import axios from 'axios'
import { getSession, clearSession, saveSession } from './utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

api.interceptors.request.use(config => {
  const session = getSession()
  if (session) {
    config.headers['x-username'] = session.username
    config.headers['x-session-id'] = session.sessionId
  }
  return config
})

api.interceptors.response.use(
  res => {
    // Check if response contains session update
    if (res.data?.sessionUpdate) {
      const currentSession = getSession()
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          ...res.data.sessionUpdate
        }
        saveSession(updatedSession)
      }
    }
    return res
  },
  err => {
    if (err?.response?.status === 401) {
      // Session is invalid; clear it and redirect to login
      clearSession()
      if (window.location.pathname !== '/LogIn') {
        window.location.href = '/LogIn'
      }
    }
    return Promise.reject(err)
  }
)

export const getErrorMessage = err =>
  err?.response?.data?.message ||
  err?.message ||
  'Something went wrong'

export default api
