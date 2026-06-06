import Nav from "@/components/Nav";
import BracketForm from "@/components/BracketForm";
import { createClient, getCurrentProfile } from "@/lib/supabase-server";

export default async function BracketPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: teams },
    { data: bracketPredictions },
    { data: thirdPlacePrediction },
    { data: championPrediction },
  ] = await Promise.all([
    supabase.from("teams").select("*").order("group").order("name"),
    supabase.from("bracket_predictions").select("*").eq("user_id", user.id),
    supabase
      .from("third_place_predictions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("champion_predictions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <>
      <Nav userName={profile?.name} isAdmin={profile?.is_admin} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-emerald-950">Bracket previo</h2>
          <p className="text-zinc-600">
            1°/2° de cada grupo, 8 terceros y campeón · se bloquea el 11/06/2026
          </p>
        </div>
        <BracketForm
          teams={teams ?? []}
          userId={user.id}
          bracketPredictions={bracketPredictions ?? []}
          thirdPlacePrediction={thirdPlacePrediction ?? undefined}
          championPrediction={championPrediction ?? undefined}
        />
      </main>
    </>
  );
}
