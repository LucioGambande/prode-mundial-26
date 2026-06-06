"use client";

import { useEffect, useState } from "react";
import type { SessionPayload } from "@/lib/auth";

export function useUser() {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    isAdmin: user?.role === "admin",
    loading,
  };
}
