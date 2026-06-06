import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PASSWORD = "Admin2026!";

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const hash = bcrypt.hashSync(PASSWORD, 10);

const res = await fetch(`${url}/rest/v1/users`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  },
  body: JSON.stringify({
    email: "ernloza@gmail.com",
    name: "Ernesto",
    password_hash: hash,
    role: "admin",
    must_change_password: false,
  }),
});

if (!res.ok) {
  // upsert via patch if exists
  const check = await fetch(
    `${url}/rest/v1/users?email=eq.ernloza@gmail.com&select=id`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const rows = await check.json();
  if (rows[0]?.id) {
    const patch = await fetch(`${url}/rest/v1/users?id=eq.${rows[0].id}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ernesto",
        password_hash: hash,
        role: "admin",
        must_change_password: false,
      }),
    });
    if (!patch.ok) {
      console.error(await patch.text());
      process.exit(1);
    }
  } else {
    console.error(await res.text());
    process.exit(1);
  }
}

console.log("Ernesto listo.");
console.log("Email: ernloza@gmail.com");
console.log("Contraseña:", PASSWORD);
