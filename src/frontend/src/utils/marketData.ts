// ============================================================
// API CONFIGURATION — Replace with real API keys
// ============================================================
// biome-ignore lint/correctness/noUnusedVariables: used in commented-out real API calls below
const API_CONFIG = {
  metals: {
    baseUrl: "https://metals-api.com/api", // e.g. metals-api.com
    apiKey: "YOUR_METALS_API_KEY_HERE",
  },
  crypto: {
    baseUrl: "https://api.coingecko.com/api/v3", // CoinGecko free tier
    apiKey: "YOUR_CRYPTO_API_KEY_HERE",
  },
  forex: {
    baseUrl: "https://api.exchangerate-api.com/v4/latest", // ExchangeRate-API
    apiKey: "YOUR_FOREX_API_KEY_HERE",
  },
};

import type { HistoricalData, MarketAsset, TimePeriod } from "./types";

// ─── USD-based exchange rates (denominator) ──────────────────────────────────
const BASE_FOREX_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.0,
  AED: 3.67,
  AUD: 1.52,
  CAD: 1.37,
  SGD: 1.34,
  CNY: 7.24,
};

// ─── Dummy Metal Prices (USD per troy oz) ─────────────────────────────────────
const DUMMY_METALS: Omit<MarketAsset, "sparkline">[] = [
  {
    symbol: "XAU",
    name: "Gold",
    price: 2341.5,
    change24h: 0.82,
    changeAbs: 19.1,
    category: "metal",
    volume24h: "$48.2B",
  },
  {
    symbol: "XAG",
    name: "Silver",
    price: 28.47,
    change24h: 1.24,
    changeAbs: 0.35,
    category: "metal",
    volume24h: "$5.8B",
  },
  {
    symbol: "XPT",
    name: "Platinum",
    price: 1023.8,
    change24h: -0.38,
    changeAbs: -3.9,
    category: "metal",
    volume24h: "$1.2B",
  },
];

// ─── Dummy Crypto Prices (USD) ───────────────────────────────────────────────
const DUMMY_CRYPTO: Omit<MarketAsset, "sparkline">[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67284.5,
    change24h: 2.14,
    changeAbs: 1412.3,
    category: "crypto",
    marketCap: "$1.32T",
    volume24h: "$38.7B",
    iconUrl: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3512.8,
    change24h: 3.21,
    changeAbs: 109.2,
    category: "crypto",
    marketCap: "$421.5B",
    volume24h: "$19.4B",
    iconUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 582.4,
    change24h: -0.87,
    changeAbs: -5.1,
    category: "crypto",
    marketCap: "$84.3B",
    volume24h: "$2.1B",
    iconUrl:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 171.35,
    change24h: 4.72,
    changeAbs: 7.74,
    category: "crypto",
    marketCap: "$78.9B",
    volume24h: "$5.6B",
    iconUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  {
    symbol: "XRP",
    name: "XRP",
    price: 0.553,
    change24h: -1.15,
    changeAbs: -0.0064,
    category: "crypto",
    marketCap: "$30.8B",
    volume24h: "$1.9B",
    iconUrl:
      "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.447,
    change24h: 1.68,
    changeAbs: 0.0074,
    category: "crypto",
    marketCap: "$15.9B",
    volume24h: "$648M",
    iconUrl: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.1218,
    change24h: -2.34,
    changeAbs: -0.0029,
    category: "crypto",
    marketCap: "$17.5B",
    volume24h: "$1.2B",
    iconUrl: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 38.72,
    change24h: 5.48,
    changeAbs: 2.02,
    category: "crypto",
    marketCap: "$16.0B",
    volume24h: "$892M",
    iconUrl:
      "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    price: 7.83,
    change24h: -1.42,
    changeAbs: -0.113,
    category: "crypto",
    marketCap: "$10.5B",
    volume24h: "$311M",
    iconUrl:
      "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    price: 0.893,
    change24h: 3.07,
    changeAbs: 0.0266,
    category: "crypto",
    marketCap: "$8.7B",
    volume24h: "$547M",
    iconUrl:
      "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  },
];

// ─── Dummy Forex Rates ────────────────────────────────────────────────────────
const DUMMY_FOREX_SYMBOLS = [
  "EUR",
  "GBP",
  "JPY",
  "AED",
  "AUD",
  "CAD",
  "SGD",
  "CNY",
  "INR",
  "CHF",
];
const FOREX_CHANGES: Record<string, number> = {
  EUR: 0.12,
  GBP: -0.08,
  JPY: 0.31,
  AED: 0.02,
  AUD: -0.18,
  CAD: 0.09,
  SGD: -0.05,
  CNY: 0.07,
  INR: 0.04,
  CHF: -0.11,
};

// ─── Seed-based pseudo-random ─────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Generate realistic sparkline data ───────────────────────────────────────
export function generateSparklineData(
  seed: number,
  trend: "up" | "down" | "flat",
  points = 20,
): number[] {
  const rng = seededRandom(seed);
  const base = 100;
  const values: number[] = [];
  let current = base;
  const trendBias = trend === "up" ? 0.3 : trend === "down" ? -0.3 : 0;

  for (let i = 0; i < points; i++) {
    const change = (rng() - 0.5 + trendBias) * 3;
    current = Math.max(base * 0.85, Math.min(base * 1.15, current + change));
    values.push(current);
  }

  return values;
}

// ─── Generate historical chart data ──────────────────────────────────────────
export function generateHistoricalData(
  seed: number,
  trend: "up" | "down",
  period: TimePeriod,
): HistoricalData {
  const rng = seededRandom(seed);
  const trendBias = trend === "up" ? 0.25 : -0.25;

  let points: number;
  let labelFn: (i: number, total: number) => string;

  const now = new Date();

  switch (period) {
    case "1D":
      points = 24;
      labelFn = (i) => {
        const h = i;
        return `${String(h).padStart(2, "0")}:00`;
      };
      break;
    case "7D":
      points = 7;
      labelFn = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      };
      break;
    case "1M":
      points = 30;
      labelFn = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      };
      break;
    case "3M":
      points = 12;
      labelFn = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (11 - i) * 7);
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      };
      break;
    case "1Y":
      points = 12;
      labelFn = (i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        return d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      };
      break;
    default:
      points = 24;
      labelFn = (i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (23 - i) * 2);
        return d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      };
      break;
  }

  const base = 100;
  const values: number[] = [];
  let current = base;

  for (let i = 0; i < points; i++) {
    const change = (rng() - 0.5 + trendBias) * 4;
    current = Math.max(base * 0.6, Math.min(base * 1.6, current + change));
    values.push(current);
  }

  const labels: string[] = Array.from({ length: points }, (_, i) =>
    labelFn(i, points),
  );

  return { labels, values };
}

