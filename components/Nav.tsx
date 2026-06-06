"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

const links = [
  { href: "/", label: "Posiciones" },
  { href: "/partidos", label: "Partidos" },
  { href: "/bracket", label: "Bracket" },
  { href: "/admin", label: "Admin", admin: true },
  { href: "/admin/usuarios", label: "Usuarios", admin: true },
];

export default function Nav({ user }: { user?: SessionPayload | null }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Prode</p>
          <h1 className="text-lg font-bold">Mundial 2026</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links
            .filter((l) => !l.admin || isAdmin)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  pathname === link.href
                    ? "bg-emerald-400 text-emerald-950"
                    : "text-emerald-100 hover:bg-emerald-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          {user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-emerald-700 px-3 py-1.5 text-sm text-emerald-100 hover:bg-emerald-900"
              >
                {user.name} · Salir
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-emerald-950"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
