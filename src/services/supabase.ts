import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default to environment variables, or retrieve from localStorage if configured via Settings
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('leadsignal_supabase_url') : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('leadsignal_supabase_key') : '';

  return {
    url: storedUrl || envUrl || '',
    key: storedKey || envKey || '',
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

let cachedClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
};

export const resetSupabaseClient = () => {
  cachedClient = null;
};

/**
 * SQL Schema definition provided in Settings for users wishing to run on their Supabase project
 */
export const SUPABASE_SQL_SCHEMA = `-- LeadSignal AI Database Schema for Supabase
-- Run this in the Supabase SQL Editor to provision tables and RLS

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text,
  website_url text,
  role text default 'Owner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ideal Customer Profiles
create table if not exists public.icp_configurations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  company_name text not null,
  website_url text not null,
  service_description text not null,
  target_industries text[] default '{}',
  target_titles text[] default '{}',
  target_seniority text[] default '{}',
  target_countries text[] default '{}',
  company_size_range text default '11-50 employees',
  pain_points text[] default '{}',
  negative_exclusions text[] default '{}',
  daily_lead_target integer default 20,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Discovery Jobs
create table if not exists public.discovery_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  channels text[] default '{}',
  target_query text,
  problem_keywords text[] default '{}',
  status text default 'queued',
  candidates_evaluated integer default 0,
  qualified_count integer default 0,
  total_found integer default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 4. Leads & Intent Signals
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.discovery_jobs on delete set null,
  user_id uuid references auth.users on delete cascade,
  prospect_name text not null,
  job_title text not null,
  company text not null,
  company_size text,
  location text,
  platform text not null,
  source_url text not null,
  post_content text not null,
  post_author_handle text,
  discovered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fit_score integer default 0,
  score_rationale text,
  score_breakdown jsonb default '{}'::jsonb,
  extracted_need text,
  evidence_quotes text[] default '{}',
  missing_evidence text[] default '{}',
  contact_info jsonb default '{}'::jsonb,
  status text default 'new',
  notes text default '',
  is_demo boolean default false
);

-- 5. AI Outreach Drafts
create table if not exists public.outreach_drafts (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads on delete cascade,
  user_id uuid references auth.users on delete cascade,
  format text not null,
  tone text not null,
  subject text,
  body_text text not null,
  status text default 'draft',
  referenced_pains text[] default '{}',
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Watchlists
create table if not exists public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  target_name text not null,
  target_type text not null,
  channel text not null,
  signals_count integer default 0,
  status text default 'active',
  notes text,
  last_checked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.icp_configurations enable row level security;
alter table public.discovery_jobs enable row level security;
alter table public.leads enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.watchlists enable row level security;

-- Basic user isolation policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can operate on own ICPs" on public.icp_configurations for all using (auth.uid() = user_id);
create policy "Users can operate on own jobs" on public.discovery_jobs for all using (auth.uid() = user_id);
create policy "Users can operate on own leads" on public.leads for all using (auth.uid() = user_id);
create policy "Users can operate on own drafts" on public.outreach_drafts for all using (auth.uid() = user_id);
create policy "Users can operate on own watchlists" on public.watchlists for all using (auth.uid() = user_id);
`;
