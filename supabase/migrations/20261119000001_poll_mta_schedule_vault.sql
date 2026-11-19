-- Re-point the poll-mta cron job at the real function URL.
--
-- 20260317000001_poll_mta_schedule.sql was applied with its literal
-- '<PROJECT_REF>' / '<SERVICE_ROLE_KEY>' placeholders, so every run since has
-- failed inside pg_net and no new markets have been created.
--
-- This version reads the project URL from Vault at run time, so the migration
-- holds no project-specific values and works for any environment. Before (or
-- right after) applying it, create the secret once per project:
--
--   select vault.create_secret('https://<PROJECT_REF>.supabase.co', 'project_url');
--
-- For local `supabase start`, use 'http://host.docker.internal:54321'.
--
-- No Authorization header: poll-mta is deployed with verify_jwt = false and
-- authenticates to the database with its own SUPABASE_SERVICE_ROLE_KEY env var,
-- so the caller doesn't need to send a key.
--
-- cron.schedule with an existing job name updates that job in place.

select cron.schedule(
  'poll-mta-feeds',
  '* 9-23,0-4 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/poll-mta',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
