export type CapTier = "Large Cap" | "Mid Cap" | "Small Cap" | "Unclassified";

interface SecurityReference {
  sector: string;
  capTier: CapTier;
}

// Hardcoded for the sample universe. A production system would join trades
// against a real security master / reference data feed instead.
const SECURITY_REFERENCE: Record<string, SecurityReference> = {
  AAPL: { sector: "Technology", capTier: "Large Cap" },
  MSFT: { sector: "Technology", capTier: "Large Cap" },
  NVDA: { sector: "Technology", capTier: "Large Cap" },
  GOOGL: { sector: "Communication Services", capTier: "Large Cap" },
  META: { sector: "Communication Services", capTier: "Large Cap" },
  AMZN: { sector: "Consumer Discretionary", capTier: "Large Cap" },
  TSLA: { sector: "Consumer Discretionary", capTier: "Large Cap" },
  JPM: { sector: "Financials", capTier: "Large Cap" },
  PRGO: { sector: "Healthcare", capTier: "Mid Cap" },
  OXM: { sector: "Consumer Discretionary", capTier: "Small Cap" },
};

const UNCLASSIFIED: SecurityReference = { sector: "Unclassified", capTier: "Unclassified" };

export function classifySymbol(symbol: string): SecurityReference {
  return SECURITY_REFERENCE[symbol] ?? UNCLASSIFIED;
}
