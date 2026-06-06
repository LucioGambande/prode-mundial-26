import Nav from "@/components/Nav";
import UsersAdmin from "@/components/UsersAdmin";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/supabase";

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser();
  const db = getDb();
  const { data: users } = await db.from("users").select("*").order("name");

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <PageHeader
          title="Usuarios"
          subtitle="Crear jugadores y resetear contraseñas temporales"
        />
        <UsersAdmin users={users ?? []} />
      </main>
    </>
  );
}
