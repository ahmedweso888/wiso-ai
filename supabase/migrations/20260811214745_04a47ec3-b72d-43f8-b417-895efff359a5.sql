-- AI settings (no secrets stored here)
create table if not exists public.ai_settings (
  id boolean primary key default true check (id),
  provider text not null default 'gemini' check (provider in ('gemini','openai','anthropic')),
  model text not null default 'google/gemini-2.5-flash',
  temperature numeric not null default 0.7 check (temperature >= 0 and temperature <= 2),
  max_tokens integer not null default 4096 check (max_tokens > 0),
  fallback_enabled boolean not null default false,
  fallback_provider text check (fallback_provider in ('gemini','openai','anthropic')),
  daily_request_limit integer not null default 200,
  monthly_request_limit integer not null default 3000,
  daily_question_limit integer not null default 300,
  daily_document_limit integer not null default 20,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

grant select on public.ai_settings to authenticated;
grant all on public.ai_settings to service_role;
alter table public.ai_settings enable row level security;

drop policy if exists "Admins read ai settings" on public.ai_settings;
create policy "Admins read ai settings" on public.ai_settings
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.ai_settings (id) values (true) on conflict (id) do nothing;

-- richer usage tracking
alter table public.ai_usage_logs add column if not exists provider text;
alter table public.ai_usage_logs add column if not exists documents_analyzed integer not null default 0;
alter table public.ai_usage_logs add column if not exists images_analyzed integer not null default 0;
alter table public.ai_usage_logs add column if not exists latency_ms integer;

create index if not exists ai_usage_logs_created_at_idx on public.ai_usage_logs (created_at desc);
create index if not exists ai_usage_logs_user_created_idx on public.ai_usage_logs (user_id, created_at desc);

create or replace function public.admin_update_ai_settings(
  _provider text default null,
  _model text default null,
  _temperature numeric default null,
  _max_tokens integer default null,
  _fallback_enabled boolean default null,
  _fallback_provider text default null,
  _daily_request_limit integer default null,
  _monthly_request_limit integer default null,
  _daily_question_limit integer default null,
  _daily_document_limit integer default null,
  _enabled boolean default null
)
returns public.ai_settings
language plpgsql
security definer
set search_path = public
as $$
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
    updated_at = now(),
    updated_by = auth.uid()
  where id
  returning * into result;

  insert into public.admin_audit_logs (admin_id, action, target_user_id, details)
  values (auth.uid(), 'ai_settings_update', null, to_jsonb(result));

  return result;
end;
$$;

revoke all on function public.admin_update_ai_settings(text,text,numeric,integer,boolean,text,integer,integer,integer,integer,boolean) from public, anon;
grant execute on function public.admin_update_ai_settings(text,text,numeric,integer,boolean,text,integer,integer,integer,integer,boolean) to authenticated;

create or replace function public.admin_ai_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'requests_today', count(*) filter (where created_at >= date_trunc('day', now())),
    'requests_month', count(*) filter (where created_at >= date_trunc('month', now())),
    'questions_generated', coalesce(sum(questions_generated), 0),
    'documents_analyzed', coalesce(sum(documents_analyzed), 0),
    'images_analyzed', coalesce(sum(images_analyzed), 0),
    'tokens_used', coalesce(sum(tokens_used), 0),
    'errors_today', count(*) filter (where status <> 'ok' and created_at >= date_trunc('day', now())),
    'errors_total', count(*) filter (where status <> 'ok')
  ) into result
  from public.ai_usage_logs;

  return result;
end;
$$;

revoke all on function public.admin_ai_stats() from public, anon;
grant execute on function public.admin_ai_stats() to authenticated;