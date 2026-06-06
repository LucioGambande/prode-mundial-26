"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="card w-full max-w-md">
      <h1 className="page-title text-2xl">Cambiar contraseña</h1>
      <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Es tu primer ingreso. Elegí una contraseña nueva para continuar.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nueva contraseña</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Repetir contraseña</label>
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            placeholder="Repetir contraseña"
            className="input"
          />
        </div>
      </div>

      {state?.error && <p className="alert-error">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
        {pending ? "Guardando..." : "Guardar y continuar"}
      </button>
    </form>
  );
}
