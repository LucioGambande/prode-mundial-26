"use server";

import { redirect } from "next/navigation";
import {
  getSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { getDb } from "@/lib/supabase";

export async function logoutAction() {
  const { clearSessionCookie } = await import("@/lib/auth");
  await clearSessionCookie();
  redirect("/login");
}

export async function changePasswordAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Mínimo 8 caracteres" };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden" };
  }

  const db = getDb();
  const { error } = await db
    .from("users")
    .update({
      password_hash: hashPassword(password),
      must_change_password: false,
    })
    .eq("id", session.userId);

  if (error) return { error: error.message };

  await setSessionCookie({ ...session, mustChangePassword: false });
  redirect("/");
}

export async function createUserAction(
  _prev: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Sin permiso" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const tempPassword = String(formData.get("tempPassword") ?? "");

  if (!name || !email || tempPassword.length < 8) {
    return { error: "Completá nombre, email y contraseña (mín. 8 chars)" };
  }

  const db = getDb();
  const { error } = await db.from("users").insert({
    name,
    email,
    password_hash: hashPassword(tempPassword),
    role: "player",
    must_change_password: true,
  });

  if (error) return { error: error.message };
  return { success: true, email, tempPassword, name };
}

export async function resetPasswordAction(
  _prev: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Sin permiso" };
  }

  const userId = String(formData.get("userId") ?? "");
  const tempPassword = String(formData.get("tempPassword") ?? "");

  if (!userId || tempPassword.length < 8) {
    return { error: "Contraseña temporal mínimo 8 caracteres" };
  }

  const db = getDb();
  const { error } = await db
    .from("users")
    .update({
      password_hash: hashPassword(tempPassword),
      must_change_password: true,
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true, tempPassword };
}
