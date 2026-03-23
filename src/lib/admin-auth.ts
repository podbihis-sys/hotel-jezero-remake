import { NextRequest } from "next/server";
import { authenticateUser, getUsers, User, Permission, hashPassword } from "./users-store";

const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function validateAdminSession(request: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(request);
  return user !== null;
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("x-admin-token");
  if (!authHeader) return null;
  try {
    const decoded = JSON.parse(Buffer.from(authHeader, "base64").toString());
    if (decoded.username && decoded.hash) {
      // Check token expiration
      if (decoded.exp && Date.now() > decoded.exp) {
        return null; // Token expired
      }
      const users = await getUsers();
      return users.find((u) => u.username === decoded.username && u.passwordHash === decoded.hash) || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function hasPermission(user: User, category: keyof Permission, action: string): boolean {
  const perm = user.permissions[category];
  if (!perm) return false;
  return (perm as Record<string, boolean>)[action] === true;
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ token: string; user: User; mustChangePassword?: boolean } | null> {
  const user = await authenticateUser(username, password);
  if (!user) return null;
  const token = Buffer.from(
    JSON.stringify({
      username: user.username,
      hash: user.passwordHash,
      exp: Date.now() + TOKEN_EXPIRY_MS,
    })
  ).toString("base64");
  return {
    token,
    user: { ...user, passwordHash: "" },
    mustChangePassword: user.mustChangePassword || false,
  };
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export type { Permission, User };
export { hashPassword };
