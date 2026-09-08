CREATE OR REPLACE FUNCTION public.admin_update_ai_settings(
  _provider text DEFAULT NULL::text,
  _model text DEFAULT NULL::text,
  _temperature numeric DEFAULT NULL::numeric,
  _max_tokens integer DEFAULT NULL::integer,
  _fallback_enabled boolean DEFAULT NULL::boolean,
  _fallback_provider text DEFAULT NULL::text,
  _daily_request_limit integer DEFAULT NULL::integer,
  _monthly_request_limit integer DEFAULT NULL::integer,
  _daily_question_limit integer DEFAULT NULL::integer,
  _daily_document_limit integer DEFAULT NULL::integer,
  _enabled boolean DEFAULT NULL::boolean,
  _ai_mode_enabled boolean DEFAULT NULL::boolean,
  _ai_emergency_disabled boolean DEFAULT NULL::boolean
)
RETURNS ai_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  result public.ai_settings;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden';
  end if;

  update public.ai_settings set
    provider = coalesce(_provider, provider),
    model = coalesce(_model, model),
    temperature = coalesce(_temperature, temperature),
    max_tokens = coalesce(_max_tokens, max_tokens),
    fallback_enabled = coalesce(_fallback_enabled, fallback_enabled),
    fallback_provider = coalesce(_fallback_provider, fallback_provider),
    daily_request_limit = coalesce(_daily_request_limit, daily_request_limit),
    monthly_request_limit = coalesce(_monthly_request_limit, monthly_request_limit),
    daily_question_limit = coalesce(_daily_question_limit, daily_question_limit),
    daily_document_limit = coalesce(_daily_document_limit, daily_document_limit),
    enabled = coalesce(_enabled, enabled),
    ai_mode_enabled = coalesce(_ai_mode_enabled, ai_mode_enabled),
    ai_emergency_disabled = coalesce(_ai_emergency_disabled, ai_emergency_disabled),
    updated_at = now(),
    updated_by = auth.uid()
  where id
  returning * into result;

  insert into public.admin_audit_logs (admin_id, action, target_user_id, metadata)
  values (auth.uid(), 'ai_settings_update', null, to_jsonb(result));

  return result;
end;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_ai_settings(text, text, numeric, integer, boolean, text, integer, integer, integer, integer, boolean, boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_ai_settings(text, text, numeric, integer, boolean, text, integer, integer, integer, integer, boolean, boolean, boolean) TO authenticated;