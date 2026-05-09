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
import type { TradeMetrics } from "../types";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface SlippageTimelineProps {
  trades: TradeMetrics[];
}

export function SlippageTimeline({ trades }: SlippageTimelineProps) {
  const buys = trades.filter((t) => t.side === "BUY");
  const sells = trades.filter((t) => t.side === "SELL");

  return (
    <ChartCard
      title="Slippage over time"
      subtitle="Each point is one trade, sized by notional"
      legend={
        <>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "#2563eb" }} />
            Buy
          </span>
          <span className="legend-item">
            <span className="legend-swatch" style={{ background: "#ea580c" }} />
            Sell
          </span>
        </>
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            type="category"
            allowDuplicatedCategory={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#9ca3af" }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            dataKey="arrivalSlippageBps"
            name="Slippage"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#9ca3af" }}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <ZAxis dataKey="notional" range={[20, 200]} />
          <ReferenceLine y={0} stroke="#9ca3af" />
          <Tooltip
            cursor={{ stroke: "#9ca3af", strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as TradeMetrics | undefined;
              if (!row) return null;
              return (
                <ChartTooltip
                  active={active}
                  title={`${row.symbol} · ${row.date}`}
                  rows={[
                    { label: "Side", value: row.side },
                    { label: "Slippage vs arrival", value: `${row.arrivalSlippageBps.toFixed(1)} bps` },
                    { label: "Notional", value: `$${row.notional.toLocaleString()}` },
                    { label: "Strategy", value: row.strategy },
                  ]}
                />
              );
            }}
          />
          <Scatter data={buys} fill="#2563eb" fillOpacity={0.75} isAnimationActive={false} />
          <Scatter
            data={sells}
            fill="#ea580c"
            fillOpacity={0.75}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
