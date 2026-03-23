"use client";

import { useState } from "react";
import { Shield, Key, CheckCircle, XCircle, User } from "lucide-react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

import { useEffect } from "react";

export default function AdminSettingsPage() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();
  const [username, setUsername] = useState("admin");
  const [role, setRole] = useState("Super Admin");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        const u = JSON.parse(stored);
        setUsername(u.username || "admin");
        setRole(u.role || "Super Admin");
      }
    } catch {}
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 10) {
      setToast({ message: "Nova lozinka mora imati najmanje 10 znakova.", type: "error" }); return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setToast({ message: "Lozinka mora sadržavati veliko slovo.", type: "error" }); return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setToast({ message: "Lozinka mora sadržavati malo slovo.", type: "error" }); return;
    }
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setToast({ message: "Lozinka mora sadržavati broj ili poseban znak.", type: "error" }); return;
    }
    if (/[\sß]/.test(newPassword)) {
      setToast({ message: "Lozinka ne smije sadržavati razmak ili ß.", type: "error" }); return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: "Lozinke se ne podudaraju.", type: "error" }); return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || "Greška.", type: "error" }); return;
      }
      // Update token with new password
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
      }
      markClean();
      setToast({ message: "Lozinka uspješno promijenjena!", type: "success" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      setToast({ message: "Greška u komunikaciji.", type: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Postavke</h1>
        <p className="text-sm text-gray-500">Moj račun i sigurnost</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#163c6f] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Moj račun</h2>
            <p className="text-sm text-gray-500">Informacije o vašem računu</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Korisničko ime</p>
            <p className="font-medium text-gray-900">{username}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Uloga</p>
            <p className="font-medium text-gray-900">{role}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Key className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Promjena lozinke</h2>
            <p className="text-sm text-gray-500">Min. 10 znakova, veliko+malo slovo, broj/znak</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trenutna lozinka</label>
            <input type="password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); markDirty(); }} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova lozinka</label>
            <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); markDirty(); }} required minLength={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potvrda nove lozinke</label>
            <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); markDirty(); }} required minLength={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition text-sm" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-[#163c6f] text-white py-2.5 rounded-lg font-medium hover:bg-[#1a4a87] transition disabled:opacity-50 text-sm">
            {saving ? "Spremam..." : "Promijeni lozinku"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sigurnost</h2>
            <p className="text-sm text-gray-500">Aktivne zaštite</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            "Lozinka (SHA-256 + salt)",
            "Zaključavanje nakon 6 pokušaja (1 sat)",
            "Rate limiting",
            "Token autentifikacija",
            "Uloge i dozvole",
          ].map(label => (
            <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
              <span className="text-sm text-gray-700">{label}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">Aktivno</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
