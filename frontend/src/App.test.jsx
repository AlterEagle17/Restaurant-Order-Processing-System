import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import App from './App'

afterEach(() => { sessionStorage.clear(); cleanup() })

describe('authentication entry point', () => {
  it('renders a staff login without a public registration link', () => {
    render(<MemoryRouter initialEntries={['/login']}><AuthProvider><App /></AuthProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /sign in to juniper house/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /sign up|register|create account/i })).toBeNull()
  })
})