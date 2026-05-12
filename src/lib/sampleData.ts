import type { RawTrade, Side } from "../types";

// Deterministic PRNG so sample data is stable across reloads.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOLS: { symbol: string; basePrice: number; sizeMultiplier: number }[] = [
  { symbol: "AAPL", basePrice: 228, sizeMultiplier: 1 },
  { symbol: "MSFT", basePrice: 421, sizeMultiplier: 1 },
  { symbol: "GOOGL", basePrice: 172, sizeMultiplier: 1 },
  { symbol: "AMZN", basePrice: 186, sizeMultiplier: 1 },
  { symbol: "NVDA", basePrice: 118, sizeMultiplier: 1 },
  { symbol: "TSLA", basePrice: 246, sizeMultiplier: 1 },
  { symbol: "META", basePrice: 512, sizeMultiplier: 1 },
  { symbol: "JPM", basePrice: 214, sizeMultiplier: 1 },
  // Mid/small caps trade at a fraction of the mega-cap price, so clip size
  // is scaled up to keep notional per trade in a comparable range, the way
  // a desk sizing orders by target dollar exposure actually would.
  { symbol: "PRGO", basePrice: 28, sizeMultiplier: 6 },
  { symbol: "OXM", basePrice: 45, sizeMultiplier: 4 },
];

// "Implementation Shortfall" replaces the old "Market" entry (an order type,
// not an algo strategy) and "Dark Aggregator" replaces "Dark Pool" (a venue
// concept, not a strategy) to match how execution desks actually name these.
const STRATEGIES = ["VWAP", "TWAP", "POV", "Dark Aggregator", "Implementation Shortfall"];
const VENUES = [
  "NASDAQ",
  "NYSE",
  "UBS",
  "Goldman Sachs Dark Pool",
  "OneChronos",
  "Citi",
  "Barclays",
  "Jane Street",
  "Old Mission",
  "Citadel Securities",
];

export function generateSampleTrades(count = 160, seed = 42): RawTrade[] {
  const rand = mulberry32(seed);
  const today = new Date();
  const trades: RawTrade[] = [];

  for (let i = 0; i < count; i++) {
    const { symbol, basePrice, sizeMultiplier } = SYMBOLS[Math.floor(rand() * SYMBOLS.length)];
    const side: Side = rand() > 0.5 ? "BUY" : "SELL";
    const strategy = STRATEGIES[Math.floor(rand() * STRATEGIES.length)];
    const venue = VENUES[Math.floor(rand() * VENUES.length)];

    const daysAgo = Math.floor(rand() * 30);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    // Drift the "market" a little per trade so prices look organic.
    const drift = (rand() - 0.5) * 0.01;
    const arrivalPrice = +(basePrice * (1 + drift)).toFixed(2);

    // Strategy affects typical slippage magnitude: passive strategies
    // (TWAP/VWAP/Dark Aggregator) tend to track benchmarks more closely than
    // an urgent Implementation Shortfall fill, plus general market noise.
    const strategyNoise: Record<string, number> = {
      VWAP: 4,
      TWAP: 5,
      POV: 6,
      "Dark Aggregator": 3,
      "Implementation Shortfall": 12,
    };
    const noiseBps = strategyNoise[strategy] ?? 6;

    // Draw a clip size on a common scale, then apply the symbol's size
    // multiplier for its actual share count. Impact is judged against the
    // common scale so a cheaper name with more shares per trade doesn't
    // look artificially high-impact next to a mega-cap.
    const baseClip = Math.round((200 + rand() * 4800) / 10) * 10;
    const quantity = baseClip * sizeMultiplier;
    // Market impact: larger clips tend to move the price against you, on
    // top of ordinary strategy noise, so slippage isn't independent of size.
    const impactBps = Math.max(0, (baseClip - 2000) / 1000) * 0.5;

    const slippageBps = (rand() - 0.42) * noiseBps + impactBps; // slight adverse bias, like real desks
    const sign = side === "BUY" ? 1 : -1;
    const execPrice = +(arrivalPrice * (1 + (sign * slippageBps) / 10000)).toFixed(2);

    const vwapNoiseBps = (rand() - 0.5) * (noiseBps * 0.8);
    const vwapPrice = +(arrivalPrice * (1 + vwapNoiseBps / 10000)).toFixed(2);

    trades.push({
      id: `T${(i + 1).toString().padStart(4, "0")}`,
      date: date.toISOString().slice(0, 10),
      symbol,
      side,
      quantity,
      arrivalPrice,
      execPrice,
      vwapPrice,
      venue,
      strategy,
    });
  }

  return trades.sort((a, b) => a.date.localeCompare(b.date));
}
