import Nav from "@/components/Nav";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getCurrentUser } from "@/lib/session";

export default async function CambiarPasswordPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-8">
        <ChangePasswordForm />
      </main>
    </>
  );
}
