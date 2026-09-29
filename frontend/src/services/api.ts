import axios, { AxiosError } from 'axios'

export interface ApiErrorPayload {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string>
}

export class ApiRequestError extends Error {
  readonly status?: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = payload?.status
    this.code = payload?.error
    this.fieldErrors = payload?.fieldErrors
  }
}

let unauthorizedHandler: (() => void) | undefined

export function setApiToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  unauthorizedHandler = handler
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (import.meta.env.PROD && !apiBaseUrl) {
    return Promise.reject(new ApiRequestError('Backend API is not configured. Set VITE_API_BASE_URL to the Render service origin.'))
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.status === 401) unauthorizedHandler?.()
    const payload = error.response?.data
    const message = payload?.message ?? error.message ?? 'Unable to reach the service.'
    return Promise.reject(new ApiRequestError(message, payload))
  },
)