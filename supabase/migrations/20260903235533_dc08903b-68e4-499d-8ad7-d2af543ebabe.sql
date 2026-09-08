-- ============ ENUMS ============
CREATE TYPE public.plan_ai_model AS ENUM ('model_a','model_b');
CREATE TYPE public.sub_request_status AS ENUM ('pending','under_review','approved','rejected','cancelled');
CREATE TYPE public.student_sub_status AS ENUM ('active','expired','revoked');

-- ============ PLANS ============
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EGP',
  ai_enabled boolean NOT NULL DEFAULT true,
  ai_model public.plan_ai_model NOT NULL DEFAULT 'model_a',
  daily_question_limit integer NOT NULL DEFAULT 50,
  daily_image_limit integer NOT NULL DEFAULT 10,
  max_images_per_request integer NOT NULL DEFAULT 3,
  daily_pdf_limit integer NOT NULL DEFAULT 3,
  max_pdf_size_mb integer NOT NULL DEFAULT 15,
  max_pdf_pages integer NOT NULL DEFAULT 40,
  max_questions_per_request integer NOT NULL DEFAULT 10,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read_active" ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REQUESTS ============
CREATE TABLE public.subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  payment_reference text NOT NULL,
  payment_screenshot_path text NOT NULL,
  status public.sub_request_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sub_requests_student ON public.subscription_requests(student_id);
