import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GroupStats } from "../types";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface ShareBreakdownChartProps {
  title: string;
  subtitle?: string;
  data: GroupStats[];
}

const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function ShareBreakdownChart({ title, subtitle, data }: ShareBreakdownChartProps) {
  const totalNotional = data.reduce((s, d) => s + d.notional, 0);
  const rows = data
    .map((d) => ({ ...d, pct: totalNotional === 0 ? 0 : (100 * d.notional) / totalNotional }))
    .sort((a, b) => b.pct - a.pct);
  const rowHeight = 30;

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={Math.max(140, rows.length * rowHeight)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="key"
            width={140}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--gridline)", opacity: 0.5 }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (GroupStats & { pct: number }) | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={row.key}
                  rows={[
                    { label: "Share of notional", value: `${row.pct.toFixed(1)}%` },
                    { label: "Notional", value: fmtUsd(row.notional) },
                    { label: "Trades", value: String(row.count) },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="pct"
            fill="var(--series-blue)"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
