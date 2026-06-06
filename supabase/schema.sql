-- Prode Mundial 2026 — Auth propio (JWT + bcrypt). Supabase = solo DB, RLS off.

create extension if not exists "pgcrypto";

-- Limpiar schema anterior (si existía Supabase Auth)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

drop table if exists champion_predictions cascade;
drop table if exists third_place_predictions cascade;
drop table if exists bracket_predictions cascade;
drop table if exists predictions cascade;
drop table if exists matches cascade;
drop table if exists group_standings cascade;
drop table if exists tournament_settings cascade;
drop table if exists teams cascade;
drop table if exists profiles cascade;
drop table if exists users cascade;

drop type if exists user_role cascade;
drop type if exists match_phase cascade;
drop type if exists match_status cascade;

create type user_role as enum ('admin', 'player');
create type match_phase as enum (
  'group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'final'
);
create type match_status as enum ('upcoming', 'locked', 'finished');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role user_role not null default 'player',
  must_change_password boolean not null default true,
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
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  home_score int not null check (home_score >= 0),
  away_score int not null check (away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table bracket_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  group_name text not null,
  predicted_first_id uuid not null references teams(id),
  predicted_second_id uuid not null references teams(id),
  unique (user_id, group_name)
);

create table third_place_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  team_ids uuid[] not null,
  unique (user_id)
);

create table champion_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  team_id uuid not null references teams(id),
  unique (user_id)
);

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

-- RLS desactivado: acceso controlado server-side con JWT
alter table users disable row level security;
alter table teams disable row level security;
alter table matches disable row level security;
alter table predictions disable row level security;
alter table bracket_predictions disable row level security;
alter table third_place_predictions disable row level security;
alter table champion_predictions disable row level security;
alter table group_standings disable row level security;
alter table tournament_settings disable row level security;

-- Admin inicial: ernloza@gmail.com / Admin2026!
insert into users (email, name, password_hash, role, must_change_password) values (
  'ernloza@gmail.com',
  'Ernesto',
  '$2b$10$uGUa7WBOwLUOR.yxPHhStei09mTEuJ3IrXht6LHfzCy149YyzVfAG',
  'admin',
  false
);

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
