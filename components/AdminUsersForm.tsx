"use client";

import { useState } from "react";
import { SEED_USERS } from "@/lib/constants";

interface CreatedUser {
  email: string;
  tempPassword: string;
  name: string;
}

export default function AdminUsersForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  function fillPreset(user: (typeof SEED_USERS)[number]) {
    setName(user.name);
    setEmail(user.email);
    setInitials(user.initials);
    setTempPassword(generatePassword());
    setCreated(null);
    setError(null);
    setMessage(null);
  }

  function generatePassword() {
    return `Prode${Math.random().toString(36).slice(2, 8)}!`;
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    setCreated(null);

    const password = tempPassword || generatePassword();

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        initials: initials.toUpperCase().slice(0, 3),
        tempPassword: password,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el usuario");
      return;
    }

    setCreated({ email, tempPassword: password, name });
    setMessage(`Usuario creado: ${name}. Pasale estos datos por WhatsApp.`);
    setName("");
    setEmail("");
    setInitials("");
    setTempPassword("");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-bold">Crear usuarios</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Cada amigo recibe email + contraseña temporal. Al entrar, la cambia desde Mi prode.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SEED_USERS.map((user) => (
          <button
            key={user.email}
            type="button"
            onClick={() => fillPreset(user)}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50"
          >
            {user.name}
          </button>
        ))}
      </div>

      <form onSubmit={createUser} className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          required
          maxLength={3}
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase())}
          placeholder="Iniciales (EL)"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          placeholder="Contraseña temporal (opcional)"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <button
          type="button"
          onClick={() => setTempPassword(generatePassword())}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm md:col-span-2"
        >
          Generar contraseña temporal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-emerald-600 px-5 py-2 text-white disabled:bg-zinc-300 md:col-span-2"
        >
          {saving ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}

      {created && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Datos para {created.name}</p>
          <p className="mt-2">Email: {created.email}</p>
          <p>Contraseña temporal: {created.tempPassword}</p>
          <p className="mt-2 text-xs">
            Al primer login verá el aviso para cambiarla en Mi prode.
          </p>
        </div>
      )}
    </div>
  );
}
