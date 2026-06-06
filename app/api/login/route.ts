import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createToken,
  sessionFromUser,
  verifyPassword,
} from "@/lib/auth";
import { getDb } from "@/lib/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=credenciales", request.url),
    );
  }

  const db = getDb();
  const { data: user, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.redirect(
      new URL("/login?error=credenciales", request.url),
    );
  }

  const session = sessionFromUser(user);
  const token = await createToken(session);

  const dest = user.must_change_password
    ? "/cambiar-password"
    : redirectTo.startsWith("/")
      ? redirectTo
      : "/";

  const response = NextResponse.redirect(new URL(dest, request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
