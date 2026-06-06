"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Match, Team } from "@/lib/types";

export default function AdminResultForm({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const supabase = createClient();
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const selected = matches.find((m) => m.id === matchId);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [decidedByPenalties, setDecidedByPenalties] = useState(false);
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveResult() {
    if (!matchId) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        decided_by_penalties: decidedByPenalties,
        winner_team_id: decidedByPenalties ? winnerTeamId || null : null,
        status: "finished",
      })
      .eq("id", matchId);

    setSaving(false);
    setMessage(error ? error.message : "Resultado guardado");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">Cargar resultado</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 md:col-span-2"
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.home_team?.name} vs {match.away_team?.name} ·{" "}
              {new Date(match.match_date).toLocaleString("es-AR")}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) => setHomeScore(Number(e.target.value))}
          className="rounded-lg border border-zinc-200 px-3 py-2"
          placeholder="Goles local"
        />
        <input
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) => setAwayScore(Number(e.target.value))}
          className="rounded-lg border border-zinc-200 px-3 py-2"
          placeholder="Goles visitante"
        />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={decidedByPenalties}
            onChange={(e) => setDecidedByPenalties(e.target.checked)}
          />
          Definido por penales
        </label>
        {decidedByPenalties && selected && (
          <select
            value={winnerTeamId}
            onChange={(e) => setWinnerTeamId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 md:col-span-2"
          >
            <option value="">Ganador en penales</option>
            {[selected.home_team_id, selected.away_team_id].map((id) => {
              const team = teams.find((t) => t.id === id);
              return (
                <option key={id} value={id}>
                  {team?.flag_emoji} {team?.name}
                </option>
              );
            })}
          </select>
        )}
      </div>
      <button
        onClick={saveResult}
        disabled={saving || !matchId}
        className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-white disabled:bg-zinc-300"
      >
        {saving ? "Guardando..." : "Guardar resultado"}
      </button>
      {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