CREATE INDEX idx_sub_requests_status ON public.subscription_requests(status);
GRANT SELECT ON public.subscription_requests TO authenticated;
GRANT ALL ON public.subscription_requests TO service_role;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests_read_own" ON public.subscription_requests
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sub_requests_updated BEFORE UPDATE ON public.subscription_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ STUDENT SUBSCRIPTIONS ============
CREATE TABLE public.student_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status public.student_sub_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  activated_by uuid REFERENCES auth.users(id),
  activated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_reason text,
  source_request_id uuid REFERENCES public.subscription_requests(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_student_subs_student ON public.student_subscriptions(student_id);
CREATE UNIQUE INDEX idx_student_subs_one_active
  ON public.student_subscriptions(student_id) WHERE status = 'active';
GRANT SELECT ON public.student_subscriptions TO authenticated;
GRANT ALL ON public.student_subscriptions TO service_role;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_subs_read_own" ON public.student_subscriptions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_student_subs_updated BEFORE UPDATE ON public.student_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AUDIT ============
CREATE TABLE public.subscription_request_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.subscription_requests(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_request_audit_logs TO authenticated;
GRANT ALL ON public.subscription_request_audit_logs TO service_role;
ALTER TABLE public.subscription_request_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "request_audit_admin_read" ON public.subscription_request_audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ PAYMENT SETTINGS ============
CREATE TABLE public.payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  method_name text NOT NULL DEFAULT 'Vodafone Cash',
  payment_number text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT 'حوّل قيمة الاشتراك على الرقم اللي فوق، وبعدها ارفع Screenshot للتحويل واكتب رقم التحويل.',
  max_screenshot_mb integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_settings_read" ON public.payment_settings
  FOR SELECT TO authenticated USING (true);
INSERT INTO public.payment_settings (id) VALUES (true);

-- ============ AI MODEL SLOTS + SWITCHES ============
ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS model_a_provider text NOT NULL DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS model_a_name text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS model_a_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS model_b_provider text NOT NULL DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS model_b_name text NOT NULL DEFAULT 'google/gemini-2.5-pro',
  ADD COLUMN IF NOT EXISTS model_b_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_mode_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_emergency_disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_routing_enabled boolean NOT NULL DEFAULT true;

-- ============ EXPIRE HELPER ============
CREATE OR REPLACE FUNCTION public.expire_due_subscriptions()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.student_subscriptions
     SET status = 'expired'
   WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= now();
$$;
REVOKE ALL ON FUNCTION public.expire_due_subscriptions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_due_subscriptions() TO authenticated;

-- ============ STUDENT: ENTITLEMENT STATE ============
CREATE OR REPLACE FUNCTION public.my_subscription_state()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _admin boolean;
  _sub public.student_subscriptions;
  _plan public.subscription_plans;
  _req jsonb;
  _s public.ai_settings;
  _q integer; _i integer; _d integer;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('allowed', false, 'reason','unauthenticated'); END IF;
  _admin := public.has_role(_uid,'admin');
  SELECT * INTO _s FROM public.ai_settings WHERE id;

  SELECT * INTO _sub FROM public.student_subscriptions
   WHERE student_id = _uid AND status = 'active'
     AND (expires_at IS NULL OR expires_at > now())
   ORDER BY activated_at DESC LIMIT 1;
  IF FOUND THEN SELECT * INTO _plan FROM public.subscription_plans WHERE id = _sub.plan_id; END IF;

  SELECT to_jsonb(r) INTO _req FROM (
    SELECT sr.id, sr.status, sr.rejection_reason, sr.submitted_at, sr.reviewed_at,
           p.name AS plan_name, p.price
      FROM public.subscription_requests sr
      JOIN public.subscription_plans p ON p.id = sr.plan_id
     WHERE sr.student_id = _uid
     ORDER BY sr.submitted_at DESC LIMIT 1
  ) r;

  SELECT COALESCE(sum(questions_generated),0), COALESCE(sum(images_analyzed),0),
         COALESCE(sum(documents_analyzed),0)
    INTO _q, _i, _d
    FROM public.ai_usage_logs
   WHERE user_id = _uid AND status = 'ok' AND created_at >= date_trunc('day', now());

  RETURN jsonb_build_object(
    'is_admin', _admin,
    'allowed', _admin OR _sub.id IS NOT NULL,
    'reason', CASE WHEN _admin THEN 'admin'
                   WHEN _sub.id IS NOT NULL THEN 'subscription'
                   WHEN _req IS NOT NULL AND (_req->>'status') IN ('pending','under_review') THEN 'request_pending'
                   WHEN _req IS NOT NULL AND (_req->>'status') = 'rejected' THEN 'request_rejected'
                   WHEN EXISTS (SELECT 1 FROM public.student_subscriptions
                                 WHERE student_id = _uid AND status <> 'active') THEN 'subscription_expired'
                   ELSE 'no_subscription' END,
    'subscription', CASE WHEN _sub.id IS NULL THEN NULL ELSE jsonb_build_object(
        'id', _sub.id, 'status', _sub.status, 'started_at', _sub.started_at,
        'expires_at', _sub.expires_at, 'plan', to_jsonb(_plan)) END,
    'latest_request', _req,
    'ai', jsonb_build_object(
        'mode_enabled', COALESCE(_s.ai_mode_enabled, true),
        'emergency_disabled', COALESCE(_s.ai_emergency_disabled, false),
        'plan_ai_enabled', COALESCE(_plan.ai_enabled, false),
        'model', _plan.ai_model),
    'usage', jsonb_build_object(
        'questions_used', _q, 'images_used', _i, 'pdfs_used', _d,
        'questions_limit', _plan.daily_question_limit,
        'images_limit', _plan.daily_image_limit,
        'pdfs_limit', _plan.daily_pdf_limit)
  );
END; $$;
REVOKE ALL ON FUNCTION public.my_subscription_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_subscription_state() TO authenticated;

-- ============ STUDENT: SUBMIT REQUEST ============
CREATE OR REPLACE FUNCTION public.submit_subscription_request(
  _plan_id uuid, _payment_reference text, _screenshot_path text)
RETURNS public.subscription_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _row public.subscription_requests;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _payment_reference IS NULL OR length(trim(_payment_reference)) < 6 THEN
    RAISE EXCEPTION 'invalid payment reference'; END IF;
  IF _screenshot_path IS NULL OR _screenshot_path = '' THEN
    RAISE EXCEPTION 'screenshot required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE id = _plan_id AND is_active) THEN
    RAISE EXCEPTION 'plan not available'; END IF;
  IF EXISTS (SELECT 1 FROM public.subscription_requests
              WHERE student_id = _uid AND status IN ('pending','under_review')) THEN
    RAISE EXCEPTION 'request already pending'; END IF;
  IF (SELECT count(*) FROM public.subscription_requests
       WHERE student_id = _uid AND submitted_at > now() - interval '1 day') >= 5 THEN
    RAISE EXCEPTION 'too many requests'; END IF;

  INSERT INTO public.subscription_requests
    (student_id, plan_id, payment_reference, payment_screenshot_path)
  VALUES (_uid, _plan_id, trim(_payment_reference), _screenshot_path)
  RETURNING * INTO _row;

  INSERT INTO public.subscription_request_audit_logs (request_id, actor_id, action, metadata)
  VALUES (_row.id, _uid, 'created', jsonb_build_object('plan_id', _plan_id));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.submit_subscription_request(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_subscription_request(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_my_subscription_request(_id uuid)
RETURNS public.subscription_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.subscription_requests;
BEGIN
  UPDATE public.subscription_requests SET status = 'cancelled'
   WHERE id = _id AND student_id = auth.uid() AND status IN ('pending','under_review')
   RETURNING * INTO _row;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not cancellable'; END IF;
  INSERT INTO public.subscription_request_audit_logs (request_id, actor_id, action)
  VALUES (_id, auth.uid(), 'cancelled');
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.cancel_my_subscription_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_subscription_request(uuid) TO authenticated;

-- ============ ADMIN: PLANS ============
CREATE OR REPLACE FUNCTION public.admin_upsert_plan(_plan jsonb, _id uuid DEFAULT NULL)
RETURNS public.subscription_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.subscription_plans;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.subscription_plans (
      name, description, price, currency, ai_enabled, ai_model,
      daily_question_limit, daily_image_limit, max_images_per_request,
      daily_pdf_limit, max_pdf_size_mb, max_pdf_pages, max_questions_per_request,
      features, is_active, display_order)
    VALUES (
      COALESCE(_plan->>'name','باقة'), _plan->>'description',
      COALESCE((_plan->>'price')::numeric,0), COALESCE(_plan->>'currency','EGP'),
      COALESCE((_plan->>'ai_enabled')::boolean,true),
      COALESCE((_plan->>'ai_model')::public.plan_ai_model,'model_a'),
      COALESCE((_plan->>'daily_question_limit')::int,50),
      COALESCE((_plan->>'daily_image_limit')::int,10),
      COALESCE((_plan->>'max_images_per_request')::int,3),
      COALESCE((_plan->>'daily_pdf_limit')::int,3),
      COALESCE((_plan->>'max_pdf_size_mb')::int,15),
      COALESCE((_plan->>'max_pdf_pages')::int,40),
      COALESCE((_plan->>'max_questions_per_request')::int,10),
      COALESCE(_plan->'features','[]'::jsonb),
      COALESCE((_plan->>'is_active')::boolean,true),
      COALESCE((_plan->>'display_order')::int,0))
    RETURNING * INTO _row;
  ELSE
    UPDATE public.subscription_plans SET
      name = COALESCE(_plan->>'name', name),
      description = COALESCE(_plan->>'description', description),
      price = COALESCE((_plan->>'price')::numeric, price),
      currency = COALESCE(_plan->>'currency', currency),
      ai_enabled = COALESCE((_plan->>'ai_enabled')::boolean, ai_enabled),
      ai_model = COALESCE((_plan->>'ai_model')::public.plan_ai_model, ai_model),
      daily_question_limit = COALESCE((_plan->>'daily_question_limit')::int, daily_question_limit),
      daily_image_limit = COALESCE((_plan->>'daily_image_limit')::int, daily_image_limit),
      max_images_per_request = COALESCE((_plan->>'max_images_per_request')::int, max_images_per_request),
      daily_pdf_limit = COALESCE((_plan->>'daily_pdf_limit')::int, daily_pdf_limit),
      max_pdf_size_mb = COALESCE((_plan->>'max_pdf_size_mb')::int, max_pdf_size_mb),
      max_pdf_pages = COALESCE((_plan->>'max_pdf_pages')::int, max_pdf_pages),
      max_questions_per_request = COALESCE((_plan->>'max_questions_per_request')::int, max_questions_per_request),
      features = COALESCE(_plan->'features', features),
      is_active = COALESCE((_plan->>'is_active')::boolean, is_active),
      display_order = COALESCE((_plan->>'display_order')::int, display_order)
    WHERE id = _id RETURNING * INTO _row;
    IF NOT FOUND THEN RAISE EXCEPTION 'plan not found'; END IF;
  END IF;
  PERFORM public.admin_log(NULL, 'upsert_plan', jsonb_build_object('plan_id', _row.id));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_upsert_plan(jsonb,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_plan(jsonb,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_payment_settings(
  _method text DEFAULT NULL, _number text DEFAULT NULL,
  _instructions text DEFAULT NULL, _max_mb integer DEFAULT NULL)
RETURNS public.payment_settings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.payment_settings;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.payment_settings SET
    method_name = COALESCE(_method, method_name),
    payment_number = COALESCE(_number, payment_number),
    instructions = COALESCE(_instructions, instructions),
    max_screenshot_mb = COALESCE(_max_mb, max_screenshot_mb),
    updated_at = now(), updated_by = auth.uid()
  WHERE id RETURNING * INTO _row;
  PERFORM public.admin_log(NULL,'update_payment_settings','{}'::jsonb);
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_update_payment_settings(text,text,text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_settings(text,text,text,integer) TO authenticated;

-- ============ ADMIN: REQUESTS ============
CREATE OR REPLACE FUNCTION public.admin_list_subscription_requests(
  _status public.sub_request_status DEFAULT NULL, _limit integer DEFAULT 200)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT COALESCE(jsonb_agg(x ORDER BY x->>'submitted_at' DESC), '[]'::jsonb) INTO r FROM (
    SELECT jsonb_build_object(
      'id', sr.id, 'status', sr.status, 'payment_reference', sr.payment_reference,
      'payment_screenshot_path', sr.payment_screenshot_path,
      'submitted_at', sr.submitted_at, 'reviewed_at', sr.reviewed_at,
      'rejection_reason', sr.rejection_reason, 'admin_notes', sr.admin_notes,
      'student', jsonb_build_object('id', p.id, 'full_name', p.full_name,
                                    'email', p.email, 'user_code', p.user_code),
      'plan', to_jsonb(pl),
      'has_active_subscription', EXISTS (
        SELECT 1 FROM public.student_subscriptions ss
         WHERE ss.student_id = sr.student_id AND ss.status = 'active'
           AND (ss.expires_at IS NULL OR ss.expires_at > now()))
    ) AS x
    FROM public.subscription_requests sr
    JOIN public.profiles p ON p.id = sr.student_id
    JOIN public.subscription_plans pl ON pl.id = sr.plan_id
    WHERE _status IS NULL OR sr.status = _status
    ORDER BY sr.submitted_at DESC
    LIMIT COALESCE(_limit,200)) s;
  RETURN r;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_subscription_requests(public.sub_request_status,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_subscription_requests(public.sub_request_status,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_subscription_request(_id uuid, _notes text DEFAULT NULL)
RETURNS public.subscription_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.subscription_requests;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.subscription_requests
     SET status = 'under_review', reviewed_at = now(), reviewed_by = auth.uid(),
         admin_notes = COALESCE(_notes, admin_notes)
   WHERE id = _id AND status IN ('pending','under_review') RETURNING * INTO _row;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not reviewable'; END IF;
  INSERT INTO public.subscription_request_audit_logs (request_id, actor_id, action, notes)
  VALUES (_id, auth.uid(), 'under_review', _notes);
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_review_subscription_request(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_subscription_request(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_reject_subscription_request(_id uuid, _reason text)
RETURNS public.subscription_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.subscription_requests;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _reason IS NULL OR length(trim(_reason)) < 3 THEN RAISE EXCEPTION 'rejection reason required'; END IF;
  UPDATE public.subscription_requests
     SET status = 'rejected', rejection_reason = trim(_reason),
         reviewed_at = now(), reviewed_by = auth.uid()
   WHERE id = _id AND status IN ('pending','under_review') RETURNING * INTO _row;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not rejectable'; END IF;
  INSERT INTO public.subscription_request_audit_logs (request_id, actor_id, action, notes)
  VALUES (_id, auth.uid(), 'rejected', trim(_reason));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_reject_subscription_request(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reject_subscription_request(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_approve_subscription_request(
  _id uuid, _expires_at timestamptz, _replace_active boolean DEFAULT false, _notes text DEFAULT NULL)
RETURNS public.student_subscriptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _req public.subscription_requests; _sub public.student_subscriptions; _active uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _req FROM public.subscription_requests WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found'; END IF;
  IF _req.status NOT IN ('pending','under_review') THEN RAISE EXCEPTION 'request already processed'; END IF;
  IF _expires_at IS NULL OR _expires_at <= now() THEN RAISE EXCEPTION 'invalid expiry date'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE id = _req.plan_id) THEN
    RAISE EXCEPTION 'plan not found'; END IF;

  SELECT id INTO _active FROM public.student_subscriptions
   WHERE student_id = _req.student_id AND status = 'active' LIMIT 1;
  IF _active IS NOT NULL THEN
    IF NOT _replace_active THEN RAISE EXCEPTION 'student already has an active subscription'; END IF;
    UPDATE public.student_subscriptions
       SET status = 'revoked', revoked_at = now(), revoked_reason = 'replaced by new subscription'
     WHERE id = _active;
  END IF;

  INSERT INTO public.student_subscriptions
    (student_id, plan_id, status, started_at, expires_at, activated_by, activated_at, source_request_id)
  VALUES (_req.student_id, _req.plan_id, 'active', now(), _expires_at, auth.uid(), now(), _req.id)
  RETURNING * INTO _sub;

  UPDATE public.subscription_requests
     SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(),
         admin_notes = COALESCE(_notes, admin_notes)
   WHERE id = _id;

  INSERT INTO public.subscription_request_audit_logs (request_id, actor_id, action, notes, metadata)
  VALUES (_id, auth.uid(), 'approved', _notes,
          jsonb_build_object('subscription_id', _sub.id, 'expires_at', _expires_at,
                             'replaced_active', _active));
  PERFORM public.admin_log(_req.student_id, 'activate_subscription',
          jsonb_build_object('request_id', _id, 'plan_id', _req.plan_id, 'expires_at', _expires_at));
  RETURN _sub;
END; $$;
REVOKE ALL ON FUNCTION public.admin_approve_subscription_request(uuid,timestamptz,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_approve_subscription_request(uuid,timestamptz,boolean,text) TO authenticated;

-- ============ ADMIN: SUBSCRIPTIONS ============
CREATE OR REPLACE FUNCTION public.admin_list_student_subscriptions(_limit integer DEFAULT 200)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT COALESCE(jsonb_agg(x ORDER BY x->>'activated_at' DESC),'[]'::jsonb) INTO r FROM (
    SELECT jsonb_build_object(
      'id', ss.id, 'status', ss.status, 'started_at', ss.started_at,
      'expires_at', ss.expires_at, 'activated_at', ss.activated_at,
      'revoked_at', ss.revoked_at,
      'student', jsonb_build_object('id', p.id, 'full_name', p.full_name,
                                    'email', p.email, 'user_code', p.user_code),
      'plan', to_jsonb(pl)) AS x
    FROM public.student_subscriptions ss
    JOIN public.profiles p ON p.id = ss.student_id
    JOIN public.subscription_plans pl ON pl.id = ss.plan_id
    ORDER BY ss.activated_at DESC LIMIT COALESCE(_limit,200)) s;
  RETURN r;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_student_subscriptions(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_student_subscriptions(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_extend_student_subscription(_id uuid, _days integer)
RETURNS public.student_subscriptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.student_subscriptions; _base timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _days IS NULL OR _days <= 0 THEN RAISE EXCEPTION 'invalid days'; END IF;
  SELECT * INTO _row FROM public.student_subscriptions WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription not found'; END IF;
  IF _row.status = 'revoked' THEN RAISE EXCEPTION 'subscription revoked'; END IF;
  _base := CASE WHEN _row.expires_at IS NOT NULL AND _row.expires_at > now()
                THEN _row.expires_at ELSE now() END;
  UPDATE public.student_subscriptions
     SET expires_at = _base + make_interval(days => _days), status = 'active'
   WHERE id = _id RETURNING * INTO _row;
  PERFORM public.admin_log(_row.student_id, 'extend_subscription',
          jsonb_build_object('subscription_id', _id, 'days', _days, 'expires_at', _row.expires_at));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_extend_student_subscription(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_extend_student_subscription(uuid,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_revoke_student_subscription(_id uuid, _reason text DEFAULT NULL)
RETURNS public.student_subscriptions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.student_subscriptions;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.student_subscriptions
     SET status = 'revoked', revoked_at = now(), revoked_reason = _reason
   WHERE id = _id AND status <> 'revoked' RETURNING * INTO _row;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription not revocable'; END IF;
  PERFORM public.admin_log(_row.student_id, 'revoke_subscription',
          jsonb_build_object('subscription_id', _id, 'reason', _reason));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_revoke_student_subscription(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_student_subscription(uuid,text) TO authenticated;

-- ============ SEED DEFAULT PLANS ============
INSERT INTO public.subscription_plans
  (name, description, price, ai_enabled, ai_model, daily_question_limit, daily_image_limit,
   max_images_per_request, daily_pdf_limit, max_pdf_size_mb, max_pdf_pages,
   max_questions_per_request, features, is_active, display_order)
VALUES
  ('Basic', 'بداية قوية: خطة مذاكرة وأسئلة يومية بموديل سريع.', 150, true, 'model_a',
   50, 10, 3, 3, 15, 40, 10,
   '["خطة مذاكرة لحد 1 يناير 2027","50 سؤال يوميًا","تحليل 10 صور يوميًا","محرك الأخطاء"]'::jsonb,
   true, 1),
  ('Premium', 'الوضع الوحشي: أسئلة Nightmare وتحليل أعمق بموديل متقدم.', 300, true, 'model_b',
   150, 50, 6, 10, 30, 120, 25,
   '["كل مميزات Basic","150 سؤال يوميًا","Nightmare Mode","تحليل PDF لحد 120 صفحة","تحليل أداء متقدم"]'::jsonb,
   true, 2);