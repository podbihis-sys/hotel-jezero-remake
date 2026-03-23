"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, Check, AlertCircle,
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Type, AlignLeft, ImageIcon, Images, BarChart3,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface PageSection {
  id: string;
  type: "text" | "image" | "heading" | "gallery" | "stats";
  content: string;
  label: string;
}

type MenuPosition = "none" | "top" | "o-nama" | "ponuda" | "ljetna-ponuda";

interface PageContent {
  slug: string;
  title: string;
  sections: PageSection[];
  updatedAt: string;
  menuPosition?: MenuPosition;
  menuOrder?: number;
}

const menuPositionLabels: Record<MenuPosition, string> = {
  none: "Nije u meniju",
  top: "Glavna navigacija",
  "o-nama": "Pod 'O nama'",
  "ponuda": "Pod 'Ponuda'",
  "ljetna-ponuda": "Pod 'Ljetna ponuda'",
};

const sectionTypeLabels: Record<string, { label: string; icon: typeof Type }> = {
  heading: { label: "Naslov", icon: Type },
  text: { label: "Tekst", icon: AlignLeft },
  image: { label: "Slika", icon: ImageIcon },
  gallery: { label: "Galerija", icon: Images },
  stats: { label: "Statistik-Karten", icon: BarChart3 },
};

