-- Schedule poll-mta edge function every minute during subway operating hours
-- (09:00–04:59 UTC ≈ 05:00–00:59 America/New_York)
--
-- This job must be created AFTER deploying the poll-mta edge function.
-- Run this in the Supabase SQL Editor with your project values substituted,
-- or apply it as a migration via `supabase db push`.
--
-- PRODUCTION:
--   url    := 'https://<PROJECT_REF>.supabase.co/functions/v1/poll-mta'
--   Bearer := '<SERVICE_ROLE_KEY>'
--
-- LOCAL DEV (supabase start):
--   url    := 'http://host.docker.internal:54321/functions/v1/poll-mta'
--   Bearer := '<LOCAL_SERVICE_ROLE_KEY>'

select cron.schedule(
  'poll-mta-feeds',
  '* 9-23,0-4 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/poll-mta',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  );
  $$
);
