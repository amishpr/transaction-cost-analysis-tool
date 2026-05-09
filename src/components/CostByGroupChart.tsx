import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GroupStats } from "../types";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface CostByGroupChartProps {
  title: string;
  subtitle?: string;
  data: GroupStats[];
}

const fmtBps = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} bps`;
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function fmtTick(v: number) {
  const rounded = Math.round(v * 10) / 10;
  return (rounded === 0 ? 0 : rounded).toFixed(1);
}

export function CostByGroupChart({ title, subtitle, data }: CostByGroupChartProps) {
  const sorted = [...data].sort((a, b) => b.avgArrivalBps - a.avgArrivalBps);
  const rowHeight = 34;

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      legend={
        <>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "#dc2626" }} />
            Cost
          </span>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "#2563eb" }} />
            Price improvement
          </span>
        </>
      }
    >
      <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * rowHeight)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#9ca3af" }}
            tickLine={false}
            tickFormatter={fmtTick}
          />
          <YAxis
            type="category"
            dataKey="key"
            width={124}
            tick={{ fill: "#374151", fontSize: 11 }}
            axisLine={{ stroke: "#9ca3af" }}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke="#9ca3af" />
          <Tooltip
            cursor={{ fill: "#e5e7eb", opacity: 0.5 }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as GroupStats | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={row.key}
                  rows={[
                    { label: "Avg vs arrival", value: fmtBps(row.avgArrivalBps) },
                    { label: "Avg vs VWAP", value: fmtBps(row.avgVwapBps) },
                    { label: "Total cost", value: fmtUsd(row.totalArrivalCostUsd) },
                    { label: "Trades", value: String(row.count) },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="avgArrivalBps" radius={[4, 4, 4, 4]} maxBarSize={18} isAnimationActive={false}>
            {sorted.map((d) => (
              <Cell
                key={d.key}
                fill={d.avgArrivalBps >= 0 ? "#dc2626" : "#2563eb"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
