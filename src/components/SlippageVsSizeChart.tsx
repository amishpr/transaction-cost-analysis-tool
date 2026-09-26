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
import { fmtUsdCompact } from "../lib/format";
import { niceTicks, tickDecimals, zeroAnchoredTicks } from "../lib/scale";
import type { TradeMetrics } from "../types";
import { ChartCard, ChartLegend } from "./ChartCard";
import { AXIS_LINE, AXIS_TICK, SIDE_LEGEND } from "./chartTheme";
import { TradeTooltip } from "./ChartTooltip";

interface SlippageVsSizeChartProps {
  trades: TradeMetrics[];
}

// Compact dollar ticks without the forced decimal: "$250K", "$1M".
const fmtTickUsd = (v: number) => fmtUsdCompact(v).replace(".0", "");

/**
 * One point per trade, order notional against slippage. Larger clips tend to move the
 * price against the trader, so a rising cloud to the right is market impact.
 */
export function SlippageVsSizeChart({ trades }: SlippageVsSizeChartProps) {
  const buys = trades.filter((t) => t.side === "BUY");
  const sells = trades.filter((t) => t.side === "SELL");
  const xTicks = niceTicks(0, Math.max(1, ...trades.map((t) => t.notional)), 5);
  const yTicks = zeroAnchoredTicks(trades.map((t) => t.arrivalSlippageBps));
  const decimals = tickDecimals(yTicks);

  return (
    <ChartCard
      title="Slippage vs. order size"
      subtitle="Each point is one trade. A cloud that rises to the right is market impact."
      legend={<ChartLegend items={SIDE_LEGEND} />}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--gridline)" />
          <XAxis
            type="number"
            dataKey="notional"
            name="Notional"
            domain={[0, xTicks[xTicks.length - 1]]}
            ticks={xTicks}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            tickFormatter={fmtTickUsd}
          />
          <YAxis
            type="number"
            dataKey="arrivalSlippageBps"
            name="Slippage"
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            ticks={yTicks}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(decimals)}
          />
          <ZAxis range={[56, 56]} />
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
