"use client";

import { useActionState } from "react";
import { createMatchAction } from "@/lib/actions/game";
import type { MatchPhase, Team } from "@/lib/types";

export default function AdminMatchForm({ teams }: { teams: Team[] }) {
  const [state, formAction, pending] = useActionState(createMatchAction, null);

  return (
    <form action={formAction} className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">Cargar partido</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <select name="homeTeamId" required className="rounded-lg border px-3 py-2">
          <option value="">Local</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <select name="awayTeamId" required className="rounded-lg border px-3 py-2">
          <option value="">Visitante</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <input name="matchDate" type="datetime-local" required className="rounded-lg border px-3 py-2" />
        <select name="phase" defaultValue="group" className="rounded-lg border px-3 py-2">
          <option value="group">Grupos</option>
          <option value="round_of_32">Dieciseisavos</option>
          <option value="round_of_16">Octavos</option>
          <option value="quarter">Cuartos</option>
          <option value="semi">Semis</option>
          <option value="final">Final</option>
        </select>
        <select name="groupName" defaultValue="A" className="rounded-lg border px-3 py-2">
          {"ABCDEFGHIJKL".split("").map((g) => (
            <option key={g} value={g}>
              Grupo {g}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-white disabled:bg-zinc-300"
      >
        {pending ? "Creando..." : "Crear partido"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm text-emerald-700">Partido creado</p>}
    </form>
  );
}
