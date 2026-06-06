"use client";

import { useMemo, useState } from "react";
import { saveBracketAction } from "@/lib/actions/game";
import { GROUPS, THIRD_PLACE_COUNT } from "@/lib/constants";
import { isBracketLocked } from "@/lib/scoring";
import type {
  BracketPrediction,
  ChampionPrediction,
  Team,
  ThirdPlacePrediction,
} from "@/lib/types";

export default function BracketForm({
  teams,
  bracketPredictions,
  thirdPlacePrediction,
  championPrediction,
}: {
  teams: Team[];
  bracketPredictions: BracketPrediction[];
  thirdPlacePrediction?: ThirdPlacePrediction;
  championPrediction?: ChampionPrediction;
}) {
  const locked = isBracketLocked();

  const teamsByGroup = useMemo(() => {
    const map = new Map<string, Team[]>();
    for (const group of GROUPS) {
      map.set(
        group,
        teams.filter((t) => t.group === group).sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
    return map;
  }, [teams]);

  const [groupPicks, setGroupPicks] = useState<Record<string, { first: string; second: string }>>(
    () => {
      const initial: Record<string, { first: string; second: string }> = {};
      for (const group of GROUPS) {
        const existing = bracketPredictions.find((b) => b.group_name === group);
        initial[group] = {
          first: existing?.predicted_first_id ?? "",
          second: existing?.predicted_second_id ?? "",
        };
      }
      return initial;
    },
  );

  const [thirdIds, setThirdIds] = useState<string[]>(
    thirdPlacePrediction?.team_ids ?? [],
  );
  const [championId, setChampionId] = useState(
    championPrediction?.team_id ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleThird(teamId: string) {
    if (locked) return;
    setThirdIds((current) => {
      if (current.includes(teamId)) return current.filter((id) => id !== teamId);
      if (current.length >= THIRD_PLACE_COUNT) return current;
      return [...current, teamId];
    });
  }

  async function save() {
    if (locked) return;
    setSaving(true);
    setMessage(null);

    for (const group of GROUPS) {
      const pick = groupPicks[group];
      if (!pick.first || !pick.second || pick.first === pick.second) {
        setSaving(false);
        setMessage(`Completá 1° y 2° del grupo ${group}`);
        return;
      }
    }

    if (thirdIds.length !== THIRD_PLACE_COUNT) {
      setSaving(false);
      setMessage(`Elegí exactamente ${THIRD_PLACE_COUNT} terceros`);
      return;
    }

    if (!championId) {
      setSaving(false);
      setMessage("Elegí un campeón");
      return;
    }

    const result = await saveBracketAction({ groupPicks, thirdIds, championId });
    setSaving(false);
    setMessage(result.error ?? "Bracket guardado");
  }

  return (
    <div className="space-y-8">
      {locked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          El bracket se bloqueó el 11 de junio de 2026.
        </div>
      )}

      <section className="space-y-4">
        <h2 className="card-title text-xl">1° y 2° por grupo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group} className="card !p-4">
              <h3 className="mb-3 font-semibold text-zinc-900">Grupo {group}</h3>
              <div className="space-y-3">
                <select
                  disabled={locked}
                  value={groupPicks[group].first}
                  onChange={(e) =>
                    setGroupPicks((prev) => ({
                      ...prev,
                      [group]: { ...prev[group], first: e.target.value },
                    }))
                  }
                  className="input"
                >
                  <option value="">1° puesto...</option>
                  {teamsByGroup.get(group)?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.flag_emoji} {team.name}
                    </option>
                  ))}
                </select>
                <select
                  disabled={locked}
                  value={groupPicks[group].second}
                  onChange={(e) =>
                    setGroupPicks((prev) => ({
                      ...prev,
                      [group]: { ...prev[group], second: e.target.value },
                    }))
                  }
                  className="input"
                >
                  <option value="">2° puesto...</option>
                  {teamsByGroup.get(group)?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.flag_emoji} {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="card-title text-xl">
          8 terceros ({thirdIds.length}/{THIRD_PLACE_COUNT})
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              disabled={locked}
              onClick={() => toggleThird(team.id)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                thirdIds.includes(team.id)
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                  : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              {team.flag_emoji} {team.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="card-title text-xl">Campeón (+10 pts)</h2>
        <select
          disabled={locked}
          value={championId}
          onChange={(e) => setChampionId(e.target.value)}
          className="input max-w-md"
        >
          <option value="">Elegir campeón...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.flag_emoji} {team.name}
            </option>
          ))}
        </select>
      </section>

      <button
        onClick={save}
        disabled={locked || saving}
        className="btn-primary"
      >
        {saving ? "Guardando..." : "Guardar bracket"}
      </button>
      {message && (
        <p className={`text-sm font-medium ${message === "Bracket guardado" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
