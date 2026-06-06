import Nav from "@/components/Nav";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-8">
        <LoginForm redirect={params.redirect ?? "/"} />
      </main>
    </>
  );
}
