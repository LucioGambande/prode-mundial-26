-- ⚠️ Preferí npm run seed:admin (Admin API — hash correcto para login).
--
-- Si igual querés SQL: borrá el usuario y usá Supabase Dashboard →
-- Authentication → Users → Add user (email confirmado).

delete from auth.users where email = 'ernloza@gmail.com';

-- Luego ejecutá: npm run seed:admin
