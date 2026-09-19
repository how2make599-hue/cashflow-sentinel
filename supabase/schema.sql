create extension if not exists pgcrypto;
create table if not exists public.leads(
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), name text not null, email text not null,
 company text not null, phone text, active_projects integer default 0, overdue_cash numeric default 0, monthly_revenue numeric default 0,
 payment_terms_days integer default 30, payment_pressure boolean default false, cash_exposure numeric default 0, priority text not null default 'Watch',
 source text not null default 'cashflow-audit', status text not null default 'new', consent_at timestamptz, follow_up_sent_at timestamptz,
 unsubscribed_at timestamptz, last_contact_at timestamptz, next_follow_up_at timestamptz
);
create table if not exists public.lead_events(id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), lead_id uuid not null references public.leads(id) on delete cascade,event_type text not null,metadata jsonb not null default '{}'::jsonb);
alter table public.leads add column if not exists unsubscribed_at timestamptz;
alter table public.leads add column if not exists last_contact_at timestamptz;
alter table public.leads add column if not exists next_follow_up_at timestamptz;
create unique index if not exists leads_email_unique_idx on public.leads (lower(email));
alter table public.leads enable row level security; alter table public.lead_events enable row level security;
revoke all on public.leads from anon,authenticated; revoke all on public.lead_events from anon,authenticated;

create table if not exists public.recovery_checks (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 invoice_amount numeric not null,
 due_date date not null,
 paid_date date,
 reference_rate numeric not null default 3.75,
 statutory_rate numeric not null default 11.75,
 days_overdue integer not null default 0,
 interest_estimate numeric not null default 0,
 recovery_fee numeric not null default 0,
 total_recoverable numeric not null default 0,
 contractual_rate numeric,
 jurisdiction text not null default 'England and Wales',
 email text,
 source text not null default 'recovery-check'
);
alter table public.recovery_checks enable row level security;
revoke all on public.recovery_checks from anon,authenticated;