import Nav from "@/components/Nav";
import LeaderboardTable from "@/components/LeaderboardTable";
import PageHeader from "@/components/PageHeader";
import { buildLeaderboard } from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/supabase";

export default async function HomePage() {
  const user = await getCurrentUser();
  const db = getDb();

  const [
    { data: users },
    { data: matches },
    { data: predictions },
    { data: bracketPredictions },
    { data: thirdPlacePredictions },
    { data: championPredictions },
    { data: groupStandings },
    { data: settings },
  ] = await Promise.all([
    db.from("users").select("*").order("name"),
    db.from("matches").select("*"),
    db.from("predictions").select("*"),
    db.from("bracket_predictions").select("*"),
    db.from("third_place_predictions").select("*"),
    db.from("champion_predictions").select("*"),
    db.from("group_standings").select("*"),
    db.from("tournament_settings").select("*").eq("id", 1).single(),
  ]);

  const entries = buildLeaderboard(
    users ?? [],
    matches ?? [],
    predictions ?? [],
    bracketPredictions ?? [],
    thirdPlacePredictions ?? [],
    championPredictions ?? [],
    groupStandings ?? [],
    settings?.actual_third_place_ids ?? [],
    settings?.actual_champion_id ?? null,
  );

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader title="Tabla de posiciones" subtitle="Puntos por partidos, bracket y campeón" />
        <LeaderboardTable entries={entries} />
      </main>
    </>
  );
}
