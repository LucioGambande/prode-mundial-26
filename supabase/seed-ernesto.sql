-- Solo crear/recrear Ernesto (si el schema ya corrió pero users quedó vacío)
-- Email: ernloza@gmail.com | Contraseña: Admin2026!

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

select id, email, name, role, must_change_password from users where email = 'ernloza@gmail.com';
