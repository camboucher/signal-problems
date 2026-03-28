import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '../lib/auth-context'
import {
  MOCK_PROFILE,
  MOCK_USER_ID,
  getMockCredits,
  subscribeMockUpdates,
} from './data'

const MOCK_USER = {
  id: MOCK_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'mock@example.com',
  email_confirmed_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as User

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token',
  user: MOCK_USER,
} as Session

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)

  useEffect(() => subscribeMockUpdates(() => setTick((t) => t + 1)), [])

  const profile = useMemo(() => {
    return {
      ...MOCK_PROFILE,
      credits_balance: getMockCredits(),
      updated_at: new Date().toISOString(),
    }
  }, [tick])

  const value: AuthContextValue = useMemo(
    () => ({
      session: MOCK_SESSION,
      user: MOCK_USER,
      profile,
      loading: false,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      updateUsername: async (username: string) => {
        MOCK_PROFILE.username = username
        setTick((t) => t + 1)
        return { error: null }
      },
      refreshProfile: async () => {},
    }),
    [profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
