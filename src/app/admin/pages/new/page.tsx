"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(val: string) {
    setTitle(val);
    if (autoSlug) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setAutoSlug(false);
    setSlug(slugify(val));
  }

  async function handleCreate() {
    if (!title.trim() || !slug.trim()) {
      setError("Naziv i slug su obavezni.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          title,
          sections: [
            { id: `heading-${Date.now()}`, type: "heading", content: title, label: "Naslov" },
            { id: `text-${Date.now()}`, type: "text", content: "", label: "Uvodni tekst" },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Greška pri kreiranju.");
      }

      router.push(`/admin/pages/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#163c6f] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Nazad na stranice
      </Link>

      <h1 className="text-2xl font-bold text-[#163c6f] mb-6">Nova stranica</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Naziv stranice *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="npr. Nova ponuda"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00c0f7]/30 focus:border-[#00c0f7] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL putanja) *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="nova-ponuda"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00c0f7]/30 focus:border-[#00c0f7] outline-none transition"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Automatski generiran iz naziva. Možete ga ručno promijeniti.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={saving || !title.trim() || !slug.trim()}
          className="inline-flex items-center gap-2 bg-[#163c6f] hover:bg-[#0b1d42] text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kreiraj stranicu
        </button>
      </div>
    </div>
  );
}
