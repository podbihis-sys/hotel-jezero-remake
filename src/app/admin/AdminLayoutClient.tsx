"use client";

import { useState, useEffect, ReactNode, FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Mountain,
  Lock,
  Menu,
  X,
  FileText,
  Users,
  User,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
  permissions: {
    events: { create: boolean; edit: boolean; delete: boolean };
    pages: { edit: boolean };
    skijaliste: { manage: boolean };
    settings: { manage: boolean };
    users: { manage: boolean };
  };
  mustChangePassword?: boolean;
}

function ForceChangePasswordDialog({
  token,
  onDone,
}: {
  token: string;
  onDone: (newToken: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ newPassword, forceChange: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška.");
        return;
      }
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
      }
      onDone(data.token);
    } catch {
      setError("Greška u komunikaciji.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-[#2C3E50]">Promjena lozinke obavezna</h1>
          <p className="text-gray-500 mt-1 text-sm text-center">
            Administrator je postavio jednokratnu lozinku. Morate postaviti novu lozinku za nastavak.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova lozinka</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A55A] focus:border-transparent outline-none transition"
              placeholder="Minimalno 10 znakova"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potvrda nove lozinke</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A55A] focus:border-transparent outline-none transition"
              placeholder="Ponovite lozinku"
            />
          </div>
          <p className="text-xs text-gray-400">
            Min. 10 znakova, veliko + malo slovo, broj ili poseban znak.
          </p>
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#2C3E50] text-white py-3 rounded-lg font-semibold hover:bg-[#3D566E] transition disabled:opacity-50"
          >
            {saving ? "Spremam..." : "Postavi novu lozinku"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (token: string, user?: AdminUser, mustChangePassword?: boolean) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || "admin", password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Greška pri prijavi.");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      if (data.user) {
        localStorage.setItem("admin_user", JSON.stringify(data.user));
      }
      onLogin(data.token, data.user, data.mustChangePassword);
    } catch {
      setError("Greška u komunikaciji sa serverom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#2C3E50] rounded-2xl flex items-center justify-center mb-4">
            <Mountain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C3E50]">Hotel Jezero Admin</h1>
          <p className="text-gray-500 mt-1">Prijavite se za nastavak</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Korisničko ime
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A55A] focus:border-transparent outline-none transition"
                placeholder="Korisničko ime"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lozinka
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A55A] focus:border-transparent outline-none transition"
                placeholder="Unesite lozinku"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C3E50] text-white py-3 rounded-lg font-semibold hover:bg-[#3D566E] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Prijava..." : "Prijava"}
          </button>
        </form>
      </div>
    </div>
  );
}

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/admin/events", label: "Događanja", icon: Calendar, permission: null },
  { href: "/admin/pages", label: "Stranice", icon: FileText, permission: null },
  { href: "/admin/hotelstatus", label: "Hotelstatus", icon: Mountain, permission: null },
  { href: "/admin/settings", label: "Postavke", icon: Settings, permission: null },
  { href: "/admin/users", label: "Korisnici", icon: Users, permission: "users.manage" as const },
];

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    // If we have a token but no user data, the token is from the old system - force re-login
    if (stored && !storedUser) {
      localStorage.removeItem("admin_token");
      setChecking(false);
      return;
    }

    if (stored) setToken(stored);
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user - force re-login
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setChecking(false);
  }, []);

  function handleLogin(newToken: string, user?: AdminUser, forceChange?: boolean) {
    setToken(newToken);
    if (user) setAdminUser(user);
    if (forceChange) setMustChangePassword(true);
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setAdminUser(null);
  }

  // Filter nav items based on permissions
  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    if (!adminUser) return false;
    if (item.permission === "users.manage") {
      return adminUser.permissions?.users?.manage === true;
    }
    return true;
  });

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (mustChangePassword) {
    return (
      <ForceChangePasswordDialog
        token={token}
        onDone={(newToken) => {
          setToken(newToken);
          setMustChangePassword(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-x-hidden w-screen max-w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#2C3E50] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mountain className="w-8 h-8 text-[#C5A55A]" />
              <div>
                <h2 className="font-bold text-lg leading-tight">Hotel Jezero</h2>
                <p className="text-xs text-white/60">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Site Switcher */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Projekt</p>
          <div className="flex gap-1">
            <span className="flex-1 px-3 py-1.5 bg-white/20 text-white text-xs font-medium rounded text-center">Hotel Jezero</span>
            <a href="https://adriaski-remake.vercel.app/admin" target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-1.5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-xs font-medium rounded text-center transition">Adria Ski</a>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#C5A55A] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          {/* Current user info */}
          {adminUser && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 bg-[#C5A55A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                {adminUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {adminUser.username}
                </p>
                <p className="text-xs text-white/50">{adminUser.role}</p>
              </div>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-white/50 hover:text-white transition text-sm mb-2"
          >
            Pogledaj stranicu &rarr;
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Odjava</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm text-gray-500">
            {navItems.find(
              (n) =>
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(n.href)
            )?.label || "Admin"}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
