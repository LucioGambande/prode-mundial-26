"use client";

import { useActionState } from "react";
import { createUserAction, resetPasswordAction } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, null);

  return (
    <div className="card">
      <h2 className="card-title">Crear jugador</h2>
      <p className="mt-1 text-sm text-zinc-600">
        El jugador deberá cambiar la contraseña en su primer ingreso.
      </p>
      <form action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input name="name" required placeholder="Nombre" className="input" />
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input
          name="tempPassword"
          required
          minLength={8}
          placeholder="Contraseña temporal (mín. 8 caracteres)"
          className="input md:col-span-2"
        />
        <button type="submit" disabled={pending} className="btn-primary md:col-span-2">
          {pending ? "Creando..." : "Crear usuario"}
        </button>
      </form>
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && (
        <div className="alert-success">
          <p className="font-semibold">{state.name} creado correctamente</p>
          <p className="mt-1">Email: {state.email}</p>
          <p>Contraseña temporal: <strong>{state.tempPassword}</strong></p>
        </div>
      )}
    </div>
  );
}

function ResetRow({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  return (
    <tr>
      <td className="font-semibold text-zinc-900">{user.name}</td>
      <td>{user.email}</td>
      <td>
        <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-player"}`}>
          {user.role}
        </span>
      </td>
      <td>
        <span className={`badge ${user.must_change_password ? "badge-warn" : "badge-ok"}`}>
          {user.must_change_password ? "Debe cambiar" : "OK"}
        </span>
      </td>
      <td>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <input
            name="tempPassword"
            required
            minLength={8}
            placeholder="Nueva temp."
            className="input input-sm w-36"
          />
          <button type="submit" disabled={pending} className="btn-secondary">
            {pending ? "..." : "Resetear"}
          </button>
        </form>
        {state?.success && (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            Nueva contraseña: {state.tempPassword}
          </p>
        )}
        {state?.error && <p className="alert-error mt-2">{state.error}</p>}
      </td>
    </tr>
  );
}

export default function UsersAdmin({ users }: { users: User[] }) {
  return (
    <div className="space-y-6">
      <CreateUserForm />
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Contraseña</th>
              <th>Reset</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <ResetRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
