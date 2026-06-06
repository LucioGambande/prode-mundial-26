import Nav from "@/components/Nav";
import MatchCard from "@/components/MatchCard";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/supabase";

export default async function PartidosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = getDb();
  const [{ data: matches }, { data: predictions }] = await Promise.all([
    db
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .order("match_date"),
    db.from("predictions").select("*").eq("user_id", user.userId),
  ]);

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <h2 className="text-3xl font-bold text-emerald-950">Partidos</h2>
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
            />
          ))
        )}
      </main>
    </>
  );
}
