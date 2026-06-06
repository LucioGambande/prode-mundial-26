"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
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
      className="w-14 rounded-lg border border-zinc-200 px-2 py-2 text-center font-bold disabled:bg-zinc-100"
    />
  );
}

export default function MatchCard({
  match,
  prediction,
  userId,
}: {
  match: Match;
  prediction?: Prediction;
  userId?: string;
}) {
  const supabase = createClient();
  const locked = isMatchLocked(match.match_date, match.status);
  const finished = match.status === "finished";

  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const home = match.home_team as Team | undefined;
  const away = match.away_team as Team | undefined;

  async function save() {
    if (!userId || locked) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      user_id: userId,
      match_id: match.id,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString(),
    };

    const { error } = prediction
      ? await supabase
          .from("predictions")
          .update(payload)
          .eq("id", prediction.id)
      : await supabase.from("predictions").insert(payload);

    setSaving(false);
    setMessage(error ? error.message : "Guardado");
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-zinc-500">
        <span>{match.phase.replaceAll("_", " ")}</span>
        <span>{new Date(match.match_date).toLocaleString("es-AR")}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right">
          <p className="text-2xl">{home?.flag_emoji}</p>
          <p className="font-semibold">{home?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {finished ? (
            <p className="text-2xl font-bold">
              {match.home_score} - {match.away_score}
            </p>
          ) : userId ? (
            <>
              <ScoreInput
                value={homeScore}
                onChange={setHomeScore}
                disabled={locked || saving}
              />
              <span className="font-bold text-zinc-400">:</span>
              <ScoreInput
                value={awayScore}
                onChange={setAwayScore}
                disabled={locked || saving}
              />
            </>
          ) : (
            <p className="text-sm text-zinc-500">Iniciá sesión para pronosticar</p>
          )}
        </div>

        <div>
          <p className="text-2xl">{away?.flag_emoji}</p>
          <p className="font-semibold">{away?.name}</p>
        </div>
      </div>

      {userId && !finished && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {locked ? "Bloqueado" : "Editable hasta 1h antes del partido"}
          </p>
          <button
            onClick={save}
            disabled={locked || saving}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-300"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}

      {message && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
    </article>
  );
}
