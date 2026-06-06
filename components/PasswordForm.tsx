"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function PasswordForm({
  mustChangePassword,
}: {
  mustChangePassword?: boolean;
}) {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirm("");
    setMessage("Contraseña actualizada.");
    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="text-lg font-bold text-emerald-950">Tu contraseña</h2>
      {mustChangePassword ? (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Es tu primer ingreso con contraseña temporal. Cambiala antes de seguir.
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">
          Podés cambiarla cuando quieras.
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repetir contraseña"
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:bg-zinc-300"
      >
        {saving ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}
