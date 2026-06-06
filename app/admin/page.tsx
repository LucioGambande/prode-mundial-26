import Nav from "@/components/Nav";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminResultForm from "@/components/AdminResultForm";
import AdminUsersForm from "@/components/AdminUsersForm";
import { createClient, getCurrentProfile } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .order("match_date"),
  ]);

  return (
    <>
      <Nav userName={profile?.name} isAdmin={profile?.is_admin} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">Admin</h2>
          <p className="text-zinc-600">
            Crear usuarios, cargar partidos y resultados oficiales
          </p>
        </div>
        <AdminUsersForm />
        <AdminMatchForm teams={teams ?? []} />
        <AdminResultForm matches={matches ?? []} teams={teams ?? []} />
      </main>
    </>
  );
}
