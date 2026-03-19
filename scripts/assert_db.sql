\echo '=== Verification DB Assertions ==='

SELECT 'payment_intents_count' AS metric, COUNT(*)::TEXT AS value FROM payment_intents;
SELECT 'jobs_count' AS metric, COUNT(*)::TEXT AS value FROM jobs;
SELECT 'agent_runs_count' AS metric, COUNT(*)::TEXT AS value FROM agent_runs;

\echo '\nLatest payment_intents:'
SELECT id, status, left(goal, 64) AS goal, created_at
FROM payment_intents
ORDER BY created_at DESC
LIMIT 5;

\echo '\nLatest jobs:'
SELECT id, intent_id, status, retries, created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 5;

DO $$
DECLARE
  missing_posts_count INT := 0;
BEGIN
  IF to_regclass('public.posts') IS NULL THEN
    RAISE NOTICE 'posts table not found (skip post assertions)';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO missing_posts_count
  FROM posts
  WHERE status = 'published' AND (tiktok_publish_id IS NULL OR tiktok_publish_id = '');

  IF missing_posts_count > 0 THEN
    RAISE EXCEPTION 'Found % published posts missing tiktok_publish_id', missing_posts_count;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.webhook_events') IS NULL THEN
    RAISE NOTICE 'webhook_events table not found (skip dedup assertions)';
    RETURN;
  END IF;

  RAISE NOTICE 'webhook_events count=%', (SELECT COUNT(*) FROM webhook_events);
END $$;

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NULL THEN
    RAISE NOTICE 'audit_logs table not found (skip audit assertions)';
    RETURN;
  END IF;

  RAISE NOTICE 'audit publish actions=%', (
    SELECT COUNT(*)
    FROM audit_logs
    WHERE action ILIKE '%publish%'
  );
END $$;
