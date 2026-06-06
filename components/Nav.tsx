"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const links = [
  { href: "/", label: "Posiciones" },
  { href: "/mi-prode", label: "Mi prode", auth: true },
  { href: "/partidos", label: "Partidos", auth: true },
  { href: "/bracket", label: "Bracket", auth: true },
  { href: "/admin", label: "Admin" },
];

export default function Nav({
  userName,
  isAdmin,
}: {
  userName?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Prode
          </p>
          <h1 className="text-lg font-bold">Mundial 2026</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links
            .filter((l) => (!("auth" in l) || userName) && (l.href !== "/admin" || isAdmin))
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
          {userName ? (
            <>
              <Link
                href="/mi-prode"
                className="rounded-full border border-emerald-700 px-3 py-1.5 text-sm text-emerald-100 hover:bg-emerald-900"
              >
                {userName}
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-emerald-700 px-3 py-1.5 text-sm text-emerald-100 hover:bg-emerald-900"
              >
                Salir
              </button>
            </>
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
