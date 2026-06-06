-- Reparar Auth + limpiar usuario roto de Ernesto
-- Ejecutar en Supabase → SQL Editor (en este orden)

-- 1. Limpiar usuario roto (si existe)
delete from auth.identities
where user_id in (select id from auth.users where email = 'ernloza@gmail.com');

delete from auth.users where email = 'ernloza@gmail.com';

delete from public.profiles where email = 'ernloza@gmail.com';

-- 2. Trigger más robusto (recrear)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_initials, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_initials', upper(left(split_part(new.email, '@', 1), 2))),
    case
      when new.raw_user_meta_data->>'is_admin' in ('true', 't', '1') then true
      else false
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar_initials = excluded.avatar_initials,
    is_admin = excluded.is_admin;

  return new;
end;
$$;

-- 3. Después de esto NO uses SQL para crear usuarios.
--    En tu Mac, con .env guardado:
--    npm run seed:admin
--
--    O Supabase Dashboard → Authentication → Users → Add user
--    Email: ernloza@gmail.com | Password: DulceErnu | Auto Confirm ✓
--    Luego:
--    update profiles set is_admin = true, name = 'Ernesto', avatar_initials = 'EL'
--    where email = 'ernloza@gmail.com';
