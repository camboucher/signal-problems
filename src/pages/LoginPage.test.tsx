import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '../lib/auth-context'
import LoginPage from './LoginPage'

vi.mock('../lib/supabase', () => ({ supabase: {} }))

afterEach(cleanup)

function renderLogin(overrides: Partial<AuthContextValue> = {}) {
  const value = {
    session: null,
    user: null,
    profile: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn(),
    updateUsername: vi.fn(),
    refreshProfile: vi.fn(),
    patchProfile: vi.fn(),
    ...overrides,
  } as AuthContextValue

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
  return value
}

async function submit(email = 'a@b.co', password = 'password123') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('LoginPage', () => {
  it('signs in and goes home', async () => {
    const auth = renderLogin()
    await submit()
    expect(auth.signIn).toHaveBeenCalledWith('a@b.co', 'password123')
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  it('explains an unconfirmed email in plain words', async () => {
    renderLogin({
      signIn: vi.fn().mockResolvedValue({ error: new Error('Email not confirmed') }),
    })
    await submit()
    expect(await screen.findByText(/haven't confirmed your email/i)).toBeInTheDocument()
  })

  it('explains wrong credentials in plain words', async () => {
    renderLogin({
      signIn: vi.fn().mockResolvedValue({ error: new Error('Invalid login credentials') }),
    })
    await submit()
    expect(await screen.findByText(/don't match/i)).toBeInTheDocument()
  })

  it('skips the form when already signed in', () => {
    renderLogin({ user: { id: 'u1' } as User })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })
})
