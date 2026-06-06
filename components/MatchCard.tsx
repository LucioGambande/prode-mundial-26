"use client";

import { useState } from "react";
import { savePredictionAction } from "@/lib/actions/game";
import { isMatchLocked } from "@/lib/scoring";
import type { Match, Prediction, Team } from "@/lib/types";

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input input-sm w-16 text-center font-bold"
    />
  );
}

export default function MatchCard({
  match,
  prediction,
}: {
  match: Match;
  prediction?: Prediction;
}) {
  const locked = isMatchLocked(match.match_date, match.status);
  const finished = match.status === "finished";

  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const home = match.home_team as Team | undefined;
  const away = match.away_team as Team | undefined;

  async function save() {
    if (locked) return;
    setSaving(true);
    setMessage(null);
    const result = await savePredictionAction(match.id, homeScore, awayScore);
    setSaving(false);
    setMessage(result.error ?? "Guardado");
  }

  return (
    <article className="card">
      <div className="mb-4 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <span>{match.phase.replaceAll("_", " ")}</span>
        <span>{new Date(match.match_date).toLocaleString("es-AR")}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-right">
          <p className="text-3xl">{home?.flag_emoji}</p>
          <p className="mt-1 font-semibold text-zinc-900">{home?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {finished ? (
            <p className="text-3xl font-bold text-zinc-900">
              {match.home_score} - {match.away_score}
            </p>
          ) : (
            <>
              <ScoreInput value={homeScore} onChange={setHomeScore} disabled={locked || saving} />
              <span className="text-xl font-bold text-zinc-400">:</span>
              <ScoreInput value={awayScore} onChange={setAwayScore} disabled={locked || saving} />
            </>
          )}
        </div>

        <div>
          <p className="text-3xl">{away?.flag_emoji}</p>
          <p className="mt-1 font-semibold text-zinc-900">{away?.name}</p>
        </div>
      </div>

      {!finished && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
          <p className="text-sm text-zinc-600">
            {locked ? "Bloqueado" : "Editable hasta 1h antes del partido"}
          </p>
          <button onClick={save} disabled={locked || saving} className="btn-primary">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${message === "Guardado" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </article>
  );
}
