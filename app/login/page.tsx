import Nav from "@/components/Nav";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const error =
    params.error === "credenciales" ? "Email o contraseña incorrectos" : undefined;

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-8">
        <LoginForm redirect={params.redirect ?? "/"} error={error} />
      </main>
    </>
  );
}
