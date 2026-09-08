REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_profile_columns() FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.admin_log(_target UUID, _action TEXT, _meta JSONB)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.admin_audit_logs (admin_id, target_user_id, action, metadata)
  VALUES (auth.uid(), _target, _action, COALESCE(_meta, '{}'::jsonb));
$$;
REVOKE EXECUTE ON FUNCTION public.admin_log(UUID, TEXT, JSONB) FROM anon, authenticated, PUBLIC;

-- Grant / extend access. _days NULL + _until NULL => permanent when _permanent true.
CREATE OR REPLACE FUNCTION public.admin_grant_access(
  _target UUID,
  _days INTEGER DEFAULT NULL,
  _until TIMESTAMPTZ DEFAULT NULL,
  _permanent BOOLEAN DEFAULT false,
  _extend BOOLEAN DEFAULT true
) RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles; _base TIMESTAMPTZ; _new TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;

  IF _permanent THEN
    UPDATE public.profiles SET permanent_access = true, access_granted_at = now(),
      access_expires_at = NULL, access_override = 'admin_granted',
      platform_access_status = 'allowed', suspended_at = NULL, suspended_reason = NULL
    WHERE id = _target RETURNING * INTO _row;
    PERFORM public.admin_log(_target, 'grant_permanent_access', '{}'::jsonb);
    RETURN _row;
  END IF;

  SELECT * INTO _row FROM public.profiles WHERE id = _target;
  IF NOT FOUND THEN RAISE EXCEPTION 'user not found'; END IF;

  IF _until IS NOT NULL THEN
    _new := _until;
  ELSE
    IF _days IS NULL THEN RAISE EXCEPTION 'days or until required'; END IF;
    _base := CASE
      WHEN _extend AND _row.access_expires_at IS NOT NULL AND _row.access_expires_at > now()
        THEN _row.access_expires_at
      ELSE now() END;
    _new := _base + make_interval(days => _days);
  END IF;

  UPDATE public.profiles SET permanent_access = false, access_granted_at = COALESCE(access_granted_at, now()),
    access_expires_at = _new, access_override = 'admin_granted',
    platform_access_status = 'allowed', suspended_at = NULL, suspended_reason = NULL
  WHERE id = _target RETURNING * INTO _row;

  PERFORM public.admin_log(_target, 'grant_access',
    jsonb_build_object('days', _days, 'until', _until, 'extend', _extend, 'new_expiry', _new));
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_grant_access(UUID, INTEGER, TIMESTAMPTZ, BOOLEAN, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_revoke_access(_target UUID)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET permanent_access = false, access_expires_at = NULL,
    access_granted_at = NULL, access_override = 'default'
  WHERE id = _target RETURNING * INTO _row;
  PERFORM public.admin_log(_target, 'revoke_access', '{}'::jsonb);
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_revoke_access(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_suspended(_target UUID, _suspended BOOLEAN, _reason TEXT DEFAULT NULL)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _suspended THEN
    UPDATE public.profiles SET platform_access_status = 'suspended', access_override = 'suspended',
      suspended_at = now(), suspended_reason = _reason
    WHERE id = _target RETURNING * INTO _row;
    PERFORM public.admin_log(_target, 'suspend_user', jsonb_build_object('reason', _reason));
  ELSE
    UPDATE public.profiles SET platform_access_status = 'allowed',
      access_override = CASE WHEN access_override = 'suspended' THEN 'default' ELSE access_override END,
      suspended_at = NULL, suspended_reason = NULL
    WHERE id = _target RETURNING * INTO _row;
    PERFORM public.admin_log(_target, 'reactivate_user', '{}'::jsonb);
  END IF;
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_set_suspended(UUID, BOOLEAN, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_manage_trial(_target UUID, _action TEXT, _hours INTEGER DEFAULT 24)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _action = 'reset' THEN
    UPDATE public.profiles SET trial_started_at = now(),
      trial_expires_at = now() + make_interval(hours => COALESCE(_hours, 24)),
      subscription_status = CASE WHEN subscription_status = 'active' THEN subscription_status ELSE 'trial' END
    WHERE id = _target RETURNING * INTO _row;
  ELSIF _action = 'extend' THEN
    UPDATE public.profiles SET trial_expires_at =
      GREATEST(trial_expires_at, now()) + make_interval(hours => COALESCE(_hours, 24))
    WHERE id = _target RETURNING * INTO _row;
  ELSIF _action = 'disable' THEN
    UPDATE public.profiles SET trial_expires_at = now()
    WHERE id = _target RETURNING * INTO _row;
  ELSE
    RAISE EXCEPTION 'unknown action';
  END IF;
  PERFORM public.admin_log(_target, 'trial_' || _action, jsonb_build_object('hours', _hours));
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_manage_trial(UUID, TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_subscription(
  _target UUID, _status public.subscription_status, _plan TEXT DEFAULT 'pro', _days INTEGER DEFAULT NULL)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.profiles; _exp TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  _exp := CASE WHEN _days IS NULL THEN NULL ELSE now() + make_interval(days => _days) END;
  UPDATE public.profiles SET subscription_status = _status, subscription_expires_at = _exp
  WHERE id = _target RETURNING * INTO _row;
  INSERT INTO public.subscriptions (user_id, plan, status, expires_at, granted_manually)
  VALUES (_target, COALESCE(_plan,'pro'), _status, _exp, true);
  PERFORM public.admin_log(_target, 'change_subscription',
    jsonb_build_object('status', _status, 'plan', _plan, 'days', _days));
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_set_subscription(UUID, public.subscription_status, TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_platform_settings(
  _status public.platform_status DEFAULT NULL,
  _maintenance BOOLEAN DEFAULT NULL,
  _message TEXT DEFAULT NULL,
  _window_enabled BOOLEAN DEFAULT NULL,
  _window_start TIMESTAMPTZ DEFAULT NULL,
  _window_end TIMESTAMPTZ DEFAULT NULL
) RETURNS public.platform_settings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.platform_settings;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.platform_settings SET
    platform_status = COALESCE(_status, platform_status),
    maintenance_mode = COALESCE(_maintenance, maintenance_mode),
    maintenance_message = COALESCE(_message, maintenance_message),
    global_access_enabled = COALESCE(_window_enabled, global_access_enabled),
    global_access_start = CASE WHEN _window_enabled IS FALSE THEN NULL ELSE COALESCE(_window_start, global_access_start) END,
    global_access_end = CASE WHEN _window_enabled IS FALSE THEN NULL ELSE COALESCE(_window_end, global_access_end) END,
    updated_at = now()
  WHERE id RETURNING * INTO _row;
  PERFORM public.admin_log(NULL, 'update_platform_settings',
    jsonb_build_object('status', _status, 'maintenance', _maintenance,
      'window_enabled', _window_enabled, 'window_start', _window_start, 'window_end', _window_end));
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_update_platform_settings(public.platform_status, BOOLEAN, TEXT, BOOLEAN, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Admin overview: users list with computed access state
CREATE OR REPLACE FUNCTION public.admin_list_users(_search TEXT DEFAULT NULL, _limit INTEGER DEFAULT 200)
RETURNS TABLE (
  id UUID, user_code BIGINT, full_name TEXT, email TEXT, created_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ, trial_expires_at TIMESTAMPTZ,
  subscription_status public.subscription_status, subscription_expires_at TIMESTAMPTZ,
  platform_access_status public.platform_access_status, access_override public.access_override,
  access_expires_at TIMESTAMPTZ, permanent_access BOOLEAN, suspended_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ, is_admin BOOLEAN, access JSONB, ai_requests BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT p.id, p.user_code, p.full_name, p.email, p.created_at,
    p.trial_started_at, p.trial_expires_at, p.subscription_status, p.subscription_expires_at,
    p.platform_access_status, p.access_override, p.access_expires_at, p.permanent_access,
    p.suspended_at, p.last_active_at, public.has_role(p.id, 'admin'),
    public.access_state(p.id),
    (SELECT count(*) FROM public.ai_usage_logs l WHERE l.user_id = p.id)
  FROM public.profiles p
  WHERE _search IS NULL OR _search = ''
     OR p.full_name ILIKE '%' || _search || '%'
     OR p.email ILIKE '%' || _search || '%'
     OR p.user_code::text ILIKE '%' || _search || '%'
  ORDER BY p.created_at DESC
  LIMIT COALESCE(_limit, 200);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_7d', (SELECT count(*) FROM public.profiles WHERE last_active_at > now() - interval '7 days'),
    'trial_users', (SELECT count(*) FROM public.profiles WHERE trial_expires_at > now() AND subscription_status <> 'active'),
    'trial_expired', (SELECT count(*) FROM public.profiles WHERE trial_expires_at <= now() AND subscription_status <> 'active'),
    'active_subscribers', (SELECT count(*) FROM public.profiles WHERE subscription_status = 'active'),
    'expired_subscribers', (SELECT count(*) FROM public.profiles WHERE subscription_status IN ('expired','cancelled')),
    'suspended', (SELECT count(*) FROM public.profiles WHERE platform_access_status = 'suspended'),
    'allowed_now', (SELECT count(*) FROM public.profiles p WHERE public.can_access_platform(p.id)),
    'ai_requests', (SELECT count(*) FROM public.ai_usage_logs),
    'questions_generated', (SELECT count(*) FROM public.questions),
    'questions_solved', (SELECT count(*) FROM public.question_attempts),
    'documents_uploaded', (SELECT count(*) FROM public.documents),
    'signups_by_day', (
      SELECT COALESCE(jsonb_agg(x ORDER BY x->>'day'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('day', to_char(created_at::date,'YYYY-MM-DD'), 'count', count(*)) AS x
        FROM public.profiles WHERE created_at > now() - interval '30 days'
        GROUP BY created_at::date) s),
    'attempts_by_day', (
      SELECT COALESCE(jsonb_agg(x ORDER BY x->>'day'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('day', to_char(created_at::date,'YYYY-MM-DD'), 'count', count(*)) AS x
        FROM public.question_attempts WHERE created_at > now() - interval '30 days'
        GROUP BY created_at::date) s)
  ) INTO r;
  RETURN r;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_user_detail(_target UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'profile', to_jsonb(p),
    'is_admin', public.has_role(p.id,'admin'),
    'access', public.access_state(p.id),
    'questions_total', (SELECT count(*) FROM public.questions q WHERE q.user_id = p.id),
    'attempts_total', (SELECT count(*) FROM public.question_attempts a WHERE a.user_id = p.id),
    'attempts_correct', (SELECT count(*) FROM public.question_attempts a WHERE a.user_id = p.id AND a.is_correct),
    'hard_solved', (SELECT count(*) FROM public.question_attempts a JOIN public.questions q ON q.id = a.question_id
                     WHERE a.user_id = p.id AND q.difficulty IN ('hard','very_hard')),
    'nightmare_solved', (SELECT count(*) FROM public.question_attempts a JOIN public.questions q ON q.id = a.question_id
                     WHERE a.user_id = p.id AND q.difficulty = 'nightmare'),
    'mistakes_total', (SELECT count(*) FROM public.mistakes m WHERE m.user_id = p.id),
    'weak_concepts', (SELECT count(*) FROM public.mastery m WHERE m.user_id = p.id AND m.is_weak),
    'documents', (SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.created_at DESC), '[]'::jsonb)
                   FROM public.documents d WHERE d.user_id = p.id),
    'ai_requests', (SELECT count(*) FROM public.ai_usage_logs l WHERE l.user_id = p.id),
    'last_ai_activity', (SELECT max(created_at) FROM public.ai_usage_logs l WHERE l.user_id = p.id),
    'subscriptions', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.created_at DESC), '[]'::jsonb)
                   FROM public.subscriptions s WHERE s.user_id = p.id),
    'audit', (SELECT COALESCE(jsonb_agg(to_jsonb(al) ORDER BY al.created_at DESC), '[]'::jsonb)
                   FROM public.admin_audit_logs al WHERE al.target_user_id = p.id)
  ) INTO r FROM public.profiles p WHERE p.id = _target;
  RETURN r;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_user_detail(UUID) TO authenticated;

-- first registered user becomes admin bootstrap helper (admin-only promotion afterwards)
CREATE OR REPLACE FUNCTION public.admin_set_role(_target UUID, _role public.app_role, _enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _enabled THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_target, _role) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _target AND role = _role;
  END IF;
  PERFORM public.admin_log(_target, 'set_role', jsonb_build_object('role', _role, 'enabled', _enabled));
END; $$;