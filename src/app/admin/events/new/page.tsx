"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    date: "",
    image: "",
    summary: "",
    body: "",
    contact: "",
    pinned: false,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { markDirty, markClean } = useUnsavedChanges();

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Naslov je obavezan.";
    if (!form.date.trim()) newErrors.date = "Datum je obavezan.";
    if (!form.image.trim()) newErrors.image = "Slika URL je obavezan.";
    if (!form.summary.trim()) newErrors.summary = "Sažetak je obavezan.";
    if (!form.body.trim()) newErrors.body = "Tekst je obavezan.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const token = localStorage.getItem("admin_token") || "";

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setToast({
          message: data.error || "Greška pri spremanju.",
          type: "error",
        });
        return;
      }

      markClean();
      setToast({ message: "Događaj uspješno kreiran!", type: "success" });
      setTimeout(() => router.push("/admin/events"), 1500);
    } catch {
      setToast({ message: "Greška u komunikaciji.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novi događaj</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naslov *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); markDirty(); }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition ${
              errors.title ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="npr. Otvaramo skijašku sezonu 2026"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum *
            </label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => { setForm({ ...form, date: e.target.value }); markDirty(); }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition ${
                errors.date ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="npr. 30. prosinac 2025."
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <ImageUpload
          value={form.image}
          onChange={(url) => { setForm({ ...form, image: url }); markDirty(); }}
          label="Slika *"
        />
        {errors.image && (
          <p className="text-red-500 text-sm -mt-3">{errors.image}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sažetak *
          </label>
          <textarea
            value={form.summary}
            onChange={(e) => { setForm({ ...form, summary: e.target.value }); markDirty(); }}
            rows={2}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition resize-y ${
              errors.summary ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Kratak opis za prikaz na popisu događaja"
          />
          {errors.summary && (
            <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tekst (puni sadržaj) *
          </label>
          <textarea
            value={form.body}
            onChange={(e) => { setForm({ ...form, body: e.target.value }); markDirty(); }}
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition resize-y ${
              errors.body ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Puni tekst događaja..."
          />
          {errors.body && (
            <p className="text-red-500 text-sm mt-1">{errors.body}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kontakt (opcionalno)
          </label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => { setForm({ ...form, contact: e.target.value }); markDirty(); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none transition"
            placeholder="npr. +387 34 275 100, info@adriaski.net"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="pinned"
            checked={form.pinned}
            onChange={(e) => { setForm({ ...form, pinned: e.target.checked }); markDirty(); }}
            className="w-5 h-5 text-[#00c0f7] border-gray-300 rounded focus:ring-[#00c0f7]"
          />
          <label htmlFor="pinned" className="text-sm text-gray-700">
            Prikvači ovaj događaj na vrh popisa
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/admin/events"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Odustani
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#163c6f] text-white rounded-lg hover:bg-[#1a4a87] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Kreiram..." : "Kreiraj događaj"}
          </button>
        </div>
      </form>
    </div>
  );
}
