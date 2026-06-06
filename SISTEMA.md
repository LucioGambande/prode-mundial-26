# Prode Mundial 2026 — Documentación del sistema

Prode privado para 8 personas: Ernesto (admin) + 7 amigos. Cada uno tiene su usuario y contraseña. La tabla de posiciones es pública; el resto requiere login.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS 4 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Email + contraseña (Supabase Auth) |

---

## Estructura del proyecto

```
prode-mundial-26/
├── app/
│   ├── page.tsx              → Tabla de posiciones (pública)
│   ├── login/page.tsx        → Login
│   ├── mi-prode/page.tsx     → Panel personal del jugador
│   ├── partidos/page.tsx     → Pronósticos de partidos
│   ├── bracket/page.tsx      → Bracket previo al torneo
│   ├── admin/page.tsx        → Panel admin (Ernesto)
│   ├── auth/callback/route.ts
│   └── api/admin/users/route.ts → Crear usuarios (solo admin)
├── components/               → UI reutilizable
├── lib/
│   ├── supabase.ts           → Cliente browser
│   ├── supabase-server.ts    → Cliente server + perfil actual
│   ├── supabase-admin.ts     → Cliente service role (API admin)
│   ├── supabase-middleware.ts
│   ├── scoring.ts            → Cálculo de puntos y locks
│   ├── leaderboard.ts        → Armado de la tabla
│   ├── user-progress.ts      → Progreso del jugador
│   ├── types.ts
│   └── constants.ts
├── middleware.ts             → Protección de rutas
└── supabase/schema.sql       → Schema completo + RLS + seed equipos
```

---

## Páginas y rutas

| Ruta | Acceso | Qué hace |
|------|--------|----------|
| `/` | Público | Tabla de posiciones con desglose de puntos |
| `/login` | Público | Inicio de sesión email/contraseña |
| `/mi-prode` | Logueado | Panel personal, progreso y cambio de contraseña |
| `/partidos` | Logueado | Lista de partidos + formulario inline de pronóstico |
| `/bracket` | Logueado | 1°/2° por grupo, 8 terceros y campeón |
| `/admin` | Solo admin | Crear usuarios, cargar partidos y resultados |

### Rutas protegidas (middleware)

Requieren sesión activa: `/mi-prode`, `/partidos`, `/bracket`, `/admin`.

- Sin login → redirige a `/login?redirect=...`
- `/admin` sin `is_admin` → redirige a `/`
- Contraseña temporal sin cambiar → no puede entrar a `/partidos` ni `/bracket` (va a `/mi-prode`)

---

## Usuarios y roles

### Jugadores previstos

| Nombre | Email (referencia en código) | Rol |
|--------|------------------------------|-----|
| Ernesto | `ernloza@gmail.com` | Admin |
| Santi | placeholder `@prode-mundial.local` | Jugador |
| Diego | placeholder | Jugador |
| Tute | placeholder | Jugador |
| Martín | placeholder | Jugador |
| Dani | placeholder | Jugador |
| Gasti | placeholder | Jugador |
| Ale | placeholder | Jugador |

Los emails placeholder son atajos en el formulario de admin; al crear cada usuario se usa el email real que quieras.

### Flujo de cuentas

1. **Bootstrap de Ernesto (una sola vez):** se crea manualmente en Supabase Auth y se marca `is_admin = true` en SQL.
2. **Resto de usuarios:** Ernesto los crea desde `/admin` → se genera contraseña temporal → se la pasa por WhatsApp.
3. **Primer login del jugador:** entra a `/mi-prode`, cambia la contraseña, y recién ahí puede pronosticar.
4. **Perfil automático:** al crear un usuario en Auth, un trigger crea la fila en `profiles` con nombre, iniciales y email.

---

## Base de datos (Supabase)

