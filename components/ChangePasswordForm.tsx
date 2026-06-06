"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-2xl font-bold text-emerald-900">Cambiar contraseña</h1>
      <p className="mt-2 text-sm text-amber-700">
        Tenés que elegir una contraseña nueva antes de continuar.
      </p>

      <div className="mt-6 space-y-4">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Nueva contraseña (mín. 8)"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          placeholder="Repetir contraseña"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2"
        />
      </div>

      {state?.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-medium text-white disabled:bg-zinc-300"
      >
        {pending ? "Guardando..." : "Guardar y continuar"}
      </button>
    </form>
  );
}
