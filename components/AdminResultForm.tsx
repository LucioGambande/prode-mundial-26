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
    <form action={formAction} className="card">
      <h2 className="card-title">Cargar resultado</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select name="matchId" required className="input md:col-span-2">
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.home_team?.name} vs {match.away_team?.name} ·{" "}
              {new Date(match.match_date).toLocaleString("es-AR")}
            </option>
          ))}
        </select>
        <input name="homeScore" type="number" min={0} required placeholder="Goles local" className="input" />
        <input name="awayScore" type="number" min={0} required placeholder="Goles visitante" className="input" />
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
          <input name="decidedByPenalties" type="checkbox" className="h-4 w-4" />
          Definido por penales
        </label>
        <select name="winnerTeamId" className="input md:col-span-2">
          <option value="">Ganador en penales (si aplica)</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending || matches.length === 0} className="btn-primary mt-4">
        {pending ? "Guardando..." : "Guardar resultado"}
      </button>
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm font-medium text-emerald-700">Resultado guardado</p>}
    </form>
  );
}
