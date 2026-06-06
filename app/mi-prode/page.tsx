import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import PasswordForm from "@/components/PasswordForm";
import { getUserProgress } from "@/lib/user-progress";
import { createClient, getCurrentProfile } from "@/lib/supabase-server";

export default async function MiProdePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !profile) return null;

  const mustChangePassword = Boolean(
    user.user_metadata?.must_change_password,
  );

  const [
    { data: matches },
    { data: predictions },
    { data: bracketPredictions },
    { data: thirdPlacePrediction },
    { data: championPrediction },
  ] = await Promise.all([
    supabase.from("matches").select("*"),
    supabase.from("predictions").select("*").eq("user_id", user.id),
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

  const progress = getUserProgress(
    matches ?? [],
    predictions ?? [],
    bracketPredictions ?? [],
    thirdPlacePrediction,
    championPrediction,
    mustChangePassword,
  );

  return (
    <>
      <Nav userName={profile.name} isAdmin={profile.is_admin} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <UserDashboard
          profileName={profile.name}
          profileEmail={profile.email}
          progress={progress}
        />
        <PasswordForm mustChangePassword={mustChangePassword} />
      </main>
    </>
  );
}
