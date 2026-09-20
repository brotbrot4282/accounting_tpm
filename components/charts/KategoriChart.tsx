"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/format";

export interface KategoriPoint {
  name: string;
  value: number;
  color: string;
}

export default function KategoriChart({
  data,
  total,
}: {
  data: KategoriPoint[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Belum ada data.
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-44 w-44 shrink-0 sm:mx-0 sm:h-52 sm:w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatRupiah(Number(value))}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #3f3f46",
                  backgroundColor: "#1c1c1f",
                  fontSize: 12,
                  color: "#f8fafc",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="max-w-[120px] truncate text-sm font-bold text-slate-100">
              {formatRupiah(total)}
            </p>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {data.slice(0, 7).map((d) => (
            <li key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-300">
                {d.name}
              </span>
              <span className="shrink-0 font-medium text-slate-200">
                {formatRupiah(d.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {data.length > 7 ? (
        <p className="mt-3 text-xs text-slate-400">
          +{data.length - 7} kategori lainnya.
        </p>
      ) : null}
    </div>
  );
}