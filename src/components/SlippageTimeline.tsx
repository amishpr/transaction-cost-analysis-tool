import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { tickDecimals, zeroAnchoredTicks } from "../lib/scale";
import type { TradeMetrics } from "../types";
import { ChartCard, ChartLegend } from "./ChartCard";
import { AXIS_LINE, AXIS_TICK, SIDE_LEGEND } from "./chartTheme";
import { TradeTooltip } from "./ChartTooltip";

interface SlippageTimelineProps {
  trades: TradeMetrics[];
}

export function SlippageTimeline({ trades }: SlippageTimelineProps) {
  const buys = trades.filter((t) => t.side === "BUY");
  const sells = trades.filter((t) => t.side === "SELL");
  const yTicks = zeroAnchoredTicks(trades.map((t) => t.arrivalSlippageBps));
  const decimals = tickDecimals(yTicks);

  return (
    <ChartCard
      title="Slippage over time"
      subtitle="Each point is one trade, sized by notional"
      legend={<ChartLegend items={SIDE_LEGEND} />}
      wide
    >
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--gridline)" />
          <XAxis
            dataKey="date"
            type="category"
            allowDuplicatedCategory={false}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            minTickGap={36}
          />
          <YAxis
            dataKey="arrivalSlippageBps"
            name="Slippage"
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            ticks={yTicks}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(decimals)}
          />
          <ZAxis dataKey="notional" range={[24, 220]} />
          <ReferenceLine y={0} stroke="var(--text-muted)" />
          <Tooltip
            cursor={{ stroke: "var(--baseline)" }}
            content={({ active, payload }) => (
              <TradeTooltip active={active} trade={payload?.[0]?.payload as TradeMetrics | undefined} />
            )}
          />
          <Scatter
            data={buys}
            fill="var(--buy)"
            fillOpacity={0.8}
            stroke="var(--surface-1)"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Scatter
            data={sells}
            fill="var(--sell)"
            fillOpacity={0.8}
            stroke="var(--surface-1)"
            strokeWidth={1}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
