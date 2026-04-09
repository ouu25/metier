create table if not exists public.user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  ai_provider text check (ai_provider in ('claude', 'openai')),
  api_key_encrypted text,
  default_industry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = id);
