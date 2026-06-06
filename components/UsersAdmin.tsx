"use client";

import { useActionState } from "react";
import { createUserAction, resetPasswordAction } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, null);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-bold">Crear jugador</h2>
      <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <input name="name" required placeholder="Nombre" className="rounded-lg border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="rounded-lg border px-3 py-2" />
        <input
          name="tempPassword"
          required
          minLength={8}
          placeholder="Contraseña temporal"
          className="rounded-lg border px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-600 px-5 py-2 text-white md:col-span-2 disabled:bg-zinc-300"
        >
          {pending ? "Creando..." : "Crear usuario"}
        </button>
      </form>
      {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">
          <p className="font-semibold">{state.name} creado</p>
          <p>Email: {state.email}</p>
          <p>Contraseña temporal: {state.tempPassword}</p>
        </div>
      )}
    </div>
  );
}

function ResetRow({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  return (
    <tr className="border-t border-zinc-100">
      <td className="px-4 py-3 font-medium">{user.name}</td>
      <td className="px-4 py-3 text-sm text-zinc-600">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs ${user.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100"}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        {user.must_change_password ? "Debe cambiar" : "OK"}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <input
            name="tempPassword"
            required
            minLength={8}
            placeholder="Nueva temp."
            className="w-28 rounded border px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
          >
            Resetear
          </button>
        </form>
        {state?.success && (
          <p className="mt-1 text-xs text-emerald-700">Nueva: {state.tempPassword}</p>
        )}
        {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </td>
    </tr>
  );
}

export default function UsersAdmin({ users }: { users: User[] }) {
  return (
    <div className="space-y-6">
      <CreateUserForm />
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Contraseña</th>
              <th className="px-4 py-3">Reset</th>
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
