-- G-lab / Apex-only initial production schema
-- Run in a Supabase project when credentials are available.

create extension if not exists pgcrypto;

create type public.research_status as enum ('hypothesis', 'open', 'verified');
create type public.note_visibility as enum ('draft', 'unlisted', 'public');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-zA-Z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  role text,
  bio text check (char_length(bio) <= 300),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  game text not null default 'APEX' check (game = 'APEX'),
  body text not null check (char_length(body) between 1 and 2000),
  status public.research_status not null default 'hypothesis',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.research_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.research_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.research_likes (
  post_id uuid not null references public.research_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.saved_research (
  post_id uuid not null references public.research_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  game text not null default 'APEX' check (game = 'APEX'),
  title text not null check (char_length(title) between 1 and 120),
  summary text check (char_length(summary) <= 300),
  body jsonb not null default '[]'::jsonb,
  visibility public.note_visibility not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  editor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text,
  body jsonb not null,
  change_note text check (char_length(change_note) <= 300),
  created_at timestamptz not null default now(),
  unique (note_id, version_number)
);

create table public.note_assets (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  original_filename text,
  mime_type text not null,
  width integer,
  height integer,
  byte_size bigint not null check (byte_size > 0),
  annotation_data jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  caption text check (char_length(caption) <= 300),
  created_at timestamptz not null default now()
);

create table public.verification_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.research_posts(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  outcome text not null check (outcome in ('reproduced', 'not_reproduced', 'partial', 'conditions_added')),
  platform text,
  rank_band text,
  game_version text,
  attempts integer check (attempts > 0),
  conditions jsonb not null default '{}'::jsonb,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  check ((post_id is not null) <> (note_id is not null))
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'post', 'comment', 'note', 'verification')),
  target_id uuid not null,
  reason text not null,
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index research_posts_feed_idx on public.research_posts (created_at desc) where deleted_at is null;
create index research_posts_tags_idx on public.research_posts using gin (tags);
create index notes_public_idx on public.notes (published_at desc) where visibility = 'public' and deleted_at is null;
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index reports_status_idx on public.reports (status, created_at asc);

alter table public.profiles enable row level security;
alter table public.research_posts enable row level security;
alter table public.research_comments enable row level security;
alter table public.research_likes enable row level security;
alter table public.saved_research enable row level security;
alter table public.follows enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.note_assets enable row level security;
alter table public.verification_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "public posts readable" on public.research_posts for select using (deleted_at is null);
create policy "users create own posts" on public.research_posts for insert with check (auth.uid() = author_id);
create policy "users update own posts" on public.research_posts for update using (auth.uid() = author_id);
create policy "comments readable" on public.research_comments for select using (deleted_at is null);
create policy "users create own comments" on public.research_comments for insert with check (auth.uid() = author_id);
create policy "users update own comments" on public.research_comments for update using (auth.uid() = author_id);
create policy "likes readable" on public.research_likes for select using (true);
create policy "users manage own likes" on public.research_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own saves" on public.saved_research for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "follows readable" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "public or owned notes readable" on public.notes for select using (visibility = 'public' or auth.uid() = author_id);
create policy "users create own notes" on public.notes for insert with check (auth.uid() = author_id);
create policy "users update own notes" on public.notes for update using (auth.uid() = author_id);
create policy "versions follow note access" on public.note_versions for select using (exists (select 1 from public.notes n where n.id = note_id and (n.visibility = 'public' or n.author_id = auth.uid())));
create policy "owners create versions" on public.note_versions for insert with check (auth.uid() = editor_id and exists (select 1 from public.notes n where n.id = note_id and n.author_id = auth.uid()));
create policy "assets follow note access" on public.note_assets for select using (exists (select 1 from public.notes n where n.id = note_id and (n.visibility = 'public' or n.author_id = auth.uid())));
create policy "owners manage assets" on public.note_assets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "verification readable" on public.verification_reports for select using (true);
create policy "users create own verification" on public.verification_reports for insert with check (auth.uid() = author_id);
create policy "notifications private" on public.notifications for select using (auth.uid() = recipient_id);
create policy "users update own notifications" on public.notifications for update using (auth.uid() = recipient_id);
create policy "users manage own blocks" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reporters read own reports" on public.reports for select using (auth.uid() = reporter_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