Archivo: `supabase/schema.sql`

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de cada jugador (`id`, `email`, `name`, `avatar_initials`, `is_admin`) |
| `teams` | 48 equipos del Mundial 2026 (12 grupos × 4), con emoji de bandera |
| `matches` | Partidos: equipos, fecha, fase, resultado, penales, estado |
| `predictions` | Pronóstico de cada usuario por partido (único por user + match) |
| `bracket_predictions` | 1° y 2° pronosticado por grupo (12 filas por usuario) |
| `third_place_predictions` | 8 equipos terceros pronosticados por usuario |
| `champion_predictions` | Campeón pronosticado por usuario |

### Tablas de resultados oficiales (para puntaje)

| Tabla | Descripción |
|-------|-------------|
| `group_standings` | 1° y 2° real de cada grupo (A–L) |
| `tournament_settings` | 8 terceros clasificados reales + campeón real (fila única `id = 1`) |

> **Nota:** estas tablas existen en la DB y se usan para calcular puntos en la tabla, pero **todavía no tienen pantalla en `/admin`**. Hoy se cargan por SQL directo en Supabase.

### Enums

- **`match_phase`:** `group`, `round_of_32`, `round_of_16`, `quarter`, `semi`, `final`
- **`match_status`:** `upcoming`, `locked`, `finished`

### Campo extra en `matches`

- `winner_team_id`: necesario cuando el partido se define por penales (resultado de regulación empatado).

---

## Seguridad (RLS)

Row Level Security habilitado en todas las tablas.

| Recurso | Lectura | Escritura |
|---------|---------|-----------|
| `profiles`, `teams`, `matches`, pronósticos | Todos (incluso anónimo) | — |
| `predictions`, `bracket_*`, `champion_*` | Todos | Solo el propio usuario, con reglas de bloqueo |
| `matches`, `teams`, `group_standings`, `tournament_settings` | Todos | Solo admin |
| `profiles` | Todos | Cada uno edita el suyo |

Los bloqueos de tiempo se validan también en la DB (`match_is_open()`, `bracket_is_open()`).

---

## Sistema de puntos

Implementado en `lib/scoring.ts` y `lib/leaderboard.ts`.

### Partidos

| Fase | Resultado exacto | Ganador / empate correcto |
|------|------------------|---------------------------|
| Grupos | 3 pts | 1 pt |
| Dieciseisavos (`round_of_32`) | 3 pts | 2 pts |
| Octavos (`round_of_16`) | 4 pts | 2 pts |
| Cuartos | 6 pts | 3 pts |
| Semis | 8 pts | 4 pts |
| Final | 10 pts | 5 pts |

**Reglas especiales:**

- Si acertás el marcador exacto → puntos de exacto (no se suma ganador).
- En **fase de grupos**, empate con penales cuenta como **empate** para el puntaje de ganador.
- En fases eliminatorias, si hay penales, se usa `winner_team_id` para determinar quién ganó.

### Bracket previo

| Concepto | Puntos |
|----------|--------|
| 1° de grupo correcto | 1 pt c/u |
| 2° de grupo correcto | 1 pt c/u |
| Cada tercero clasificado correcto | 1 pt c/u |
| Campeón correcto | 10 pts |

Los puntos de bracket/terceros/campeón se comparan contra `group_standings` y `tournament_settings`.

---

## Reglas de bloqueo

| Qué | Cuándo se bloquea |
|-----|-------------------|
| Pronóstico de partido | 1 hora antes del kickoff (`match_date - 1h`) o si el partido está `locked` / `finished` |
| Bracket (grupos, terceros, campeón) | 11 de junio de 2026, 00:00 ART |

La validación ocurre en frontend, middleware (contraseña) y RLS (tiempo).

---

## Panel Admin (`/admin`)

Solo visible y accesible para `profiles.is_admin = true`.

### 1. Crear usuarios

- Formulario con atajos por nombre (Ernesto, Santi, Diego, etc.).
- Genera contraseña temporal automática.
- Usa `POST /api/admin/users` con la **service role key** (server-side).
- Marca `must_change_password: true` en metadata del usuario.

### 2. Cargar partidos

- Local, visitante, fecha/hora, fase.
- Si es fase de grupos, también el grupo (A–L).

