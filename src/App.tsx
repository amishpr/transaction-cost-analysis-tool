import { useMemo, useState } from "react";
import "./App.css";
import { CostByGroupChart } from "./components/CostByGroupChart";
import { SlippageHistogram } from "./components/SlippageHistogram";
import { SlippageTimeline } from "./components/SlippageTimeline";
import { StatTile } from "./components/StatTile";
import { generateSampleTrades } from "./lib/sampleData";
import { computeMetrics, groupBy, summarize } from "./lib/tca";
import type { RawTrade } from "./types";

const fmtBps = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} bps`;
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function App() {
  const [rawTrades] = useState<RawTrade[]>(() => generateSampleTrades());

  const allMetrics = useMemo(() => rawTrades.map(computeMetrics), [rawTrades]);

  const summary = useMemo(() => summarize(allMetrics), [allMetrics]);
  const bySymbol = useMemo(() => groupBy(allMetrics, (t) => t.symbol), [allMetrics]);
  const byStrategy = useMemo(() => groupBy(allMetrics, (t) => t.strategy), [allMetrics]);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>
            TCA ANALYZER{" "}
            <span className="app-header-go" aria-hidden="true">
              &lt;GO&gt;
            </span>
          </h1>
          <p>TRANSACTION COST ANALYSIS — SLIPPAGE VS. ARRIVAL PRICE AND VWAP</p>
        </div>
      </header>

      <section className="stat-grid">
        <StatTile label="Trades analyzed" value={summary.tradeCount.toLocaleString()} />
        <StatTile label="Total notional" value={fmtUsd(summary.totalNotional)} />
        <StatTile
          label="Avg slippage vs arrival"
          value={fmtBps(summary.avgArrivalBps)}
          sublabel="Notional-weighted"
          tone={summary.avgArrivalBps <= 0 ? "good" : "bad"}
        />
        <StatTile
          label="Avg slippage vs VWAP"
          value={fmtBps(summary.avgVwapBps)}
          sublabel="Notional-weighted"
          tone={summary.avgVwapBps <= 0 ? "good" : "bad"}
        />
        <StatTile
          label="Total cost vs arrival"
          value={fmtUsd(summary.totalArrivalCostUsd)}
          tone={summary.totalArrivalCostUsd <= 0 ? "good" : "bad"}
        />
        <StatTile
          label="Trades with price improvement"
          value={`${summary.pctPriceImprovement.toFixed(0)}%`}
        />
      </section>

      <section className="page-section">
        <div className="section-header">
          <h2 className="section-title">Execution cost</h2>
          <span className="section-subtitle">Slippage vs. arrival price by symbol, strategy, and over time</span>
        </div>
        <div className="chart-grid">
          <CostByGroupChart title="Cost by symbol" subtitle="Notional-weighted avg vs arrival price" data={bySymbol} />
          <CostByGroupChart title="Cost by strategy" subtitle="Notional-weighted avg vs arrival price" data={byStrategy} />
          <SlippageHistogram values={allMetrics.map((t) => t.arrivalSlippageBps)} />
          <SlippageTimeline trades={allMetrics} />
        </div>
      </section>
    </main>
  );
}

export default App;
