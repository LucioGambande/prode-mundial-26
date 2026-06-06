import Nav from "@/components/Nav";
import LeaderboardTable from "@/components/LeaderboardTable";
import { buildLeaderboard } from "@/lib/leaderboard";
import { createClient, getCurrentProfile } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [
    { data: profiles },
    { data: matches },
    { data: predictions },
    { data: bracketPredictions },
    { data: thirdPlacePredictions },
    { data: championPredictions },
    { data: groupStandings },
    { data: settings },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("name"),
    supabase.from("matches").select("*"),
    supabase.from("predictions").select("*"),
    supabase.from("bracket_predictions").select("*"),
    supabase.from("third_place_predictions").select("*"),
    supabase.from("champion_predictions").select("*"),
    supabase.from("group_standings").select("*"),
    supabase.from("tournament_settings").select("*").eq("id", 1).single(),
  ]);

  const entries = buildLeaderboard(
    profiles ?? [],
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
      <Nav userName={profile?.name} isAdmin={profile?.is_admin} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-emerald-950">Tabla de posiciones</h2>
          <p className="text-zinc-600">Pública · se actualiza con cada resultado</p>
        </div>
        <LeaderboardTable entries={entries} />
      </main>
    </>
  );
}
