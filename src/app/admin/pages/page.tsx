"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, Clock, ArrowRight, Loader2, RefreshCw, Plus } from "lucide-react";

interface PageItem {
  slug: string;
  title: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch("/api/admin/pages", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Greška pri dohvaćanju stranica.");
      const data = await res.json();
      setPages(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("hr-HR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#163c6f] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#163c6f]">Stranice</h1>
          <p className="text-gray-500 mt-1 text-sm">Uredite sadržaj stranica web stranice</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPages(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Aktualiziraj
          </button>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#163c6f] text-white rounded-lg hover:bg-[#1a4a87] transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova stranica
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/pages/${page.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#00c0f7]/30 transition-all duration-300 block"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#163c6f]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#163c6f]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#163c6f] truncate">{page.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">/{page.slug}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(page.updatedAt)}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#00c0f7]">
                Uredi <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nema stranica za uređivanje.
        </div>
      )}
    </div>
  );
}
