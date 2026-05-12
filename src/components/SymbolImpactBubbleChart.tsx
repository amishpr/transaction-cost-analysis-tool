import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { GroupStats } from "../types";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface SymbolImpactBubbleChartProps {
  data: GroupStats[];
}

function fmtTick(v: number) {
  const rounded = Math.round(v * 10) / 10;
  return (rounded === 0 ? 0 : rounded).toFixed(1);
}

export function SymbolImpactBubbleChart({ data }: SymbolImpactBubbleChartProps) {
  const sorted = [...data].sort((a, b) => b.quantity - a.quantity);
  const rowHeight = 32;

  return (
    <ChartCard
      title="Slippage vs. order size"
      subtitle="One bubble per symbol, sized by total shares traded"
      legend={
        <>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "var(--series-red)" }} />
            Cost
          </span>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "var(--series-blue)" }} />
            Price improvement
          </span>
        </>
      }
    >
      <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * rowHeight)}>
        <ScatterChart margin={{ top: 8, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="var(--gridline)" />
          <XAxis
            type="number"
            dataKey="avgArrivalBps"
            name="Avg slippage"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            tickFormatter={fmtTick}
          />
          <YAxis
            type="category"
            dataKey="key"
            name="Symbol"
            width={64}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
          />
          <ZAxis dataKey="quantity" range={[250, 1800]} />
          <ReferenceLine x={0} stroke="var(--baseline)" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--baseline)" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as GroupStats | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={row.key}
                  rows={[
                    { label: "Avg slippage vs arrival", value: `${row.avgArrivalBps.toFixed(1)} bps` },
                    { label: "Total shares", value: row.quantity.toLocaleString() },
                    { label: "Trades", value: String(row.count) },
                  ]}
                />
              );
            }}
          />
          <Scatter data={sorted} isAnimationActive={false}>
            {sorted.map((d) => (
              <Cell key={d.key} fill={d.avgArrivalBps >= 0 ? "var(--series-red)" : "var(--series-blue)"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