### 3. Cargar resultados

- Goles local / visitante.
- Checkbox “definido por penales”.
- Si hay penales, elegir ganador.

### Pendiente en admin (solo vía SQL hoy)

- Cargar 1°/2° real por grupo → `group_standings`
- Cargar 8 terceros reales y campeón → `tournament_settings`

Ejemplo SQL:

```sql
-- 1° y 2° del grupo A
update group_standings
set first_team_id = 'uuid-equipo', second_team_id = 'uuid-equipo'
where group_name = 'A';

-- Terceros y campeón
update tournament_settings
set
  actual_third_place_ids = array['uuid1','uuid2', ...]::uuid[],
  actual_champion_id = 'uuid-campeon'
where id = 1;
```

---

## Panel del jugador (`/mi-prode`)

- Saludo con nombre y email.
- Barra de progreso del **bracket previo** (grupos + terceros + campeón).
- Barra de progreso de **partidos abiertos** sin pronosticar.
- Formulario para **cambiar contraseña** (obligatorio si es contraseña temporal).
- Links a `/bracket` y `/partidos`.

---

## Variables de entorno

Archivo `.env.local` (desarrollo) o variables en Vercel (producción):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo server — crear usuarios en /admin
```

| Variable | Dónde se usa |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y server (respeta RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/api/admin/users` — bypass RLS, solo en servidor |

**Nunca** commitear keys reales. `.env*` está en `.gitignore`.

Plantilla: `.env.example`

---

## Entornos: local vs producción

La app **no tiene base de datos propia**. Siempre habla con el proyecto Supabase cuyas URLs estén en el `.env`.

| Entorno | Recomendación |
|---------|---------------|
| **Local (`npm run dev`)** | Proyecto Supabase **dev** en `.env.local` |
| **Producción (Vercel)** | Proyecto Supabase **prod** en variables de Vercel |

Mismo código, mismo `schema.sql` en cada proyecto Supabase. Datos separados.

---

## Setup inicial (checklist)

### 1. Supabase

- [ ] Crear proyecto (dev y/o prod).
- [ ] Ejecutar `supabase/schema.sql` en SQL Editor.
- [ ] Authentication → Email → desactivar **Confirm email**.

### 2. Variables locales

- [ ] Copiar URL, anon key y service role key a `.env.local`.

### 3. Bootstrap de Ernesto (una vez)

- [ ] Supabase → Authentication → Add user: `ernloza@gmail.com` + contraseña temporal.
- [ ] SQL:
  ```sql
  update profiles
  set is_admin = true, name = 'Ernesto', avatar_initials = 'EL'
  where email = 'ernloza@gmail.com';
  ```

### 4. Arrancar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000/login`.

### 5. Operación del torneo

1. Ernesto entra → cambia contraseña en `/mi-prode`.
2. Crea usuarios en `/admin` → pasa credenciales a cada amigo.
3. Carga partidos en `/admin`.
4. Cada jugador completa `/bracket` (antes del 11/06) y `/partidos`.
5. Ernesto carga resultados en `/admin` a medida que se juegan.
6. Todos miran `/` para la tabla.

---

## Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

---

## Equipos precargados

El schema incluye los **48 equipos** del Mundial 2026 en **12 grupos (A–L)**, con nombre y emoji de bandera. Incluye placeholders para playoffs (🏳️) donde el cuadro aún no estaba definido al armar el seed.

---

## Lo que el sistema **no** tiene (todavía)

- Registro público (signup): solo admin crea usuarios.
- Multi-torneo: es un único prode del Mundial 2026.
- UI admin para `group_standings` y `tournament_settings`.
- Recuperación de contraseña por email (se puede activar en Supabase Auth).
- Notificaciones push / emails de recordatorio.

---

## Resumen en una frase

**Prode privado del Mundial 2026:** cada amigo tiene su cuenta, pronostica partidos y bracket, Ernesto administra usuarios y resultados, y la tabla de posiciones suma todo automáticamente con las reglas de puntos definidas.
