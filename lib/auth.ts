import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "session";

export type UserRole = "admin" | "player";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no configurado");
  return secret;
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function createToken(payload: SessionPayload) {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function sessionFromUser(user: Pick<DbUser, "id" | "email" | "name" | "role" | "must_change_password">): SessionPayload {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.must_change_password,
  };
}
