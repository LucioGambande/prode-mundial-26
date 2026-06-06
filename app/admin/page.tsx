import Nav from "@/components/Nav";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminResultForm from "@/components/AdminResultForm";
import PageHeader from "@/components/PageHeader";
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
        <PageHeader
          title="Admin — Partidos"
          subtitle="Cargar fixtures y resultados oficiales"
        >
          <a href="/admin/usuarios" className="btn-secondary">
            Gestionar usuarios
          </a>
        </PageHeader>
        <AdminMatchForm teams={teams ?? []} />
        <AdminResultForm matches={matches ?? []} teams={teams ?? []} />
      </main>
    </>
  );
}
