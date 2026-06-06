"use client";

import { useActionState } from "react";
import { createMatchAction } from "@/lib/actions/game";
import type { Team } from "@/lib/types";

export default function AdminMatchForm({ teams }: { teams: Team[] }) {
  const [state, formAction, pending] = useActionState(createMatchAction, null);

  return (
    <form action={formAction} className="card">
      <h2 className="card-title">Cargar partido</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select name="homeTeamId" required className="input">
          <option value="">Local</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <select name="awayTeamId" required className="input">
          <option value="">Visitante</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <input name="matchDate" type="datetime-local" required className="input" />
        <select name="phase" defaultValue="group" className="input">
          <option value="group">Grupos</option>
          <option value="round_of_32">Dieciseisavos</option>
          <option value="round_of_16">Octavos</option>
          <option value="quarter">Cuartos</option>
          <option value="semi">Semis</option>
          <option value="final">Final</option>
        </select>
        <select name="groupName" defaultValue="A" className="input">
          {"ABCDEFGHIJKL".split("").map((g) => (
            <option key={g} value={g}>
              Grupo {g}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="btn-primary mt-4">
        {pending ? "Creando..." : "Crear partido"}
      </button>
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm font-medium text-emerald-700">Partido creado</p>}
    </form>
  );
}
