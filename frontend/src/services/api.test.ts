import { afterEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'
import { ApiRequestError, api, setApiToken, setUnauthorizedHandler } from './api'

const originalAdapter = api.defaults.adapter

afterEach(() => {
  api.defaults.adapter = originalAdapter
  setApiToken(null)
  setUnauthorizedHandler(undefined)
  vi.restoreAllMocks()
})

describe('API authentication transport', () => {
  it('attaches the current bearer token to protected requests', async () => {
    let requestConfig: Parameters<AxiosAdapter>[0] | undefined
    api.defaults.adapter = (async (config) => {
      requestConfig = config
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
    }) as AxiosAdapter
    setApiToken('session-token')

    await api.get('/protected')

    expect(requestConfig?.headers.get('Authorization')).toBe('Bearer session-token')
  })

  it('clears the authenticated session callback for a 401 response', async () => {
    const unauthorized = vi.fn()
    setUnauthorizedHandler(unauthorized)
    api.defaults.adapter = (async (config) => {
      const response = { data: { status: 401, error: 'UNAUTHORIZED', message: 'Authentication required' }, status: 401, statusText: 'Unauthorized', headers: {}, config } as AxiosResponse
      throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, undefined, response)
    }) as AxiosAdapter

    await expect(api.get('/protected')).rejects.toBeInstanceOf(ApiRequestError)
    expect(unauthorized).toHaveBeenCalledOnce()
  })

  it('keeps the configured API base URL and does not create a token by itself', () => {
    const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || undefined })
    expect(client.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL || undefined)
    expect(api.defaults.headers.common.Authorization).toBeUndefined()
  })
})