import { useMemo, useState } from "react";
import "./App.css";
import { CostByGroupChart } from "./components/CostByGroupChart";
import { FilterBar } from "./components/FilterBar";
import { SlippageHistogram } from "./components/SlippageHistogram";
import { SlippageTimeline } from "./components/SlippageTimeline";
import { StatTile } from "./components/StatTile";
import { TradesTable } from "./components/TradesTable";
import { generateSampleTrades } from "./lib/sampleData";
import { computeMetrics, groupBy, summarize } from "./lib/tca";
import type { Filters, RawTrade } from "./types";

const fmtBps = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} bps`;
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function App() {
  const [rawTrades] = useState<RawTrade[]>(() => generateSampleTrades());
  const [filters, setFilters] = useState<Filters>({ symbol: "ALL", side: "ALL", strategy: "ALL" });

  const allMetrics = useMemo(() => rawTrades.map(computeMetrics), [rawTrades]);

  const symbols = useMemo(
    () => Array.from(new Set(rawTrades.map((t) => t.symbol))).sort(),
    [rawTrades],
  );
  const strategies = useMemo(
    () => Array.from(new Set(rawTrades.map((t) => t.strategy))).sort(),
    [rawTrades],
  );

  const filtered = useMemo(
    () =>
      allMetrics.filter(
        (t) =>
          (filters.symbol === "ALL" || t.symbol === filters.symbol) &&
          (filters.side === "ALL" || t.side === filters.side) &&
          (filters.strategy === "ALL" || t.strategy === filters.strategy),
      ),
    [allMetrics, filters],
  );

  const summary = useMemo(() => summarize(filtered), [filtered]);
  const bySymbol = useMemo(() => groupBy(filtered, (t) => t.symbol), [filtered]);
  const byStrategy = useMemo(() => groupBy(filtered, (t) => t.strategy), [filtered]);

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

      <FilterBar filters={filters} onChange={setFilters} symbols={symbols} strategies={strategies} />

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
          <SlippageHistogram values={filtered.map((t) => t.arrivalSlippageBps)} />
          <SlippageTimeline trades={filtered} />
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <h2 className="section-title">Trade blotter</h2>
          <span className="section-subtitle">{filtered.length} trades</span>
        </div>
        <TradesTable trades={filtered} />
      </section>
    </main>
  );
}

export default App;
