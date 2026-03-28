/** True when `VITE_MOCK_MODE=true` — no Supabase/MTA usage in data hooks. */
export function isMockMode(): boolean {
  return import.meta.env.VITE_MOCK_MODE === 'true'
}
