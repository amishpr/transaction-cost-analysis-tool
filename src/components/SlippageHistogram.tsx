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
import { histogram, type HistogramBin } from "../lib/tca";
import { niceTicks, tickDecimals } from "../lib/scale";
import { ChartCard, ChartLegend } from "./ChartCard";
import { AXIS_LINE, AXIS_TICK, POLARITY_LEGEND } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface SlippageHistogramProps {
  values: number[];
}

export function SlippageHistogram({ values }: SlippageHistogramProps) {
  const bins = histogram(values, 14);
  const edges = bins.length > 0 ? [...bins.map((b) => b.from), bins[bins.length - 1].to] : [0, 1];
  // Label every edge when there is room, otherwise every other one, keeping zero labeled.
  const width = bins.length > 0 ? bins[0].to - bins[0].from : 1;
  const ticks =
    edges.length > 12 ? edges.filter((e) => Math.round(e / width) % 2 === 0) : edges;
  const decimals = tickDecimals(edges);
  const countTicks = niceTicks(0, Math.max(1, ...bins.map((b) => b.count)), 5, true);

  return (
    <ChartCard
      title="Slippage distribution"
      subtitle="Trades per bucket of slippage vs arrival price, in bps"
      legend={<ChartLegend items={POLARITY_LEGEND} />}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={bins} margin={{ top: 8, right: 12, bottom: 0, left: -8 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            dataKey="mid"
            domain={[edges[0], edges[edges.length - 1]]}
            ticks={ticks}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(decimals)}
          />
          <YAxis
            ticks={countTicks}
            domain={[0, countTicks[countTicks.length - 1]]}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <ReferenceLine x={0} stroke="var(--text-muted)" />
          <Tooltip
            cursor={{ fill: "var(--row-hover)" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as HistogramBin | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={`${row.from.toFixed(decimals)} to ${row.to.toFixed(decimals)} bps`}
                  rows={[{ label: "Trades", value: String(row.count) }]}
                />
              );
            }}
          />
          <Bar dataKey="count" isAnimationActive={false}>
            {bins.map((b) => (
              <Cell key={b.from} fill={b.from >= 0 ? "var(--cost)" : "var(--improve)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
