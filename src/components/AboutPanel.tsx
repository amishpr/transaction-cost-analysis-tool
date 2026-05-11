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
            <span className="about-term">basis points (bps)</span> — 1 bps = 0.01% of price. A
            positive number means the fill cost more than the benchmark; a negative number means
            it beat the benchmark, i.e. price improvement.
          </p>
          <p>
            This dashboard scores a set of trade fills against two benchmark prices, then breaks
            the cost down by symbol, strategy, and side so you can see where execution is
            expensive. Load a CSV of fills below, or start with the built-in sample data.
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
        </dl>
      </div>
    </ChartCard>
  );
}
