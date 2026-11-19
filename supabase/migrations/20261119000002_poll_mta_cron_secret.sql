-- Send the x-cron-secret header that poll-mta checks.
--
-- The deployed poll-mta rejects any request whose x-cron-secret header
-- doesn't match its CRON_SECRET function secret (401 Unauthorized). The
-- previous migration (20261119000001) fixed the URL but sent no header.
--
-- The header value is read from Vault at run time. Store the same value as
-- the function's CRON_SECRET once per project:
--
--   select vault.create_secret('<CRON_SECRET value>', 'cron_secret');
--
-- Until that secret exists the header is sent empty and runs return 401.

select cron.schedule(
  'poll-mta-feeds',
  '* 9-23,0-4 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/poll-mta',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'),
        ''
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
