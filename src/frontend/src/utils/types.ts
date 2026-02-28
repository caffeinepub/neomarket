// ─── Market Data Types ────────────────────────────────────────────────────────

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number; // in selected currency
  change24h: number; // percentage change
  changeAbs: number; // absolute change
  sparkline: number[]; // 20 data points
  category: "metal" | "crypto" | "forex";
  iconUrl?: string; // crypto icon URL
  marketCap?: string; // formatted string e.g. "1.2T"
  volume24h?: string; // formatted string
}

export type TimePeriod = "1D" | "7D" | "1M" | "3M" | "1Y" | "MAX";

export interface HistoricalData {
  labels: string[];
  values: number[];
}

export type CurrencyCode =
  | "USD"
  | "INR"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AED"
  | "AUD"
  | "CAD"
  | "SGD"
  | "CNY";

export interface CurrencyOption {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
];

export const getCurrencySymbol = (code: CurrencyCode): string => {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
};
