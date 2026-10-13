import { cookies } from "next/headers";
import { verifyToken, getAdminUserById } from "./db";
import { AdminUser } from "./types";

export const COOKIE_NAME = "nik_admin_session";

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await getAdminUserById(payload.userId);
    if (!user || !user.is_active) return null;

    return user;
  } catch (err) {
    console.error("Error verifying current admin:", err);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