export default function AdminPageEditorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);
  const { markDirty, markClean } = useUnsavedChanges();

  const fetchPage = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`/api/admin/pages/${slug}`, {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Stranica nije pronađena.");
      setPage(await res.json());
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Greška." });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchPage(); }, [fetchPage]);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  function updateSection(index: number, content: string) {
    if (!page) return;
    const sections = [...page.sections];
    sections[index] = { ...sections[index], content };
    setPage({ ...page, sections });
    markDirty();
  }

  function updateSectionLabel(index: number, label: string) {
    if (!page) return;
    const sections = [...page.sections];
    sections[index] = { ...sections[index], label };
    setPage({ ...page, sections });
    markDirty();
  }

  function moveSection(index: number, direction: "up" | "down") {
    if (!page) return;
    const sections = [...page.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
    setPage({ ...page, sections });
    markDirty();
  }

  function addSection(afterIndex: number, type: PageSection["type"]) {
    if (!page) return;
    const sections = [...page.sections];
    const id = `section-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const labels: Record<string, string> = {
      heading: "Novi naslov",
      text: "Novi tekst",
      image: "Nova slika",
      gallery: "Nova galerija",
      stats: "Nova statistika",
    };
    sections.splice(afterIndex + 1, 0, {
      id,
      type,
      content: "",
      label: labels[type],
    });
    setPage({ ...page, sections });
    setShowAddMenu(null);
    markDirty();
  }

  function removeSection(index: number) {
    if (!page) return;
    if (!confirm("Obrisati ovaj blok?")) return;
    const sections = [...page.sections];
    sections.splice(index, 1);
    setPage({ ...page, sections });
    markDirty();
  }

  function addGalleryImage(sectionIndex: number) {
    if (!page) return;
    const section = page.sections[sectionIndex];
    const images = section.content ? section.content.split(",") : [];
    images.push("");
    updateSection(sectionIndex, images.join(","));
  }

  function updateGalleryImage(sectionIndex: number, imageIndex: number, value: string) {
    if (!page) return;
    const images = page.sections[sectionIndex].content ? page.sections[sectionIndex].content.split(",") : [];
    images[imageIndex] = value;
    updateSection(sectionIndex, images.join(","));
  }

  function removeGalleryImage(sectionIndex: number, imageIndex: number) {
    if (!page) return;
    const images = page.sections[sectionIndex].content ? page.sections[sectionIndex].content.split(",") : [];
    images.splice(imageIndex, 1);
    updateSection(sectionIndex, images.join(","));
  }

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ title: page.title, sections: page.sections, menuPosition: page.menuPosition || "none", menuOrder: page.menuOrder ?? 99 }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Greška.");
      setPage(await res.json());
      markClean();
      setToast({ type: "success", message: "Stranica uspješno spremljena!" });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Greška." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#163c6f] animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Stranica nije pronađena.</p>
        <Link href="/admin/pages" className="text-[#00c0f7] font-semibold hover:underline">Nazad</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#163c6f] transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Link>
          <input
            type="text"
            value={page.title}
            onChange={(e) => { setPage({ ...page, title: e.target.value }); markDirty(); }}
            className="block w-full text-2xl font-bold text-[#163c6f] bg-transparent border-none outline-none focus:ring-0 p-0"
          />
          <p className="text-xs text-gray-400 mt-1">/{page.slug}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-[#163c6f] hover:bg-[#0b1d42] text-white font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Spremi
        </button>
      </div>

      {/* Menu Position */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700">Pozicija u meniju:</span>
          </div>
          <select
            value={page.menuPosition || "none"}
            onChange={(e) => { setPage({ ...page, menuPosition: e.target.value as MenuPosition }); markDirty(); }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00c0f7]/30 focus:border-[#00c0f7] outline-none"
          >
            {Object.entries(menuPositionLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {page.menuPosition && page.menuPosition !== "none" && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500">Redoslijed:</span>
              <input
                type="number"
                min={0}
                max={99}
                value={page.menuOrder ?? 99}
                onChange={(e) => { setPage({ ...page, menuOrder: Number(e.target.value) }); markDirty(); }}
                className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#00c0f7]/30 outline-none"
              />
            </div>
          )}
        </div>
        {page.menuPosition && page.menuPosition !== "none" && (
          <p className="text-xs text-gray-400 mt-2">Niži broj = pojavljuje se ranije u meniju. Spremi za primjenu.</p>
        )}
      </div>

      {/* Add at top */}
      <AddBlockButton index={-1} showAddMenu={showAddMenu} setShowAddMenu={setShowAddMenu} addSection={addSection} />

      {/* Sections */}
      <div className="space-y-2">
        {page.sections.map((section, index) => {
          const typeInfo = sectionTypeLabels[section.type];
          const TypeIcon = typeInfo?.icon || AlignLeft;

          return (
            <div key={section.id}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
                {/* Section toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <TypeIcon className="w-4 h-4 text-[#00c0f7] flex-shrink-0" />
                  <input
                    type="text"
                    value={section.label}
                    onChange={(e) => updateSectionLabel(index, e.target.value)}
                    className="flex-1 text-xs font-semibold text-[#163c6f] uppercase tracking-wider bg-transparent border-none outline-none px-1"
                  />
                  <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{typeInfo?.label}</span>

                  <div className="flex items-center gap-0.5 ml-2">
                    <button
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-[#163c6f] hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Pomakni gore"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(index, "down")}
                      disabled={index === page.sections.length - 1}
                      className="p-1 text-gray-400 hover:text-[#163c6f] hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Pomakni dolje"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSection(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Obriši blok"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section content */}
                <div className="p-5">
                  {section.type === "heading" && (
                    <input
                      type="text"
                      value={section.content}
                      onChange={(e) => updateSection(index, e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg font-heading font-bold text-[#163c6f] bg-white focus:outline-none focus:ring-2 focus:ring-[#00c0f7]/30 focus:border-[#00c0f7] transition-all"
                      placeholder="Unesite naslov..."
                    />
                  )}

                  {section.type === "text" && (
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#3d3d3d] bg-white focus:outline-none focus:ring-2 focus:ring-[#00c0f7]/30 focus:border-[#00c0f7] transition-all resize-y"
                      placeholder="Unesite tekst..."
                    />
                  )}

                  {section.type === "image" && (
                    <ImageUpload value={section.content} onChange={(url) => updateSection(index, url)} />
                  )}

                  {section.type === "gallery" && (
                    <div className="space-y-3">
                      {(section.content ? section.content.split(",").filter(Boolean) : []).map((img, imgIdx) => (
                        <div key={imgIdx} className="flex items-start gap-3">
                          <div className="flex-1">
                            <ImageUpload value={img} onChange={(url) => updateGalleryImage(index, imgIdx, url)} />
                          </div>
                          <button onClick={() => removeGalleryImage(index, imgIdx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 mt-6">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addGalleryImage(index)} className="inline-flex items-center gap-1.5 text-sm text-[#00c0f7] font-semibold hover:text-[#00a8d6] transition">
                        <Plus className="w-4 h-4" /> Dodaj sliku
                      </button>
                    </div>
                  )}

                  {section.type === "stats" && (() => {
                    let stats: {value: string; label: string}[] = [];
                    try { stats = JSON.parse(section.content || "[]"); } catch { stats = []; }
                    return (
                      <div className="space-y-2">
                        {stats.map((stat, si) => (
                          <div key={si} className="flex items-center gap-3">
                            <input type="text" value={stat.value} placeholder="Vrijednost (npr. 13km)"
                              onChange={e => { const s = [...stats]; s[si] = {...s[si], value: e.target.value}; updateSection(index, JSON.stringify(s)); }}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00c0f7]/30 outline-none" />
                            <input type="text" value={stat.label} placeholder="Oznaka (npr. Staza)"
                              onChange={e => { const s = [...stats]; s[si] = {...s[si], label: e.target.value}; updateSection(index, JSON.stringify(s)); }}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00c0f7]/30 outline-none" />
                            <button onClick={() => { const s = [...stats]; s.splice(si, 1); updateSection(index, JSON.stringify(s)); }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => { stats.push({value: "", label: ""}); updateSection(index, JSON.stringify(stats)); }}
                          className="inline-flex items-center gap-1.5 text-sm text-[#00c0f7] font-semibold hover:text-[#00a8d6] transition">
                          <Plus className="w-4 h-4" /> Dodaj statistiku
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Add block after this section */}
              <AddBlockButton index={index} showAddMenu={showAddMenu} setShowAddMenu={setShowAddMenu} addSection={addSection} />
            </div>
          );
        })}
      </div>

      {/* Bottom save */}
      <div className="mt-8 flex items-center justify-between">
        <Link href="/admin/pages" className="text-sm text-gray-500 hover:text-[#163c6f] transition">Nazad na stranice</Link>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-[#163c6f] hover:bg-[#0b1d42] text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Spremi
        </button>
      </div>
    </div>
  );
}

function AddBlockButton({
  index,
  showAddMenu,
  setShowAddMenu,
  addSection,
}: {
  index: number;
  showAddMenu: number | null;
  setShowAddMenu: (v: number | null) => void;
  addSection: (afterIndex: number, type: PageSection["type"]) => void;
}) {
  const isOpen = showAddMenu === index;

  return (
    <div className="relative flex items-center justify-center py-2 group">
      {/* Line */}
      <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200 group-hover:border-[#00c0f7]/30 transition" />

      {/* Button */}
      <button
        onClick={() => setShowAddMenu(isOpen ? null : index)}
        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs ${
          isOpen
            ? "bg-[#00c0f7] text-white shadow-md"
            : "bg-white border border-gray-300 text-gray-400 hover:border-[#00c0f7] hover:text-[#00c0f7] opacity-0 group-hover:opacity-100"
        }`}
        title="Dodaj blok"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-1 flex gap-1">
          {[
            { type: "heading" as const, icon: Type, label: "Naslov" },
            { type: "text" as const, icon: AlignLeft, label: "Tekst" },
            { type: "image" as const, icon: ImageIcon, label: "Slika" },
            { type: "gallery" as const, icon: Images, label: "Galerija" },
            { type: "stats" as const, icon: BarChart3, label: "Statistik" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => addSection(index, item.type)}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg hover:bg-[#163c6f]/5 transition text-center"
              >
                <Icon className="w-5 h-5 text-[#163c6f]" />
                <span className="text-[10px] font-medium text-gray-600">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
