import Nav from "@/components/Nav";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
