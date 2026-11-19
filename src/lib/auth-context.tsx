import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  /** `needsConfirmation` is true when Supabase didn't return a session, i.e.
   *  the project requires the user to click an email link before signing in. */
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; needsConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateUsername: (username: string) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  patchProfile: (patch: Partial<Profile>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email: string, password: string) {
    // Send the confirmation link back to whatever origin the user signed up
    // from (localhost in dev, the real domain in prod). Without this, Supabase
    // falls back to the project's Site URL, which is often a dead port in dev.
    // The origin must also be in Auth > URL Configuration > Redirect URLs.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error, needsConfirmation: !error && !data.session }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (session?.user) await fetchProfile(session.user.id)
  }

  async function updateUsername(username: string) {
    if (!session?.user) return { error: new Error('Not authenticated') }
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', session.user.id)
    if (!error) {
      setProfile(prev => prev ? { ...prev, username } : prev)
    }
    return { error }
  }

  function patchProfile(patch: Partial<Profile>) {
    setProfile(prev => prev ? { ...prev, ...patch } : prev)
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateUsername,
      refreshProfile,
      patchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
