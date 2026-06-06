-- Fix urgente: desactivar RLS + crear Ernesto
-- Pegar en Supabase → SQL Editor → Run

alter table if exists users disable row level security;
alter table if exists teams disable row level security;
alter table if exists matches disable row level security;
alter table if exists predictions disable row level security;
alter table if exists bracket_predictions disable row level security;
alter table if exists third_place_predictions disable row level security;
alter table if exists champion_predictions disable row level security;
alter table if exists group_standings disable row level security;
alter table if exists tournament_settings disable row level security;

insert into users (email, name, password_hash, role, must_change_password) values (
  'ernloza@gmail.com',
  'Ernesto',
  '$2b$10$IwF3U0kwKFhQ1hk3MVSyleJuhvubUv5AIoD9xZf1AzndhGaABtADG',
  'admin',
  false
)
on conflict (email) do update set
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  must_change_password = excluded.must_change_password;

select id, email, name, role from users where email = 'ernloza@gmail.com';
