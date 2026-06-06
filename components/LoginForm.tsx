"use client";

export default function LoginForm({
  redirect,
  error,
}: {
  redirect: string;
  error?: string;
}) {
  return (
    <form
      action="/api/login"
      method="POST"
      className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      <input type="hidden" name="redirect" value={redirect} />
      <h1 className="text-2xl font-bold text-emerald-900">Entrar al prode</h1>
      <p className="mt-2 text-sm text-zinc-500">Email y contraseña</p>

      <div className="mt-6 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Contraseña"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-medium text-white"
      >
        Entrar
      </button>
    </form>
  );
}
