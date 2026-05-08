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

const SYMBOLS: { symbol: string; basePrice: number }[] = [
  { symbol: "AAPL", basePrice: 228 },
  { symbol: "MSFT", basePrice: 421 },
  { symbol: "GOOGL", basePrice: 172 },
  { symbol: "AMZN", basePrice: 186 },
  { symbol: "NVDA", basePrice: 118 },
  { symbol: "TSLA", basePrice: 246 },
  { symbol: "META", basePrice: 512 },
  { symbol: "JPM", basePrice: 214 },
  { symbol: "PRGO", basePrice: 28 },
  { symbol: "OXM", basePrice: 45 },
];

const STRATEGIES = ["VWAP", "TWAP", "POV", "Dark Pool", "Market"];
const VENUES = ["NASDAQ", "NYSE", "ARCA", "BATS", "IEX", "EDGX"];

export function generateSampleTrades(count = 160, seed = 42): RawTrade[] {
  const rand = mulberry32(seed);
  const today = new Date();
  const trades: RawTrade[] = [];

  for (let i = 0; i < count; i++) {
    const { symbol, basePrice } = SYMBOLS[Math.floor(rand() * SYMBOLS.length)];
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
    // (TWAP/VWAP/Dark Pool) tend to track benchmarks more closely than an
    // urgent market order, plus general market noise.
    const strategyNoise: Record<string, number> = {
      VWAP: 4,
      TWAP: 5,
      POV: 6,
      "Dark Pool": 3,
      Market: 12,
    };
    const noiseBps = strategyNoise[strategy] ?? 6;

    const quantity = Math.round((200 + rand() * 4800) / 10) * 10;

    const slippageBps = (rand() - 0.42) * noiseBps; // slight adverse bias, like real desks
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
