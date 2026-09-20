import { REQUIRED_COLUMNS } from "../lib/tradeRows";
import { ChartCard } from "./ChartCard";
import "./AboutPanel.css";

export function AboutPanel() {
  return (
    <ChartCard title="About this tool" headingLevel={2}>
      <div className="about-panel">
        <div className="about-text">
          <p>
            <span className="about-term">Slippage</span> is the gap between the price you
            expected to trade at and the price you actually got, expressed in{" "}
            <span className="about-term">basis points (bps)</span>, where 1 bps = 0.01% of price.
            A positive number means the fill cost more than the benchmark. A negative number
            means it beat the benchmark, which is called price improvement.
          </p>
          <p>
            This dashboard scores a set of trade fills against two benchmark prices, then breaks
            the cost down by symbol, strategy, venue, and side so you can see where execution is
            expensive. It starts with generated sample data. Upload a CSV or Excel file of your
            own fills to replace it. Files are read in your browser and are never sent to a
            server.
          </p>
        </div>
        <dl className="about-glossary">
          <div>
            <dt>Arrival price</dt>
            <dd>
              The market price the moment the order was sent. Slippage vs. arrival captures the
              full cost of the trade, including any delay before execution started.
            </dd>
          </div>
          <div>
            <dt>VWAP</dt>
            <dd>
              Volume-weighted average price over the execution window. Slippage vs. VWAP isolates
              how your execution style compared to the rest of the market during the trade.
            </dd>
          </div>
          <div>
            <dt>Bps</dt>
            <dd>Basis points. 1 bps = 0.01% of price; 100 bps = 1%.</dd>
          </div>
          <div>
            <dt>File format</dt>
            <dd>
              One row per fill, with a header row naming these columns:{" "}
              {REQUIRED_COLUMNS.map((c, i) => (
                <span key={c}>
                  <code>{c}</code>
                  {i < REQUIRED_COLUMNS.length - 1 ? ", " : "."}
                </span>
              ))}{" "}
              Side is BUY or SELL.
            </dd>
          </div>
        </dl>
      </div>
    </ChartCard>
  );
}
