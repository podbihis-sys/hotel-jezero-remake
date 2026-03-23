import crypto from "crypto";
import { getRedis } from "./redis";

const USERS_KEY = "adriaski:users";

export interface Permission {
  events: { create: boolean; edit: boolean; delete: boolean };
  pages: { edit: boolean };
  skijaliste: { manage: boolean };
  cameras: { manage: boolean };
  settings: { manage: boolean };
  users: { manage: boolean };
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  permissions: Permission;
  createdAt: string;
  lastLogin?: string;
  mustChangePassword?: boolean;
}

const DEFAULT_PERMISSIONS: Record<string, Permission> = {
  "Super Admin": {
    events: { create: true, edit: true, delete: true },
    pages: { edit: true },
    skijaliste: { manage: true },
    cameras: { manage: true },
    settings: { manage: true },
    users: { manage: true },
  },
  Editor: {
    events: { create: true, edit: true, delete: false },
    pages: { edit: true },
    skijaliste: { manage: false },
    cameras: { manage: false },
    settings: { manage: false },
    users: { manage: false },
  },
  Moderator: {
    events: { create: true, edit: true, delete: true },
    pages: { edit: false },
    skijaliste: { manage: true },
    cameras: { manage: true },
    settings: { manage: false },
    users: { manage: false },
  },
};

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "adriaski-salt-2026").digest("hex");
}

// Common passwords and patterns to block
const COMMON_PASSWORDS = [
  "password", "passwort", "qwerty", "letmein", "welcome", "monkey", "dragon",
  "master", "login", "princess", "football", "shadow", "sunshine", "trustno1",
  "iloveyou", "batman", "access", "hello", "charlie", "admin", "administrator",
  "adriaski", "kupres", "hotel", "tikvice", "skijanje", "skijaliste",
];

const SEQUENTIAL_PATTERNS = [
  "0123456789", "9876543210", "abcdefghij", "qwertyuiop", "asdfghjkl",
];

export function validatePassword(password: string): string | null {
  if (password.length < 10) return "Lozinka mora imati najmanje 10 znakova.";
  if (/[\sß]/.test(password)) return "Lozinka ne smije sadržavati razmak ili ß.";
  if (!/[A-Z]/.test(password)) return "Lozinka mora sadržavati najmanje jedno veliko slovo.";
  if (!/[a-z]/.test(password)) return "Lozinka mora sadržavati najmanje jedno malo slovo.";
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "Lozinka mora sadržavati najmanje jedan broj ili poseban znak.";

  const lower = password.toLowerCase();
  for (const common of COMMON_PASSWORDS) {
    if (lower.includes(common)) return `Lozinka ne smije sadržavati "${common}".`;
  }

  for (const seq of SEQUENTIAL_PATTERNS) {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.substring(i, i + 4)))
        return "Lozinka ne smije sadržavati uzastopne znakove (npr. 1234, abcd).";
    }
  }

  if (/(.)\1{3,}/.test(password)) return "Lozinka ne smije sadržavati 4+ uzastopna ista znaka.";

  return null; // Valid
}

// Account lockout tracking (in-memory, resets on deploy — acceptable for rate limiting)
const loginAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();

export function checkAccountLock(username: string): string | null {
  const entry = loginAttempts.get(username);
  if (!entry) return null;
  if (entry.lockedUntil > Date.now()) {
    const remaining = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return `Račun je zaključan. Pokušajte ponovo za ${remaining} minuta.`;
  }
  if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
    loginAttempts.delete(username);
  }
  return null;
}

export function recordFailedLogin(username: string): void {
  const entry = loginAttempts.get(username) || { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= 6) {
    entry.lockedUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    entry.count = 0;
  }
  loginAttempts.set(username, entry);
}

export function clearLoginAttempts(username: string): void {
  loginAttempts.delete(username);
}

export async function getUsers(): Promise<User[]> {
  try {
    const redis = getRedis();
    const data = await redis.get<User[]>(USERS_KEY);
    if (data && data.length > 0) return data;
    // Initialize default super admin
    const adminPassword = process.env.ADMIN_PASSWORD || "adriaski2026";
    const defaultUsers: User[] = [
      {
        id: "admin-1",
        username: "admin",
        passwordHash: hashPassword(adminPassword),
        role: "Super Admin",
        permissions: DEFAULT_PERMISSIONS["Super Admin"],
        createdAt: new Date().toISOString(),
      },
    ];
    await saveUsers(defaultUsers);
    return defaultUsers;
  } catch {
    // Fallback: return default admin without persisting
    const adminPassword = process.env.ADMIN_PASSWORD || "adriaski2026";
    return [
      {
        id: "admin-1",
        username: "admin",
        passwordHash: hashPassword(adminPassword),
        role: "Super Admin",
        permissions: DEFAULT_PERMISSIONS["Super Admin"],
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  const redis = getRedis();
  await redis.set(USERS_KEY, users);
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const lockError = checkAccountLock(username);
  if (lockError) throw new Error(lockError);

  const users = await getUsers();
  const hash = hashPassword(password);
  const user = users.find((u) => u.username === username && u.passwordHash === hash);
  if (user) {
    clearLoginAttempts(username);
    user.lastLogin = new Date().toISOString();
    await saveUsers(users);
    return user;
  }
  recordFailedLogin(username);
  return null;
}

export async function createUser(username: string, password: string, role: string, permissions: Permission): Promise<User> {
  const users = await getUsers();
  if (users.find((u) => u.username === username)) {
    throw new Error("Korisničko ime već postoji.");
  }
  const pwError = validatePassword(password);
  if (pwError) throw new Error(pwError);
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    username: username.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    permissions,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const superAdmins = users.filter((u) => u.role === "Super Admin");
  const userToDelete = users.find((u) => u.id === id);
  if (userToDelete?.role === "Super Admin" && superAdmins.length <= 1) {
    throw new Error("Nije moguće obrisati zadnjeg Super Admina.");
  }
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  await saveUsers(filtered);
  return true;
}

export async function updateUserPermissions(id: string, role: string, permissions: Permission): Promise<User | null> {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  user.role = role;
  user.permissions = permissions;
  await saveUsers(users);
  return user;
}

export async function setTemporaryPassword(id: string, tempPassword: string): Promise<boolean> {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return false;
  user.passwordHash = hashPassword(tempPassword);
  user.mustChangePassword = true;
  await saveUsers(users);
  return true;
}

export async function clearMustChangePassword(id: string, newPassword: string): Promise<string | null> {
  const pwError = validatePassword(newPassword);
  if (pwError) return pwError;
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return "Korisnik nije pronađen.";
  user.passwordHash = hashPassword(newPassword);
  user.mustChangePassword = false;
  await saveUsers(users);
  return null; // success
}

export function getDefaultPermissions(): Record<string, Permission> {
  return DEFAULT_PERMISSIONS;
}
