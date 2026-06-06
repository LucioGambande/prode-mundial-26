/**
 * Crea/recrea el admin Ernesto con contraseña válida para Supabase Auth.
 * Uso: npm run seed:admin
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EMAIL = "ernloza@gmail.com";
const PASSWORD = "DulceErnu";

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  console.error("Guardá el .env con las 3 variables y volvé a ejecutar.");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function adminFetch(path, options = {}) {
  const res = await fetch(`${url}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.msg || data?.message || data?.error_description || text || res.statusText;
    throw new Error(msg);
  }
  return data;
}

async function findUserByEmail(email) {
  try {
    let page = 1;
    while (true) {
      const data = await adminFetch(`/auth/v1/admin/users?page=${page}&per_page=1000`);
      const users = data.users ?? [];
      const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (user) return user;
      if (users.length < 1000) return null;
      page += 1;
    }
  } catch {
    console.warn("No se pudo listar usuarios (Auth puede estar sucio). Intentando crear igual...");
    return null;
  }
}

async function main() {
  const existing = await findUserByEmail(EMAIL);
  if (existing) {
    console.log("Borrando usuario existente:", existing.id);
    await adminFetch(`/auth/v1/admin/users/${existing.id}`, { method: "DELETE" });
  }

  console.log("Creando admin...");
  const created = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: "Ernesto",
        avatar_initials: "EL",
        is_admin: true,
        must_change_password: false,
      },
    }),
  });

  const userId = created.id ?? created.user?.id;
  if (!userId) throw new Error("No se devolvió user id");

  await adminFetch(`/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      is_admin: true,
      name: "Ernesto",
      avatar_initials: "EL",
    }),
  });

  console.log("Listo.");
  console.log("Email:", EMAIL);
  console.log("Contraseña:", PASSWORD);
  console.log("User ID:", userId);
  console.log("Entrá en /login con esas credenciales.");
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
