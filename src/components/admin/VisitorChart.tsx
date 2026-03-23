"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; views: number }[];
}

export default function VisitorChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Nema podataka</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#163c6f" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#163c6f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#163c6f",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
          }}
          labelStyle={{ color: "#00c0f7" }}
          formatter={(value) => [String(value), "Posjeta"]}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#163c6f"
          strokeWidth={2}
          fill="url(#colorViews)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
