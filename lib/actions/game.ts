"use server";

import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/supabase";
import { isMatchLocked } from "@/lib/scoring";

export async function savePredictionAction(
  matchId: string,
  homeScore: number,
  awayScore: number,
) {
  const session = await getSession();
  if (!session) return { error: "No autenticado" };

  const db = getDb();
  const { data: match } = await db.from("matches").select("*").eq("id", matchId).single();
  if (!match) return { error: "Partido no encontrado" };
  if (isMatchLocked(match.match_date, match.status)) {
    return { error: "Partido bloqueado" };
  }

  const payload = {
    user_id: session.userId,
    match_id: matchId,
    home_score: homeScore,
    away_score: awayScore,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await db
    .from("predictions")
    .select("id")
    .eq("user_id", session.userId)
    .eq("match_id", matchId)
    .maybeSingle();

  const { error } = existing
    ? await db.from("predictions").update(payload).eq("id", existing.id)
    : await db.from("predictions").insert(payload);

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveBracketAction(data: {
  groupPicks: Record<string, { first: string; second: string }>;
  thirdIds: string[];
  championId: string;
}) {
  const session = await getSession();
  if (!session) return { error: "No autenticado" };

  const db = getDb();
  for (const [group_name, pick] of Object.entries(data.groupPicks)) {
    const payload = {
      user_id: session.userId,
      group_name,
      predicted_first_id: pick.first,
      predicted_second_id: pick.second,
    };
    const { data: existing } = await db
      .from("bracket_predictions")
      .select("id")
      .eq("user_id", session.userId)
      .eq("group_name", group_name)
      .maybeSingle();

    const { error } = existing
      ? await db.from("bracket_predictions").update(payload).eq("id", existing.id)
      : await db.from("bracket_predictions").insert(payload);

    if (error) return { error: error.message };
  }

  const thirdPayload = { user_id: session.userId, team_ids: data.thirdIds };
  const { data: third } = await db
    .from("third_place_predictions")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  const { error: thirdError } = third
    ? await db.from("third_place_predictions").update(thirdPayload).eq("id", third.id)
    : await db.from("third_place_predictions").insert(thirdPayload);

  if (thirdError) return { error: thirdError.message };

  const champPayload = { user_id: session.userId, team_id: data.championId };
  const { data: champ } = await db
    .from("champion_predictions")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  const { error: champError } = champ
    ? await db.from("champion_predictions").update(champPayload).eq("id", champ.id)
    : await db.from("champion_predictions").insert(champPayload);

  if (champError) return { error: champError.message };
  return { success: true };
}

export async function createMatchAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Sin permiso" };

  const db = getDb();
  const phase = String(formData.get("phase"));
  const { error } = await db.from("matches").insert({
    home_team_id: String(formData.get("homeTeamId")),
    away_team_id: String(formData.get("awayTeamId")),
    match_date: new Date(String(formData.get("matchDate"))).toISOString(),
    phase,
    group_name: phase === "group" ? String(formData.get("groupName")) : null,
    status: "upcoming",
    decided_by_penalties: false,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveResultAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Sin permiso" };

  const db = getDb();
  const decidedByPenalties = formData.get("decidedByPenalties") === "on";
  const { error } = await db
    .from("matches")
    .update({
      home_score: Number(formData.get("homeScore")),
      away_score: Number(formData.get("awayScore")),
      decided_by_penalties: decidedByPenalties,
      winner_team_id: decidedByPenalties ? String(formData.get("winnerTeamId")) || null : null,
      status: "finished",
    })
    .eq("id", String(formData.get("matchId")));

  if (error) return { error: error.message };
  return { success: true };
}
