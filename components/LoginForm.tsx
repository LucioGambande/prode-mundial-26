"use client";

export default function LoginForm({
  redirect,
  error,
}: {
  redirect: string;
  error?: string;
}) {
  return (
    <form action="/api/login" method="POST" className="card w-full max-w-md">
      <input type="hidden" name="redirect" value={redirect} />
      <h1 className="page-title text-2xl">Entrar al prode</h1>
      <p className="page-subtitle">Ingresá con tu email y contraseña</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
          <input name="email" type="email" required placeholder="tu@email.com" className="input" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Contraseña</label>
          <input name="password" type="password" required placeholder="••••••••" className="input" />
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <button type="submit" className="btn-primary mt-6 w-full">
        Entrar
      </button>
    </form>
  );
}
