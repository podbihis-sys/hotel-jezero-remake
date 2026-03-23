"use client";
import { useState, useEffect, useCallback } from "react";
import { Building2, CheckCircle, XCircle, Save } from "lucide-react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface HotelStatus {
  pool: boolean;
  sauna: boolean;
  restaurant: boolean;
  gym: boolean;
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

export default function HotelStatusPage() {
  const [status, setStatus] = useState<HotelStatus>({ pool: false, sauna: false, restaurant: true, gym: false });
  const [savedStatus, setSavedStatus] = useState<HotelStatus>({ pool: false, sauna: false, restaurant: true, gym: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { markDirty, markClean } = useUnsavedChanges();
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { headers: { "x-admin-token": token } });
      if (res.ok) {
        const data = await res.json();
        const hs = data.hotel_status || { pool: false, sauna: false, restaurant: true, gym: false };
        setStatus(hs);
        setSavedStatus(hs);
      }
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const isDirty = JSON.stringify(status) !== JSON.stringify(savedStatus);
  useEffect(() => { if (isDirty) markDirty(); else markClean(); }, [isDirty, markDirty, markClean]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ key: "hotel_status", value: status }),
      });
      if (res.ok) { setSavedStatus(status); markClean(); setToast({ message: "Spremljeno!", type: "success" }); }
      else setToast({ message: "Greška pri spremanju.", type: "error" });
    } catch { setToast({ message: "Greška.", type: "error" }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" /></div>;

  const items = [
    { key: "pool" as const, label: "Bazen", emoji: "🏊" },
    { key: "sauna" as const, label: "Sauna", emoji: "🧖" },
    { key: "restaurant" as const, label: "Restoran", emoji: "🍽️" },
    { key: "gym" as const, label: "Teretana", emoji: "💪" },
  ];

  return (
    <div className="space-y-6 max-w-2xl w-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hotelstatus</h1>
        <button onClick={handleSave} disabled={!isDirty || saving}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${isDirty ? "bg-[#2C3E50] text-white hover:bg-[#3D566E]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          <Save className="w-4 h-4" /> {saving ? "Spremam..." : "Spremi"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#C5A55A]/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#C5A55A]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sadržaji hotela</h2>
            <p className="text-sm text-gray-500">Otvoreno / Zatvoreno status</p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className={`text-sm font-medium ${status[item.key] ? "text-green-600" : "text-red-500"}`}>
                    {status[item.key] ? "Otvoreno" : "Zatvoreno"}
                  </p>
                </div>
              </div>
              <button onClick={() => setStatus(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${status[item.key] ? "bg-green-500" : "bg-red-400"}`}>
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${status[item.key] ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
