import { useMemo, useState } from "react";
import "./App.css";
import { StatTile } from "./components/StatTile";
import { generateSampleTrades } from "./lib/sampleData";
import { computeMetrics, summarize } from "./lib/tca";
import type { RawTrade } from "./types";

const fmtBps = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} bps`;
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function App() {
  const [rawTrades] = useState<RawTrade[]>(() => generateSampleTrades());

  const allMetrics = useMemo(() => rawTrades.map(computeMetrics), [rawTrades]);

  const summary = useMemo(() => summarize(allMetrics), [allMetrics]);

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
    </main>
  );
}

export default App;
