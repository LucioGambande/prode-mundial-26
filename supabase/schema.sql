-- Prode Mundial 2026 — pegar en Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Enums
create type match_phase as enum (
  'group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'final'
);

create type match_status as enum ('upcoming', 'locked', 'finished');

-- Tables
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_initials text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "group" text not null,
  flag_emoji text not null
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  match_date timestamptz not null,
  phase match_phase not null,
  group_name text,
  home_score int,
  away_score int,
  decided_by_penalties boolean not null default false,
  winner_team_id uuid references teams(id),
  status match_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  home_score int not null check (home_score >= 0),
  away_score int not null check (away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table bracket_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  group_name text not null,
  predicted_first_id uuid not null references teams(id),
  predicted_second_id uuid not null references teams(id),
  unique (user_id, group_name)
);

create table third_place_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  team_ids uuid[] not null,
  unique (user_id)
);

create table champion_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id),
  unique (user_id)
);

-- Resultados oficiales para puntaje de bracket/campeón
create table group_standings (
  group_name text primary key,
  first_team_id uuid references teams(id),
  second_team_id uuid references teams(id)
);

create table tournament_settings (
  id int primary key default 1 check (id = 1),
  actual_third_place_ids uuid[] not null default '{}',
  actual_champion_id uuid references teams(id)
);

insert into tournament_settings (id) values (1);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_initials, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_initials', upper(left(split_part(new.email, '@', 1), 2))),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lock helper
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  );
$$;

create or replace function public.match_is_open(match_row matches)
returns boolean
language sql
stable
as $$
  select match_row.status = 'upcoming'
    and now() < (match_row.match_date - interval '1 hour');
$$;

create or replace function public.bracket_is_open()
returns boolean
language sql
stable
as $$
  select now() < timestamptz '2026-06-11 03:00:00+00'; -- 11 jun 00:00 ART
$$;

-- RLS
alter table profiles enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table bracket_predictions enable row level security;
alter table third_place_predictions enable row level security;
alter table champion_predictions enable row level security;
alter table group_standings enable row level security;
alter table tournament_settings enable row level security;

-- Profiles
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Teams
create policy "teams_select_all" on teams for select using (true);
create policy "teams_admin_write" on teams for all using (public.is_admin());

-- Matches
create policy "matches_select_all" on matches for select using (true);
create policy "matches_admin_insert" on matches for insert with check (public.is_admin());
create policy "matches_admin_update" on matches for update using (public.is_admin());
create policy "matches_admin_delete" on matches for delete using (public.is_admin());

-- Predictions
create policy "predictions_select_all" on predictions for select using (true);
create policy "predictions_insert_own" on predictions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from matches m
      where m.id = match_id and public.match_is_open(m)
    )
  );
create policy "predictions_update_own" on predictions for update
  using (auth.uid() = user_id)
  with check (
    exists (
      select 1 from matches m
      where m.id = match_id and public.match_is_open(m)
    )
  );

-- Bracket predictions
create policy "bracket_select_all" on bracket_predictions for select using (true);
create policy "bracket_insert_own" on bracket_predictions for insert
  with check (auth.uid() = user_id and public.bracket_is_open());
create policy "bracket_update_own" on bracket_predictions for update
  using (auth.uid() = user_id)
  with check (public.bracket_is_open());

-- Third place
create policy "third_select_all" on third_place_predictions for select using (true);
create policy "third_insert_own" on third_place_predictions for insert
  with check (auth.uid() = user_id and public.bracket_is_open());
create policy "third_update_own" on third_place_predictions for update
  using (auth.uid() = user_id)
  with check (public.bracket_is_open());

-- Champion
create policy "champion_select_all" on champion_predictions for select using (true);
create policy "champion_insert_own" on champion_predictions for insert
  with check (auth.uid() = user_id and public.bracket_is_open());
create policy "champion_update_own" on champion_predictions for update
  using (auth.uid() = user_id)
  with check (public.bracket_is_open());

-- Official results
create policy "group_standings_select_all" on group_standings for select using (true);
create policy "group_standings_admin" on group_standings for all using (public.is_admin());

create policy "tournament_settings_select_all" on tournament_settings for select using (true);
create policy "tournament_settings_admin" on tournament_settings for all using (public.is_admin());

-- Seed teams (Mundial 2026 — 12 grupos x 4)
insert into teams (name, "group", flag_emoji) values
('México', 'A', '🇲🇽'), ('Sudáfrica', 'A', '🇿🇦'), ('Corea del Sur', 'A', '🇰🇷'), ('UEFA Playoff D', 'A', '🏳️'),
('Canadá', 'B', '🇨🇦'), ('Qatar', 'B', '🇶🇦'), ('Suiza', 'B', '🇨🇭'), ('UEFA Playoff A', 'B', '🏳️'),
('Brasil', 'C', '🇧🇷'), ('Marruecos', 'C', '🇲🇦'), ('Haití', 'C', '🇭🇹'), ('Escocia', 'C', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
('Estados Unidos', 'D', '🇺🇸'), ('Paraguay', 'D', '🇵🇾'), ('Australia', 'D', '🇦🇺'), ('UEFA Playoff C', 'D', '🏳️'),
('Alemania', 'E', '🇩🇪'), ('Curazao', 'E', '🇨🇼'), ('Costa de Marfil', 'E', '🇨🇮'), ('Ecuador', 'E', '🇪🇨'),
('Países Bajos', 'F', '🇳🇱'), ('Japón', 'F', '🇯🇵'), ('UEFA Playoff B', 'F', '🏳️'), ('Túnez', 'F', '🇹🇳'),
('Bélgica', 'G', '🇧🇪'), ('Egipto', 'G', '🇪🇬'), ('Irán', 'G', '🇮🇷'), ('Nueva Zelanda', 'G', '🇳🇿'),
('España', 'H', '🇪🇸'), ('Cabo Verde', 'H', '🇨🇻'), ('Arabia Saudita', 'H', '🇸🇦'), ('Uruguay', 'H', '🇺🇾'),
('Francia', 'I', '🇫🇷'), ('Senegal', 'I', '🇸🇳'), ('IC Playoff 2', 'I', '🏳️'), ('Noruega', 'I', '🇳🇴'),
('Argentina', 'J', '🇦🇷'), ('Argelia', 'J', '🇩🇿'), ('Austria', 'J', '🇦🇹'), ('Jordania', 'J', '🇯🇴'),
('Portugal', 'K', '🇵🇹'), ('IC Playoff 1', 'K', '🏳️'), ('Uzbekistán', 'K', '🇺🇿'), ('Colombia', 'K', '🇨🇴'),
('Inglaterra', 'L', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'), ('Croacia', 'L', '🇭🇷'), ('Panamá', 'L', '🇵🇦'), ('Ghana', 'L', '🇬🇭');

insert into group_standings (group_name) values
('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L');

-- Después de crear usuarios en Auth, marcar admin:
-- update profiles set is_admin = true, name = 'Ernesto', avatar_initials = 'EL' where email = 'ernloza@gmail.com';
