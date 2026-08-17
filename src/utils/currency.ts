export type CurrencyConfig = {
  code: string;
  symbol: string;
};

export function getCurrencyFromAddress(address?: string | null): CurrencyConfig {
  if (!address) return { code: "INR", symbol: "₹" };
  const lower = address.toLowerCase();
  
  if (lower.includes("united states") || lower.includes("usa") || lower.includes("new york") || lower.includes("los angeles")) {
    return { code: "USD", symbol: "$" };
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
  
  return { code: "INR", symbol: "₹" };
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
