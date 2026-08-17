export type CurrencyConfig = {
  code: string;
  symbol: string;
};

export function getCurrencyFromAddress(address?: string | null): CurrencyConfig {
  if (!address) return { code: "USD", symbol: "$" };
  const lower = address.toLowerCase();
  
  if (lower.includes("india") || lower.includes("in")) {
    // Specifically verify boundaries to prevent match errors on strings like "New York, USA" or "Indiana, USA"
    if (/\b(india|in)\b/i.test(lower) || lower.includes(", india") || lower.endsWith(" india")) {
      return { code: "INR", symbol: "₹" };
    }
  }
  if (lower.includes("united kingdom") || lower.includes("gb") || lower.includes("uk") || lower.includes("london") || lower.includes("england")) {
    return { code: "GBP", symbol: "£" };
  }
  if (lower.includes("canada") || lower.includes(" ca")) {
    return { code: "CAD", symbol: "CA$" };
  }
  if (lower.includes("australia") || lower.includes(" au")) {
    return { code: "AUD", symbol: "A$" };
  }
  if (lower.includes("france") || lower.includes("germany") || lower.includes("italy") || lower.includes("spain") || lower.includes("netherlands") || lower.includes("europe") || lower.includes("paris") || lower.includes("berlin")) {
    return { code: "EUR", symbol: "€" };
  }
  if (lower.includes("united arab emirates") || lower.includes("dubai") || lower.includes("uae") || lower.includes("abu dhabi")) {
    return { code: "AED", symbol: "AED " };
  }
  
  return { code: "USD", symbol: "$" };
}

export function convertCurrencyAmount(baseUsdAmount: number, targetCode: string): number {
  switch (targetCode) {
    case "INR":
      return Math.round(baseUsdAmount * 83.5);
    case "GBP":
      return Math.round(baseUsdAmount * 0.78);
    case "EUR":
      return Math.round(baseUsdAmount * 0.92);
    case "CAD":
      return Math.round(baseUsdAmount * 1.37);
    case "AUD":
      return Math.round(baseUsdAmount * 1.52);
    case "AED":
      return Math.round(baseUsdAmount * 3.67);
    default:
      return baseUsdAmount;
  }
}
