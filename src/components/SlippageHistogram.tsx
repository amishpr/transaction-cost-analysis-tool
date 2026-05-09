import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { histogram } from "../lib/tca";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface SlippageHistogramProps {
  values: number[];
}

export function SlippageHistogram({ values }: SlippageHistogramProps) {
  const bins = histogram(values, 14);

  return (
    <ChartCard
      title="Slippage distribution"
      subtitle="Per-trade slippage vs arrival price, in basis points"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={bins} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="from"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <ReferenceLine x={0} stroke="var(--baseline)" />
          <Tooltip
            cursor={{ fill: "var(--gridline)", opacity: 0.5 }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as
                | { from: number; to: number; count: number }
                | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={`${row.from.toFixed(1)} to ${row.to.toFixed(1)} bps`}
                  rows={[{ label: "Trades", value: String(row.count) }]}
                />
              );
            }}
          />
          <Bar
            dataKey="count"
            fill="var(--series-blue)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
