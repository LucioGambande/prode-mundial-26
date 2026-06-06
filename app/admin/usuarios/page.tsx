import Nav from "@/components/Nav";
import UsersAdmin from "@/components/UsersAdmin";
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
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">Usuarios</h2>
          <p className="text-zinc-600">Crear jugadores y resetear contraseñas temporales</p>
        </div>
        <UsersAdmin users={users ?? []} />
      </main>
    </>
  );
}
