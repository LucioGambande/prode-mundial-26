import Nav from "@/components/Nav";
import MatchCard from "@/components/MatchCard";
import PageHeader from "@/components/PageHeader";
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
        <PageHeader title="Partidos" subtitle="Cargá tus pronósticos hasta 1 hora antes de cada partido" />
        {(matches ?? []).length === 0 ? (
          <p className="card text-zinc-600">Todavía no hay partidos cargados.</p>
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
