import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtBps, fmtSigned, fmtUsd, polarity } from "../lib/format";
import { categoryAxisWidth, niceTicks, tickDecimals } from "../lib/scale";
import type { GroupStats } from "../types";
import { CategoryTick, ChartCard, ChartLegend } from "./ChartCard";
import { AXIS_LINE, AXIS_TICK, POLARITY_LEGEND } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface CostByGroupChartProps {
  title: string;
  subtitle?: string;
  data: GroupStats[];
}

interface ValueLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string | boolean | null;
}

// Prints the bar's value just past its end: right of cost bars, left of improvement bars.
function BarValueLabel({ x = 0, y = 0, width = 0, height = 0, value }: ValueLabelProps) {
  const v = Number(value);
  const [left, w] = [Number(x), Number(width)];
  const end = v >= 0 ? Math.max(left, left + w) : Math.min(left, left + w);
  return (
    <text
      x={end + (v >= 0 ? 6 : -6)}
      y={Number(y) + Number(height) / 2}
      dominantBaseline="central"
      textAnchor={v >= 0 ? "start" : "end"}
      fill="var(--text-primary)"
      fontSize={11}
      className="tabular"
    >
      {fmtSigned(v)}
    </text>
  );
}

export function CostByGroupChart({ title, subtitle, data }: CostByGroupChartProps) {
  const sorted = [...data].sort((a, b) => b.avgArrivalBps - a.avgArrivalBps);
  const values = sorted.map((d) => d.avgArrivalBps);
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  // Leave room left of the most negative bar for its value label.
  const ticks = niceTicks(lo < 0 ? lo - (hi - lo) * 0.12 : 0, hi, 5);
  const decimals = tickDecimals(ticks);
  const rowHeight = 30;

  return (
    <ChartCard title={title} subtitle={subtitle} legend={<ChartLegend items={POLARITY_LEGEND} />}>
      <ResponsiveContainer width="100%" height={Math.max(150, sorted.length * rowHeight + 30)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 44, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            domain={[ticks[0], ticks[ticks.length - 1]]}
            ticks={ticks}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(decimals)}
          />
          <YAxis
            type="category"
            dataKey="key"
            width={categoryAxisWidth(sorted.map((d) => d.key))}
            interval={0}
            tick={CategoryTick}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke="var(--text-muted)" />
          <Tooltip
            cursor={{ fill: "var(--row-hover)" }}
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
          <Bar dataKey="avgArrivalBps" maxBarSize={12} isAnimationActive={false}>
            {sorted.map((d) => (
              <Cell
                key={d.key}
                fill={polarity(d.avgArrivalBps) === "improve" ? "var(--improve)" : "var(--cost)"}
              />
            ))}
            <LabelList dataKey="avgArrivalBps" content={BarValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
