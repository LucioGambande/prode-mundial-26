import Nav from "@/components/Nav";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminResultForm from "@/components/AdminResultForm";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/supabase";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const [{ data: teams }, { data: matches }] = await Promise.all([
    db.from("teams").select("*").order("name"),
    db
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .order("match_date"),
  ]);

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">Admin — Partidos</h2>
          <p className="text-zinc-600">
            Usuarios en <a href="/admin/usuarios" className="text-emerald-700 underline">/admin/usuarios</a>
          </p>
        </div>
        <AdminMatchForm teams={teams ?? []} />
        <AdminResultForm matches={matches ?? []} teams={teams ?? []} />
      </main>
    </>
  );
}
