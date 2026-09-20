import { useMemo, useState } from "react";
import "./App.css";
import { AboutPanel } from "./components/AboutPanel";
import { CostByGroupChart } from "./components/CostByGroupChart";
import { FileDropOverlay } from "./components/FileDropOverlay";
import { FilterBar } from "./components/FilterBar";
import { RepoLink } from "./components/RepoLink";
import { ShareBreakdownChart } from "./components/ShareBreakdownChart";
import { SlippageHistogram } from "./components/SlippageHistogram";
import { SlippageTimeline } from "./components/SlippageTimeline";
import { SlippageVsSizeChart } from "./components/SlippageVsSizeChart";
import { StatTile } from "./components/StatTile";
import { ThemeToggle } from "./components/ThemeToggle";
import { TradesTable } from "./components/TradesTable";
import { UploadPanel, type DataSource } from "./components/UploadPanel";
import { downloadCsv, tradesToCsv } from "./lib/csv";
import { parseTradesFile } from "./lib/fileImport";
import { fmtBps, fmtUsd, fmtUsdCompact, fmtUsdFit, polarity } from "./lib/format";
import { classifySymbol } from "./lib/refData";
import { generateSampleTrades } from "./lib/sampleData";
import { computeMetrics, groupBy, summarize } from "./lib/tca";
import { useTheme } from "./lib/useTheme";
import type { Filters, RawTrade } from "./types";

const ALL: Filters = { symbol: "ALL", side: "ALL", strategy: "ALL" };
const SAMPLE_SOURCE: DataSource = { kind: "sample", name: "Sample data" };

const tone = (bps: number) => (polarity(bps) === "cost" ? "bad" : polarity(bps) === "improve" ? "good" : "neutral");

