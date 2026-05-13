import { useMemo, useState } from "react";
import "./App.css";
import { AboutPanel } from "./components/AboutPanel";
import { CostByGroupChart } from "./components/CostByGroupChart";
import { FilterBar } from "./components/FilterBar";
import { ShareBreakdownChart } from "./components/ShareBreakdownChart";
import { SlippageHistogram } from "./components/SlippageHistogram";
import { SlippageTimeline } from "./components/SlippageTimeline";
import { StatTile } from "./components/StatTile";
import { SymbolImpactBubbleChart } from "./components/SymbolImpactBubbleChart";
import { TradesTable } from "./components/TradesTable";
import { UploadPanel } from "./components/UploadPanel";
import { downloadCsv, tradesToCsv } from "./lib/csv";
import { parseTradesFile } from "./lib/fileImport";
import { classifySymbol } from "./lib/refData";
import { generateSampleTrades } from "./lib/sampleData";
import { computeMetrics, groupBy, summarize } from "./lib/tca";
import type { Filters, RawTrade } from "./types";

const fmtBps = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} bps`;
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function App() {
  const [rawTrades, setRawTrades] = useState<RawTrade[]>(() => generateSampleTrades());
  const [error, setError] = useState<string | null>(null);
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
  const byVenue = useMemo(() => groupBy(filtered, (t) => t.venue), [filtered]);
  const bySector = useMemo(
    () => groupBy(filtered, (t) => classifySymbol(t.symbol).sector),
    [filtered],
  );
  const byCapTier = useMemo(
    () => groupBy(filtered, (t) => classifySymbol(t.symbol).capTier),
    [filtered],
  );

  const handleFile = async (file: File) => {
    try {
      const trades = await parseTradesFile(file);
      setRawTrades(trades);
      setFilters({ symbol: "ALL", side: "ALL", strategy: "ALL" });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse that file.");
    }
  };

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

      <AboutPanel />

      <UploadPanel
        onFile={handleFile}
        onLoadSample={() => {
          setRawTrades(generateSampleTrades());
          setFilters({ symbol: "ALL", side: "ALL", strategy: "ALL" });
          setError(null);
        }}
        onExport={() => downloadCsv("tca-trades.csv", tradesToCsv(filtered))}
        error={error}
      />

      <FilterBar filters={filters} onChange={setFilters} symbols={symbols} strategies={strategies} />

      <section className="stat-grid">
        <StatTile label="Trades analyzed" value={summary.tradeCount.toLocaleString()} />
        <StatTile label="Total notional" value={fmtUsd(summary.totalNotional)} />
        <StatTile
          label="Total shares"
          value={summary.totalQuantity.toLocaleString()}
          sublabel="Basket quantity"
        />
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
          <h2 className="section-title">Portfolio composition</h2>
          <span className="section-subtitle">Venue routing, sector, market cap, and size vs. slippage</span>
        </div>
        <div className="chart-grid">
          <ShareBreakdownChart
            title="Venue breakdown"
            subtitle="Share of notional by execution venue"
            data={byVenue}
          />
          <SymbolImpactBubbleChart data={bySymbol} />
          <ShareBreakdownChart
            title="Sector breakdown"
            subtitle="Share of notional by sector"
            data={bySector}
          />
          <ShareBreakdownChart
            title="Market cap breakdown"
            subtitle="Share of notional by cap tier"
            data={byCapTier}
          />
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
