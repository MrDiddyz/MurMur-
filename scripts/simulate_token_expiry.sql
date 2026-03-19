DO $$
DECLARE
  target_account_id BIGINT;
BEGIN
  IF to_regclass('public.tiktok_oauth_tokens') IS NULL THEN
    RAISE NOTICE 'tiktok_oauth_tokens table not found; skipping token expiry simulation';
    RETURN;
  END IF;

  IF current_setting('verify.default_account_id', true) IS NOT NULL THEN
    target_account_id := current_setting('verify.default_account_id', true)::BIGINT;
  ELSE
    SELECT account_id INTO target_account_id
    FROM tiktok_oauth_tokens
    ORDER BY account_id
    LIMIT 1;
  END IF;

  IF target_account_id IS NULL THEN
    RAISE NOTICE 'No token rows found in tiktok_oauth_tokens; nothing to expire';
    RETURN;
  END IF;

  UPDATE tiktok_oauth_tokens
  SET access_expires_at = NOW() - INTERVAL '1 hour'
  WHERE account_id = target_account_id;

  RAISE NOTICE 'Expired access token(s) for account_id=%', target_account_id;
END $$;
