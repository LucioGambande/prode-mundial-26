"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { MatchPhase, Team } from "@/lib/types";

export default function AdminMatchForm({ teams }: { teams: Team[] }) {
  const supabase = createClient();
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [phase, setPhase] = useState<MatchPhase>("group");
  const [groupName, setGroupName] = useState("A");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createMatch() {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("matches").insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: new Date(matchDate).toISOString(),
      phase,
      group_name: phase === "group" ? groupName : null,
      status: "upcoming",
      decided_by_penalties: false,
    });

    setSaving(false);
    setMessage(error ? error.message : "Partido creado");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">Cargar partido</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2"
        >
          <option value="">Local</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <select
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2"
        >
          <option value="">Visitante</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2"
        />
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value as MatchPhase)}
          className="rounded-lg border border-zinc-200 px-3 py-2"
        >
          <option value="group">Grupos</option>
          <option value="round_of_32">Dieciseisavos</option>
          <option value="round_of_16">Octavos</option>
          <option value="quarter">Cuartos</option>
          <option value="semi">Semis</option>
          <option value="final">Final</option>
        </select>
        {phase === "group" && (
          <select
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2"
          >
            {"ABCDEFGHIJKL".split("").map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={createMatch}
        disabled={saving || !homeTeamId || !awayTeamId || !matchDate}
        className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-white disabled:bg-zinc-300"
      >
        {saving ? "Creando..." : "Crear partido"}
      </button>
      {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
