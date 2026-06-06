import Nav from "@/components/Nav";
import BracketForm from "@/components/BracketForm";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/supabase";

export default async function BracketPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = getDb();
  const [
    { data: teams },
    { data: bracketPredictions },
    { data: thirdPlacePrediction },
    { data: championPrediction },
  ] = await Promise.all([
    db.from("teams").select("*").order("group").order("name"),
    db.from("bracket_predictions").select("*").eq("user_id", user.userId),
    db.from("third_place_predictions").select("*").eq("user_id", user.userId).maybeSingle(),
    db.from("champion_predictions").select("*").eq("user_id", user.userId).maybeSingle(),
  ]);

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader
          title="Bracket previo"
          subtitle="1° y 2° por grupo, 8 terceros y campeón — se bloquea el 11/06/2026"
        />
        <BracketForm
          teams={teams ?? []}
          bracketPredictions={bracketPredictions ?? []}
          thirdPlacePrediction={thirdPlacePrediction ?? undefined}
          championPrediction={championPrediction ?? undefined}
        />
      </main>
    </>
  );
}
