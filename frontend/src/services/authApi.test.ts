import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import { api } from './api'
import { fetchCurrentUser, loginWithApi } from './authApi'

afterEach(() => vi.restoreAllMocks())

describe('backend authentication API', () => {
  it('posts credentials and maps the backend login profile', async () => {
    const payload = {
      accessToken: 'signed-token',
      tokenType: 'Bearer' as const,
      expiresIn: 900000,
      user: { id: 'user-id', username: 'manager', displayName: 'Jamie Chen', role: 'MANAGER' as const },
    }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: payload } as AxiosResponse)

    await expect(loginWithApi('manager', 'secret')).resolves.toEqual(payload)
    expect(post).toHaveBeenCalledWith('/api/auth/login', { username: 'manager', password: 'secret' })
  })

  it('loads the server-authenticated profile and rejects inactive accounts', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: {
      id: 'user-id', username: 'cashier', displayName: 'Taylor Brooks', role: 'CASHIER', active: true,
    } } as AxiosResponse)
    await expect(fetchCurrentUser()).resolves.toMatchObject({ username: 'cashier', role: 'CASHIER', active: true })

    vi.spyOn(api, 'get').mockResolvedValue({ data: {
      id: 'user-id', username: 'cashier', displayName: 'Taylor Brooks', role: 'CASHIER', active: false,
    } } as AxiosResponse)
    await expect(fetchCurrentUser()).rejects.toThrow('This account is inactive.')
  })

  it('rejects profiles with unknown roles instead of trusting them for navigation', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: {
      id: 'user-id', username: 'root', displayName: 'Root', role: 'SUPERUSER', active: true,
    } } as AxiosResponse)
    await expect(fetchCurrentUser()).rejects.toThrow('The server returned an invalid user profile.')
  })
})