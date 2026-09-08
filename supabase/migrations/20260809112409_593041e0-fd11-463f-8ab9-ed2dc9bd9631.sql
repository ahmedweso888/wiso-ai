CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.admin_audit_logs (admin_id, target_user_id, action, metadata)
  VALUES (_uid, _uid, 'claim_first_admin', '{}'::jsonb);
  RETURN true;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;