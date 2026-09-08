-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.platform_access_status AS ENUM ('allowed','suspended','expired');
CREATE TYPE public.access_override AS ENUM ('default','trial','subscriber','admin_granted','suspended');
CREATE TYPE public.subscription_status AS ENUM ('trial','active','expired','cancelled','none');
CREATE TYPE public.platform_status AS ENUM ('open','closed','maintenance');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- USER CODE SEQUENCE
CREATE SEQUENCE public.user_code_seq START WITH 1001 INCREMENT BY 1;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_code BIGINT NOT NULL UNIQUE DEFAULT nextval('public.user_code_seq'),
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  subscription_status public.subscription_status NOT NULL DEFAULT 'trial',
  subscription_expires_at TIMESTAMPTZ,
  platform_access_status public.platform_access_status NOT NULL DEFAULT 'allowed',
  access_override public.access_override NOT NULL DEFAULT 'default',
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  permanent_access BOOLEAN NOT NULL DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES (separate table, never on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- PROFILE POLICIES
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Guard: normal users may only change safe profile columns
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  NEW.user_code := OLD.user_code;
  NEW.trial_started_at := OLD.trial_started_at;
  NEW.trial_expires_at := OLD.trial_expires_at;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_expires_at := OLD.subscription_expires_at;
  NEW.platform_access_status := OLD.platform_access_status;
  NEW.access_override := OLD.access_override;
  NEW.access_granted_at := OLD.access_granted_at;
  NEW.access_expires_at := OLD.access_expires_at;
  NEW.permanent_access := OLD.permanent_access;
  NEW.suspended_at := OLD.suspended_at;
  NEW.suspended_reason := OLD.suspended_reason;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_profiles_protect BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- PLATFORM SETTINGS (singleton)
CREATE TABLE public.platform_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  platform_status public.platform_status NOT NULL DEFAULT 'open',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  global_access_enabled BOOLEAN NOT NULL DEFAULT false,
  global_access_start TIMESTAMPTZ,
  global_access_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable" ON public.platform_settings FOR SELECT TO authenticated USING (true);
INSERT INTO public.platform_settings (id) VALUES (true);

-- AUDIT LOG
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_admin());

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro',
  status public.subscription_status NOT NULL DEFAULT 'none',
  provider TEXT,
  provider_subscription_id TEXT,
  granted_manually BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own subscriptions" ON public.subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PROFILE BOOTSTRAP (no auth-schema triggers)
CREATE OR REPLACE FUNCTION public.ensure_profile(_full_name TEXT DEFAULT NULL)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _email TEXT; _row public.profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _row FROM public.profiles WHERE id = _uid;
  IF FOUND THEN
    UPDATE public.profiles SET last_active_at = now(),
      full_name = COALESCE(NULLIF(_full_name,''), full_name)
      WHERE id = _uid RETURNING * INTO _row;
    RETURN _row;
  END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (_uid, _email, NULLIF(_full_name,''))
  RETURNING * INTO _row;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'user')
  ON CONFLICT DO NOTHING;
  RETURN _row;
END; $$;
GRANT EXECUTE ON FUNCTION public.ensure_profile(TEXT) TO authenticated;

-- CENTRAL ACCESS DECISION ENGINE (single source of truth, server side)
CREATE OR REPLACE FUNCTION public.access_state(_user_id UUID DEFAULT auth.uid())
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; s public.platform_settings; admin BOOLEAN;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  END IF;
  SELECT * INTO p FROM public.profiles WHERE id = _user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_profile');
  END IF;
  SELECT * INTO s FROM public.platform_settings WHERE id;
  admin := public.has_role(_user_id, 'admin');

  IF admin THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'admin', 'is_admin', true,
      'expires_at', NULL, 'platform_status', s.platform_status);
  END IF;

  IF p.platform_access_status = 'suspended' OR p.access_override = 'suspended' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'suspended', 'is_admin', false,
      'suspended_reason', p.suspended_reason, 'platform_status', s.platform_status);
  END IF;

  IF s.maintenance_mode OR s.platform_status = 'maintenance' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'maintenance', 'is_admin', false,
      'platform_status', 'maintenance');
  END IF;

  IF s.platform_status = 'closed' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'platform_closed', 'is_admin', false,
      'platform_status', 'closed');
  END IF;

  IF s.global_access_enabled THEN
    IF s.global_access_start IS NOT NULL AND now() < s.global_access_start THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'window_not_open', 'is_admin', false,
        'window_start', s.global_access_start, 'window_end', s.global_access_end,
        'platform_status', s.platform_status);
    END IF;
    IF s.global_access_end IS NOT NULL AND now() > s.global_access_end THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'window_closed', 'is_admin', false,
        'window_start', s.global_access_start, 'window_end', s.global_access_end,
        'platform_status', s.platform_status);
    END IF;
  END IF;

  IF p.permanent_access THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'permanent_access', 'is_admin', false,
      'expires_at', NULL, 'platform_status', s.platform_status);
  END IF;

  IF p.access_expires_at IS NOT NULL AND p.access_expires_at > now() THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'admin_granted', 'is_admin', false,
      'expires_at', p.access_expires_at, 'platform_status', s.platform_status);
  END IF;

  IF p.subscription_status = 'active'
     AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > now()) THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'subscription', 'is_admin', false,
      'expires_at', p.subscription_expires_at, 'platform_status', s.platform_status);
  END IF;

  IF p.subscription_status = 'cancelled' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'subscription_cancelled', 'is_admin', false,
      'platform_status', s.platform_status);
  END IF;

  IF p.trial_expires_at > now() THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'trial', 'is_admin', false,
      'expires_at', p.trial_expires_at, 'platform_status', s.platform_status);
  END IF;

  IF p.subscription_status = 'expired' OR p.subscription_expires_at IS NOT NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'subscription_expired', 'is_admin', false,
      'platform_status', s.platform_status);
  END IF;

  RETURN jsonb_build_object('allowed', false, 'reason', 'trial_expired', 'is_admin', false,
    'trial_expires_at', p.trial_expires_at, 'platform_status', s.platform_status);
END; $$;
GRANT EXECUTE ON FUNCTION public.access_state(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_access_platform(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((public.access_state(_user_id) ->> 'allowed')::boolean, false);
$$;
GRANT EXECUTE ON FUNCTION public.can_access_platform(UUID) TO authenticated;