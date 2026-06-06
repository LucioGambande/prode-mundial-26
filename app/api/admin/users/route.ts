import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  }

  return { user };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  let body: {
    name?: string;
    email?: string;
    initials?: string;
    tempPassword?: string;
    isAdmin?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { name, email, initials, tempPassword, isAdmin = false } = body;

  if (!name || !email || !initials || !tempPassword) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (tempPassword.length < 8) {
    return NextResponse.json(
      { error: "La contraseña temporal debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name,
        avatar_initials: initials,
        is_admin: isAdmin,
        must_change_password: true,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (isAdmin && data.user) {
      await admin
        .from("profiles")
        .update({ is_admin: true, name, avatar_initials: initials })
        .eq("id", data.user.id);
    } else if (data.user) {
      await admin
        .from("profiles")
        .update({ name, avatar_initials: initials })
        .eq("id", data.user.id);
    }

    return NextResponse.json({ ok: true, userId: data.user?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