function App() {
  const { theme, setTheme } = useTheme();
  const [rawTrades, setRawTrades] = useState<RawTrade[]>(() => generateSampleTrades());
  const [source, setSource] = useState<DataSource>(SAMPLE_SOURCE);
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(ALL);

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
    setLoadingName(file.name);
    try {
      const trades = await parseTradesFile(file);
      if (trades.length === 0) throw new Error("That file has a header row but no trades.");
      setRawTrades(trades);
      setSource({ kind: "file", name: file.name });
      setFilters(ALL);
      setError(null);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "The file could not be parsed.";
      setError(`Could not load ${file.name}. ${reason}`);
    } finally {
      setLoadingName(null);
    }
  };

  const loadSample = () => {
    setRawTrades(generateSampleTrades());
    setSource(SAMPLE_SOURCE);
    setFilters(ALL);
    setError(null);
  };

  const improvedCount = Math.round((summary.pctPriceImprovement * summary.tradeCount) / 100);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1 className="brand-title">
            TRANSACTION COST ANALYSIS TOOL{" "}
            <span className="go-key" aria-hidden="true">
              &lt;GO&gt;
            </span>
          </h1>
          <p className="brand-sub">
            Slippage against arrival price and VWAP, by symbol, strategy, and venue
          </p>
        </div>
        <nav className="header-actions" aria-label="Page">
          <a className="btn" href="#about">
            About
          </a>
          <RepoLink />
          <ThemeToggle theme={theme} onChange={setTheme} />
        </nav>
      </header>

      <main className="dashboard">
        <section className="toolbar" aria-label="Data and filters">
          <UploadPanel
            source={source}
            tradeCount={rawTrades.length}
            loadingName={loadingName}
            onFile={handleFile}
            onLoadSample={loadSample}
          />
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(ALL)}
            symbols={symbols}
            strategies={strategies}
          />
          {error && (
            <p className="toolbar-error" role="alert">
              {error}
            </p>
          )}
        </section>

        {filtered.length === 0 ? (
          <section className="empty-state" aria-live="polite">
            <h2 className="empty-state-title">No trades match these filters</h2>
            <p>
              None of the {rawTrades.length.toLocaleString()} loaded trades fit this combination
              of symbol, side, and strategy.
            </p>
            <button type="button" className="btn" onClick={() => setFilters(ALL)}>
              Clear filters
            </button>
          </section>
        ) : (
          <>
            <section aria-label="Summary">
              <dl className="kpi-strip">
                <StatTile
                  hero
                  label="Avg slippage vs arrival"
                  value={fmtBps(summary.avgArrivalBps)}
                  sublabel="Notional-weighted. Positive is a cost."
                  tone={tone(summary.avgArrivalBps)}
                />
                <StatTile
                  label="Avg vs VWAP"
                  value={fmtBps(summary.avgVwapBps)}
                  sublabel="Notional-weighted"
                  tone={tone(summary.avgVwapBps)}
                />
                <StatTile
                  label="Cost vs arrival"
                  value={fmtUsdFit(summary.totalArrivalCostUsd)}
                  title={fmtUsd(summary.totalArrivalCostUsd)}
                  sublabel="Total, in dollars"
                  tone={
                    summary.totalArrivalCostUsd > 0.5
                      ? "bad"
                      : summary.totalArrivalCostUsd < -0.5
                        ? "good"
                        : "neutral"
                  }
                />
                <StatTile
                  label="Price improved"
                  value={`${summary.pctPriceImprovement.toFixed(0)}%`}
                  sublabel={`${improvedCount.toLocaleString()} of ${summary.tradeCount.toLocaleString()} trades`}
                />
                <StatTile
                  label="Trades"
                  value={summary.tradeCount.toLocaleString()}
                  sublabel={`${bySymbol.length} ${bySymbol.length === 1 ? "symbol" : "symbols"}`}
                />
                <StatTile
                  label="Notional"
                  value={fmtUsdCompact(summary.totalNotional)}
                  title={fmtUsd(summary.totalNotional)}
                  sublabel={fmtUsd(summary.totalNotional)}
                />
                <StatTile
                  label="Shares"
                  value={summary.totalQuantity.toLocaleString()}
                  sublabel="Total quantity"
                />
              </dl>
            </section>

            <section className="page-section" aria-labelledby="execution-cost">
              <div className="section-header">
                <h2 className="section-title" id="execution-cost">
                  Execution cost
                </h2>
                <p className="section-subtitle">
                  Slippage vs. arrival price by symbol, strategy, size, and over time
                </p>
              </div>
              <div className="chart-grid">
                <CostByGroupChart
                  title="Cost by symbol"
                  subtitle="Notional-weighted avg vs arrival, in bps"
                  data={bySymbol}
                />
                <CostByGroupChart
                  title="Cost by strategy"
                  subtitle="Notional-weighted avg vs arrival, in bps"
                  data={byStrategy}
                />
                <SlippageHistogram values={filtered.map((t) => t.arrivalSlippageBps)} />
                <SlippageVsSizeChart trades={filtered} />
                <SlippageTimeline trades={filtered} />
              </div>
            </section>

            <section className="page-section" aria-labelledby="composition">
              <div className="section-header">
                <h2 className="section-title" id="composition">
                  Portfolio composition
                </h2>
                <p className="section-subtitle">Share of notional by venue, sector, and market cap</p>
              </div>
              <div className="chart-grid chart-grid-3">
                <ShareBreakdownChart
                  title="Venue breakdown"
                  subtitle="Share of notional by execution venue"
                  data={byVenue}
                />
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

            <section className="page-section" aria-labelledby="blotter">
              <div className="section-header">
                <h2 className="section-title" id="blotter">
                  Trade blotter
                </h2>
                <p className="section-subtitle">
                  {filtered.length === rawTrades.length
                    ? `${filtered.length.toLocaleString()} trades`
                    : `${filtered.length.toLocaleString()} of ${rawTrades.length.toLocaleString()} trades`}
                  . Slippage in bps.
                </p>
                <button
                  type="button"
                  className="btn section-action"
                  onClick={() => downloadCsv("tca-trades.csv", tradesToCsv(filtered))}
                >
                  Export CSV
                </button>
              </div>
              <TradesTable trades={filtered} />
            </section>
          </>
        )}

        <section className="page-section" id="about">
          <AboutPanel />
        </section>
      </main>

      <footer className="footer">
        <p>Runs entirely in the browser. Uploaded files are never sent to a server.</p>
      </footer>

      <FileDropOverlay onFile={handleFile} />
    </div>
  );
}

export default App;
