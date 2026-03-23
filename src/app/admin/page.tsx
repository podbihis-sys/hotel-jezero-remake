"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mountain, Camera, Calendar, Plus, ExternalLink, TrendingUp,
  Eye, Users, Clock, FileText, ArrowUpRight, BarChart3,
} from "lucide-react";
import dynamic from "next/dynamic";

const VisitorChart = dynamic(() => import("@/components/admin/VisitorChart"), { ssr: false });

interface EventItem {
  id: string;
  title: string;
  date: string;
  slug: string;
  pinned?: boolean;
  updated_at?: string;
}

interface Settings {
  piste_status: { open: boolean; openingDate?: string };
  cameras: Record<string, { name: string; active: boolean; visible: boolean }>;
}

interface PageVisit {
  path: string;
  count: number;
  label: string;
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Settings>({ piste_status: { open: false }, cameras: {} });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<PageVisit[]>([]);
  const [dailyViews, setDailyViews] = useState<{ date: string; views: number }[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, eventsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/settings", { headers: { "x-admin-token": token } }),
        fetch("/api/admin/events", { headers: { "x-admin-token": token } }),
        fetch("/api/analytics", { headers: { "x-admin-token": token } }),
      ]);
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings({ piste_status: s.piste_status || { open: false }, cameras: s.cameras || {} });
      }
      if (eventsRes.ok) setEvents((await eventsRes.json()).slice(0, 5));
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        const sorted = [...(analyticsData.pageViews || [])].sort((a: PageVisit, b: PageVisit) => b.count - a.count).slice(0, 10);
        setVisits(sorted);

        // Build daily views for chart (last 30 days)
        const dv: Record<string, number> = analyticsData.dailyViews || {};
        const last30: { date: string; views: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          last30.push({ date: key.slice(5), views: dv[key] || 0 });
        }
        setDailyViews(last30);
      }
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" /></div>;

  const activeCameras = Object.values(settings.cameras).filter(c => c.active).length;
  const totalCameras = Object.keys(settings.cameras).length;
  const totalVisits = visits.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Pregled stanja i statistike</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/events/new" className="flex items-center gap-2 bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#3D566E] transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Novi događaj
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            <ExternalLink className="w-4 h-4" /> Stranica
          </Link>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${settings.piste_status.open ? "bg-green-100" : "bg-red-100"}`}>
              <Mountain className={`w-5 h-5 ${settings.piste_status.open ? "text-green-600" : "text-red-600"}`} />
            </div>
            <Link href="/admin/skijaliste" className="text-gray-400 hover:text-[#2C3E50]"><ArrowUpRight className="w-4 h-4" /></Link>
          </div>
          <p className={`text-lg font-bold ${settings.piste_status.open ? "text-green-600" : "text-red-600"}`}>
            {settings.piste_status.open ? "Otvorene" : "Zatvorene"}
          </p>
          <p className="text-xs text-gray-500">Staze</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A55A]/10 flex items-center justify-center"><Camera className="w-5 h-5 text-[#C5A55A]" /></div>
            <Link href="/admin/skijaliste" className="text-gray-400 hover:text-[#2C3E50]"><ArrowUpRight className="w-4 h-4" /></Link>
          </div>
          <p className="text-lg font-bold text-[#2C3E50]">{activeCameras}/{totalCameras}</p>
          <p className="text-xs text-gray-500">Kamere online</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-lg font-bold text-[#2C3E50]">{totalVisits.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Posjeta (mjesec)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div>
            <Link href="/admin/events" className="text-gray-400 hover:text-[#2C3E50]"><ArrowUpRight className="w-4 h-4" /></Link>
          </div>
          <p className="text-lg font-bold text-[#2C3E50]">{events.length}</p>
          <p className="text-xs text-gray-500">Događaja</p>
        </div>
      </div>

      {/* Visitor Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2C3E50]" /> Posjete (zadnjih 30 dana)
          </h2>
        </div>
        <div className="p-5">
          <VisitorChart data={dailyViews} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Analytics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" /> Najpopularnije stranice
            </h2>
            <span className="text-xs text-gray-400">Zadnjih 30 dana</span>
          </div>
          <div className="divide-y divide-gray-50">
            {visits.map((visit, i) => {
              const maxCount = visits[0]?.count || 1;
              const percentage = Math.round((visit.count / maxCount) * 100);
              return (
                <div key={visit.path} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{visit.label}</span>
                      <span className="text-sm font-bold text-[#2C3E50] flex-shrink-0">{visit.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-[#2C3E50] to-[#C5A55A] h-1.5 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Events / Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Posljednje aktivnosti
            </h2>
            <Link href="/admin/events" className="text-[#C5A55A] hover:underline text-xs font-medium">Sve &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {events.length === 0 ? (
              <div className="p-5 text-center text-gray-400 text-sm">Nema aktivnosti.</div>
            ) : (
              events.map(event => (
                <div key={event.id} className="px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    {event.pinned && (
                      <span className="text-[10px] bg-[#C5A55A]/10 text-[#C5A55A] px-1.5 py-0.5 rounded font-medium flex-shrink-0">Pin</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
