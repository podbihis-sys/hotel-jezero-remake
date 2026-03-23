"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  image: string;
  summary: string;
  body: string;
  contact?: string;
  pinned?: boolean;
  created_at?: string;
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      {message}
    </div>
  );
}

function EditModal({
  event,
  onClose,
  onSave,
}: {
  event: EventItem;
  onClose: () => void;
  onSave: (data: EventItem) => void;
}) {
  const [form, setForm] = useState(event);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { hasUnsavedChanges, markDirty, markClean, confirmDiscard } = useUnsavedChanges();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("admin_token") || "";

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Greška pri spremanju.");
        return;
      }

      const updated = await res.json();
      markClean();
      onSave(updated);
    } catch {
      setError("Greška u komunikaciji.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Uredi događaj</h2>
          <button
            onClick={() => { if (confirmDiscard()) onClose(); }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naslov *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); markDirty(); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum *
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => { setForm({ ...form, date: e.target.value }); markDirty(); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none"
                required
              />
            </div>
            <ImageUpload
              value={form.image}
              onChange={(url) => { setForm({ ...form, image: url }); markDirty(); }}
              label="Slika *"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sažetak *
            </label>
            <textarea
              value={form.summary}
              onChange={(e) => { setForm({ ...form, summary: e.target.value }); markDirty(); }}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none resize-y"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tekst *
            </label>
            <textarea
              value={form.body}
              onChange={(e) => { setForm({ ...form, body: e.target.value }); markDirty(); }}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none resize-y"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kontakt
            </label>
            <input
              type="text"
              value={form.contact || ""}
              onChange={(e) => { setForm({ ...form, contact: e.target.value }); markDirty(); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0f7] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-pinned"
              checked={form.pinned || false}
              onChange={(e) => { setForm({ ...form, pinned: e.target.checked }); markDirty(); }}
              className="w-4 h-4 text-[#00c0f7] border-gray-300 rounded focus:ring-[#00c0f7]"
            />
            <label htmlFor="edit-pinned" className="text-sm text-gray-700">
              Prikvači događaj
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { if (confirmDiscard()) onClose(); }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#163c6f] text-white rounded-lg hover:bg-[#1a4a87] transition disabled:opacity-50"
            >
              {saving ? "Spremam..." : "Spremi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || ""
      : "";

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events", {
        headers: { "x-admin-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      setToast({ message: "Greška pri dohvaćanju događaja.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setToast({ message: "Događaj obrisan.", type: "success" });
      } else {
        setToast({ message: "Greška pri brisanju.", type: "error" });
      }
    } catch {
      setToast({ message: "Greška u komunikaciji.", type: "error" });
    }
    setDeletingId(null);
  }

  function handleEditSave(updated: EventItem) {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
    );
    setEditingEvent(null);
    setToast({ message: "Događaj ažuriran.", type: "success" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#163c6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {editingEvent && (
        <EditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Obriši događaj?</h3>
                <p className="text-sm text-gray-500">
                  Ova radnja se ne može poništiti.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Odustani
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Događanja</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 bg-[#163c6f] text-white px-4 py-2 rounded-lg hover:bg-[#1a4a87] transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novi događaj
        </Link>
      </div>

      {/* Events table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Naslov
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Nema događaja. Kliknite &quot;Novi događaj&quot; za dodavanje.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.image && (
                          <img
                            src={event.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {event.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.date}
                    </td>
                    <td className="px-6 py-4">
                      {event.pinned && (
                        <span className="inline-flex items-center gap-1 text-xs bg-[#00c0f7]/10 text-[#00c0f7] px-2 py-1 rounded-full font-medium">
                          <Pin className="w-3 h-3" />
                          Prikvačeno
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 text-gray-400 hover:text-[#163c6f] hover:bg-gray-100 rounded-lg transition"
                          title="Uredi"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Obriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
