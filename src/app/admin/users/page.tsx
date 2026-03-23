"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Pencil, Trash2, Shield, X, Key } from "lucide-react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface Permission {
  events: { create: boolean; edit: boolean; delete: boolean };
  pages: { edit: boolean };
  skijaliste: { manage: boolean };
  settings: { manage: boolean };
  users: { manage: boolean };
}

interface UserData {
  id: string;
  username: string;
  role: string;
  permissions: Permission;
  createdAt: string;
  lastLogin?: string;
}

const EMPTY_PERMISSIONS: Permission = {
  events: { create: false, edit: false, delete: false },
  pages: { edit: false },
  skijaliste: { manage: false },
  settings: { manage: false },
  users: { manage: false },
};

const ROLE_OPTIONS = ["Super Admin", "Editor", "Moderator", "Custom"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [defaultPermissions, setDefaultPermissions] = useState<Record<string, Permission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tempPwUser, setTempPwUser] = useState<UserData | null>(null);
  const [tempPw, setTempPw] = useState("");
  const [tempPwLoading, setTempPwLoading] = useState(false);
  const [tempPwError, setTempPwError] = useState("");

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Editor");
  const [formPermissions, setFormPermissions] = useState<Permission>(EMPTY_PERMISSIONS);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const { markDirty, markClean, confirmDiscard } = useUnsavedChanges();

  function getToken() {
    return localStorage.getItem("admin_token") || "";
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-token": getToken() },
      });
      if (!res.ok) throw new Error("Greška pri dohvaćanju korisnika.");
      const data = await res.json();
      setUsers(data.users);
      setDefaultPermissions(data.defaultPermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openNewForm() {
    setEditingUser(null);
    setFormUsername("");
    setFormPassword("");
    setFormRole("Editor");
    setFormPermissions(defaultPermissions["Editor"] || EMPTY_PERMISSIONS);
    setFormError("");
    markClean();
    setShowForm(true);
  }

  function openEditForm(user: UserData) {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormRole(ROLE_OPTIONS.includes(user.role) ? user.role : "Custom");
    setFormPermissions(user.permissions);
    setFormError("");
    markClean();
    setShowForm(true);
  }

  function handleRoleChange(role: string) {
    setFormRole(role);
    if (role !== "Custom" && defaultPermissions[role]) {
      setFormPermissions(defaultPermissions[role]);
    }
    markDirty();
  }

  function updatePermission(category: string, action: string, value: boolean) {
    setFormPermissions((prev) => ({
      ...prev,
      [category]: {
        ...(prev as unknown as Record<string, Record<string, boolean>>)[category],
        [action]: value,
      },
    }));
    setFormRole("Custom");
    markDirty();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": getToken(),
          },
          body: JSON.stringify({ role: formRole, permissions: formPermissions }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Greška pri ažuriranju.");
      } else {
        // Create new user
        if (!formUsername.trim()) {
          throw new Error("Korisničko ime je obavezno.");
        }
        if (!formPassword || formPassword.length < 6) {
          throw new Error("Lozinka mora imati najmanje 6 znakova.");
        }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": getToken(),
          },
          body: JSON.stringify({
            username: formUsername,
            password: formPassword,
            role: formRole,
            permissions: formPermissions,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Greška pri kreiranju.");
      }
      markClean();
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Greška.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": getToken() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri brisanju.");
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška.");
      setDeleteConfirm(null);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#163c6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#163c6f]">Korisnici</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upravljanje administratorskim računima
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-[#163c6f] text-white px-4 py-2 rounded-lg hover:bg-[#1a4a87] transition"
        >
          <Plus className="w-4 h-4" />
          Novi korisnik
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Korisnik</th>
                <th className="px-6 py-3 font-medium">Uloga</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">
                  Zadnja prijava
                </th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">
                  Kreiran
                </th>
                <th className="px-6 py-3 font-medium text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#163c6f] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "Super Admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "Editor"
                          ? "bg-blue-100 text-blue-700"
                          : user.role === "Moderator"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setTempPwUser(user); setTempPw(""); setTempPwError(""); }}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Jednokratna lozinka"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditForm(user)}
                        className="p-2 text-gray-400 hover:text-[#00c0f7] hover:bg-blue-50 rounded-lg transition"
                        title="Uredi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                          >
                            Da
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition"
                          >
                            Ne
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Obriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nema korisnika.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temp password modal */}
      {tempPwUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#163c6f]">
                Jednokratna lozinka za &quot;{tempPwUser.username}&quot;
              </h2>
              <button
                onClick={() => setTempPwUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                setTempPwError("");
                setTempPwLoading(true);
                try {
                  const res = await fetch(`/api/admin/users/${tempPwUser.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      "x-admin-token": getToken(),
                    },
                    body: JSON.stringify({ tempPassword: tempPw }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setTempPwError(data.error || "Greška.");
                    return;
                  }
                  setTempPwUser(null);
                  setError("");
                } catch {
                  setTempPwError("Greška u komunikaciji.");
                } finally {
                  setTempPwLoading(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <p className="text-sm text-gray-500">
                Korisnik će morati postaviti novu lozinku pri sljedećoj prijavi.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jednokratna lozinka
                </label>
                <input
                  type="text"
                  value={tempPw}
                  onChange={(e) => setTempPw(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition"
                  placeholder="Minimalno 6 znakova"
                  required
                  minLength={6}
                />
              </div>
              {tempPwError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{tempPwError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={tempPwLoading}
                  className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {tempPwLoading ? "Postavljam..." : "Postavi jednokratnu lozinku"}
                </button>
                <button
                  type="button"
                  onClick={() => setTempPwUser(null)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Odustani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#163c6f]">
                {editingUser ? "Uredi korisnika" : "Novi korisnik"}
              </h2>
              <button
                onClick={() => { if (confirmDiscard()) setShowForm(false); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Korisničko ime
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => { setFormUsername(e.target.value); markDirty(); }}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="korisnicko_ime"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lozinka{editingUser ? " (ostavite prazno za bez promjene)" : ""}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); markDirty(); }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition"
                  placeholder={editingUser ? "••••••" : "Minimalno 6 znakova"}
                  required={!editingUser}
                  minLength={editingUser ? 0 : 6}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uloga
                </label>
                <select
                  value={formRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition bg-white"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dozvole
                </label>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  {/* Events */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Događanja
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(["create", "edit", "delete"] as const).map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={formPermissions.events[action]}
                            onChange={(e) =>
                              updatePermission("events", action, e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-[#00c0f7] focus:ring-[#00c0f7]"
                          />
                          {action === "create"
                            ? "Kreiranje"
                            : action === "edit"
                            ? "Uređivanje"
                            : "Brisanje"}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pages */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Stranice
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formPermissions.pages.edit}
                        onChange={(e) =>
                          updatePermission("pages", "edit", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#00c0f7] focus:ring-[#00c0f7]"
                      />
                      Uređivanje
                    </label>
                  </div>

                  {/* Skijaliste */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Skijalište i kamere
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formPermissions.skijaliste.manage}
                        onChange={(e) =>
                          updatePermission("skijaliste", "manage", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#00c0f7] focus:ring-[#00c0f7]"
                      />
                      Upravljanje
                    </label>
                  </div>

                  {/* Settings */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Postavke
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formPermissions.settings.manage}
                        onChange={(e) =>
                          updatePermission("settings", "manage", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#00c0f7] focus:ring-[#00c0f7]"
                      />
                      Upravljanje
                    </label>
                  </div>

                  {/* Users */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Korisnici
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formPermissions.users.manage}
                        onChange={(e) =>
                          updatePermission("users", "manage", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#00c0f7] focus:ring-[#00c0f7]"
                      />
                      Upravljanje
                    </label>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-[#163c6f] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1a4a87] transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Spremanje..."
                    : editingUser
                    ? "Spremi promjene"
                    : "Kreiraj korisnika"}
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirmDiscard()) setShowForm(false); }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Odustani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
