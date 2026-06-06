import { getSession, initials, type SessionPayload } from "./auth";

export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession();
}

export { initials };
