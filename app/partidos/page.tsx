import Nav from "@/components/Nav";
import MatchCard from "@/components/MatchCard";
import { createClient, getCurrentProfile } from "@/lib/supabase-server";

export default async function PartidosPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .order("match_date"),
    user
      ? supabase.from("predictions").select("*").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <>
      <Nav userName={profile?.name} isAdmin={profile?.is_admin} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-emerald-950">Partidos</h2>
          <p className="text-zinc-600">Pronosticá antes de 1 hora del kickoff</p>
        </div>
        {(matches ?? []).length === 0 ? (
          <p className="rounded-xl bg-zinc-100 px-4 py-6 text-zinc-600">
            Todavía no hay partidos cargados.
          </p>
        ) : (
          (matches ?? []).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={(predictions ?? []).find((p) => p.match_id === match.id)}
              userId={user?.id}
            />
          ))
        )}
      </main>
    </>
  );
}
