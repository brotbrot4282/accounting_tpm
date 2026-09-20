"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/format";

export interface CashFlowPoint {
  name: string;
  pemasukan: number;
  pengeluaran: number;
}

export default function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={70}
            tickFormatter={(v: number) =>
              v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${v / 1000}k`
            }
          />
          <Tooltip
            formatter={(value) => formatRupiah(Number(value))}
            labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #3f3f46",
              backgroundColor: "#1c1c1f",
              fontSize: 12,
              color: "#f8fafc",
            }}
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#e4e4e7" }} />
          <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}