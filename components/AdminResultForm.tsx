"use client";

import { useActionState } from "react";
import { saveResultAction } from "@/lib/actions/game";
import type { Match, Team } from "@/lib/types";

export default function AdminResultForm({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const [state, formAction, pending] = useActionState(saveResultAction, null);

  return (
    <form action={formAction} className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">Cargar resultado</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <select name="matchId" required className="rounded-lg border px-3 py-2 md:col-span-2">
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.home_team?.name} vs {match.away_team?.name} ·{" "}
              {new Date(match.match_date).toLocaleString("es-AR")}
            </option>
          ))}
        </select>
        <input name="homeScore" type="number" min={0} required placeholder="Goles local" className="rounded-lg border px-3 py-2" />
        <input name="awayScore" type="number" min={0} required placeholder="Goles visitante" className="rounded-lg border px-3 py-2" />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input name="decidedByPenalties" type="checkbox" />
          Definido por penales
        </label>
        <select name="winnerTeamId" className="rounded-lg border px-3 py-2 md:col-span-2">
          <option value="">Ganador en penales (si aplica)</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending || matches.length === 0}
        className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-white disabled:bg-zinc-300"
      >
        {pending ? "Guardando..." : "Guardar resultado"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm text-emerald-700">Resultado guardado</p>}
    </form>
  );
}