// ─── Convert price from USD to target currency ────────────────────────────────
function convertPrice(usdPrice: number, currency: string): number {
  const rate = BASE_FOREX_RATES[currency] ?? 1;
  return usdPrice * rate;
}

// ─── Format large numbers (used for future dynamic market cap calculation) ────
// biome-ignore lint/correctness/noUnusedVariables: utility for future real API integration
function _formatMarketCap(usdValue: number, currency: string): string {
  const rate = BASE_FOREX_RATES[currency] ?? 1;
  const value = usdValue * rate;
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

// ─── fetchMetals ──────────────────────────────────────────────────────────────
/**
 * Fetch precious metal prices.
 * Real API: metals-api.com  – replace API_CONFIG.metals with your key.
 * Currently returns realistic dummy data.
 *
 * Example real call:
 *   const res = await fetch(
 *     `${API_CONFIG.metals.baseUrl}/latest?access_key=${API_CONFIG.metals.apiKey}&base=USD&symbols=XAU,XAG,XPT`
 *   );
 */
export async function fetchMetals(currency: string): Promise<MarketAsset[]> {
  try {
    // ── Real API call (uncomment when key is ready) ──
    // const res = await fetch(`${API_CONFIG.metals.baseUrl}/latest?access_key=${API_CONFIG.metals.apiKey}&base=USD&symbols=XAU,XAG,XPT`);
    // if (!res.ok) throw new Error("Metals API error");
    // const data = await res.json();
    // ... parse data.rates ...

    // Simulate tiny random fluctuation
    const rng = seededRandom(Date.now() % 10000);
    return DUMMY_METALS.map((metal, i) => ({
      ...metal,
      price: convertPrice(metal.price * (1 + (rng() - 0.5) * 0.002), currency),
      changeAbs: convertPrice(
        metal.changeAbs * (1 + (rng() - 0.5) * 0.001),
        currency,
      ),
      sparkline: generateSparklineData(
        i * 7 + 1,
        metal.change24h >= 0 ? "up" : "down",
      ),
    }));
  } catch {
    return DUMMY_METALS.map((metal, i) => ({
      ...metal,
      price: convertPrice(metal.price, currency),
      changeAbs: convertPrice(metal.changeAbs, currency),
      sparkline: generateSparklineData(
        i * 7 + 1,
        metal.change24h >= 0 ? "up" : "down",
      ),
    }));
  }
}

// ─── fetchCrypto ──────────────────────────────────────────────────────────────
/**
 * Fetch cryptocurrency prices.
 * Real API: CoinGecko free – replace API_CONFIG.crypto with your key.
 * Currently returns realistic dummy data.
 *
 * Example real call:
 *   const ids = 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin';
 *   const res = await fetch(
 *     `${API_CONFIG.crypto.baseUrl}/simple/price?ids=${ids}&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true&include_market_cap=true`
 *   );
 */
export async function fetchCrypto(currency: string): Promise<MarketAsset[]> {
  try {
    // ── Real API call (uncomment when key is ready) ──
    // const ids = 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,avalanche-2,polkadot,matic-network';
    // const res = await fetch(`${API_CONFIG.crypto.baseUrl}/simple/price?ids=${ids}&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true&include_market_cap=true&x_cg_demo_api_key=${API_CONFIG.crypto.apiKey}`);
    // if (!res.ok) throw new Error("Crypto API error");
    // const data = await res.json();
    // ... parse ...

    const rng = seededRandom(Date.now() % 9999);
    return DUMMY_CRYPTO.map((crypto, i) => ({
      ...crypto,
      price: convertPrice(crypto.price * (1 + (rng() - 0.5) * 0.003), currency),
      changeAbs: convertPrice(
        crypto.changeAbs * (1 + (rng() - 0.5) * 0.001),
        currency,
      ),
      sparkline: generateSparklineData(
        i * 13 + 3,
        crypto.change24h >= 0 ? "up" : "down",
      ),
    }));
  } catch {
    return DUMMY_CRYPTO.map((crypto, i) => ({
      ...crypto,
      price: convertPrice(crypto.price, currency),
      changeAbs: convertPrice(crypto.changeAbs, currency),
      sparkline: generateSparklineData(
        i * 13 + 3,
        crypto.change24h >= 0 ? "up" : "down",
      ),
    }));
  }
}

// ─── fetchForex ───────────────────────────────────────────────────────────────
/**
 * Fetch forex exchange rates.
 * Real API: exchangerate-api.com – replace API_CONFIG.forex with your key.
 * Currently returns realistic dummy data.
 *
 * Example real call:
 *   const res = await fetch(`${API_CONFIG.forex.baseUrl}/${currency}?apikey=${API_CONFIG.forex.apiKey}`);
 */
export async function fetchForex(currency: string): Promise<MarketAsset[]> {
  try {
    // ── Real API call (uncomment when key is ready) ──
    // const res = await fetch(`${API_CONFIG.forex.baseUrl}/${currency}`);
    // if (!res.ok) throw new Error("Forex API error");
    // const data = await res.json();
    // ... parse data.rates ...

    const rng = seededRandom(Date.now() % 8888);
    const baseRate = BASE_FOREX_RATES[currency] ?? 1;

    return DUMMY_FOREX_SYMBOLS.filter((sym) => sym !== currency).map(
      (sym, i) => {
        const targetRate = BASE_FOREX_RATES[sym] ?? 1;
        const crossRate = targetRate / baseRate;
        const change24hPct = FOREX_CHANGES[sym] ?? 0;
        const fluctuation = 1 + (rng() - 0.5) * 0.001;

        return {
          symbol: `${currency}/${sym}`,
          name: `${currency} to ${sym}`,
          price: crossRate * fluctuation,
          change24h: change24hPct,
          changeAbs: crossRate * (change24hPct / 100),
          sparkline: generateSparklineData(
            i * 5 + 2,
            change24hPct >= 0 ? "up" : "down",
          ),
          category: "forex" as const,
          volume24h: `$${(Math.random() * 500 + 50).toFixed(0)}B`,
        };
      },
    );
  } catch {
    const baseRate = BASE_FOREX_RATES[currency] ?? 1;
    return DUMMY_FOREX_SYMBOLS.filter((sym) => sym !== currency).map(
      (sym, i) => {
        const targetRate = BASE_FOREX_RATES[sym] ?? 1;
        const crossRate = targetRate / baseRate;
        const change24hPct = FOREX_CHANGES[sym] ?? 0;

        return {
          symbol: `${currency}/${sym}`,
          name: `${currency} to ${sym}`,
          price: crossRate,
          change24h: change24hPct,
          changeAbs: crossRate * (change24hPct / 100),
          sparkline: generateSparklineData(
            i * 5 + 2,
            change24hPct >= 0 ? "up" : "down",
          ),
          category: "forex" as const,
          volume24h: "$100B",
        };
      },
    );
  }
}

// ─── Price formatter ──────────────────────────────────────────────────────────
export function formatPrice(price: number, currency: string): string {
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : currency === "JPY"
            ? "¥"
            : currency === "AED"
              ? "د.إ"
              : currency === "CNY"
                ? "¥"
                : "$";

  if (price >= 1000) {
    return `${symbol}${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) {
    return `${symbol}${price.toFixed(4).replace(/\.?0+$/, "")}`;
  }
  return `${symbol}${price.toFixed(6).replace(/\.?0+$/, "")}`;
}
