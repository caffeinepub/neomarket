import { formatPrice } from "@/utils/marketData";
import type { MarketAsset } from "@/utils/types";
import {
  Activity,
  Clock,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface HeroStatsProps {
  metals: MarketAsset[];
  crypto: MarketAsset[];
  lastUpdated: Date | null;
  currency: string;
}

/**
 * Hero stats bar — market status, top gainer/loser, BTC/Gold quick stats.
 */
export function HeroStats({
  metals,
  crypto,
  lastUpdated,
  currency,
}: HeroStatsProps) {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  const hour = now.getUTCHours();
  // NYSE: Mon-Fri 13:30-20:00 UTC
  const isMarketOpen =
    day >= 1 &&
    day <= 5 &&
    ((hour === 13 && now.getUTCMinutes() >= 30) || (hour > 13 && hour < 20));

  const allAssets = [...metals, ...crypto];
  const topGainer = allAssets.reduce<MarketAsset | null>(
    (best, a) => (!best || a.change24h > best.change24h ? a : best),
    null,
  );
  const topLoser = allAssets.reduce<MarketAsset | null>(
    (worst, a) => (!worst || a.change24h < worst.change24h ? a : worst),
    null,
  );

  const btc = crypto.find((c) => c.symbol === "BTC");
  const gold = metals.find((m) => m.symbol === "XAU");

  // Estimated total crypto market cap (sum of known market caps)
  const totalMarketCap = crypto.reduce((sum, c) => {
    if (!c.marketCap) return sum;
    const clean = c.marketCap.replace(/[^0-9.TBM]/g, "");
    if (c.marketCap.includes("T")) return sum + Number.parseFloat(clean) * 1e12;
    if (c.marketCap.includes("B")) return sum + Number.parseFloat(clean) * 1e9;
    if (c.marketCap.includes("M")) return sum + Number.parseFloat(clean) * 1e6;
    return sum;
  }, 0);

  const fmtCap =
    totalMarketCap >= 1e12
      ? `$${(totalMarketCap / 1e12).toFixed(2)}T`
      : totalMarketCap >= 1e9
        ? `$${(totalMarketCap / 1e9).toFixed(1)}B`
        : "—";

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <section className="hero-stats-bar py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 lg:gap-8">
        {/* Market status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMarketOpen ? "bg-emerald-400" : "bg-amber-400"}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMarketOpen ? "bg-emerald-400" : "bg-amber-400"}`}
            />
          </span>
          <span
            className={`text-xs font-bold tracking-widest ${isMarketOpen ? "text-emerald-400" : "text-amber-400"}`}
          >
            {isMarketOpen ? "MARKET OPEN" : "AFTER HOURS"}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Last updated */}
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Clock size={12} />
          <span>Updated {timeStr}</span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        {/* Crypto Market Cap */}
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Layers size={12} />
          <span>
            Crypto Cap:{" "}
            <span
              style={{ color: "var(--text-secondary)" }}
              className="font-semibold"
            >
              {fmtCap}
            </span>
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden lg:block" />

        {/* Gold price */}
        {gold && (
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-amber-400">⬡</span>
            <span>
              Gold:{" "}
              <span
                style={{ color: "var(--text-secondary)" }}
                className="font-semibold font-mono"
              >
                {formatPrice(gold.price, currency)}/oz
              </span>
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-white/10 hidden lg:block" />

        {/* Top gainer */}
        {topGainer && (
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp size={12} className="text-emerald-400" />
            <span style={{ color: "var(--text-muted)" }}>Top: </span>
            <span className="font-semibold font-mono text-emerald-400">
              {topGainer.symbol.split("/").pop()} +
              {topGainer.change24h.toFixed(2)}%
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-white/10 hidden xl:block" />

        {/* Top loser */}
        {topLoser && (
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingDown size={12} className="text-red-400" />
            <span style={{ color: "var(--text-muted)" }}>Worst: </span>
            <span className="font-semibold font-mono text-red-400">
              {topLoser.symbol.split("/").pop()} {topLoser.change24h.toFixed(2)}
              %
            </span>
          </div>
        )}

        {/* BTC dominance placeholder */}
        {btc && (
          <>
            <div className="h-4 w-px bg-white/10 hidden xl:block" />
            <div className="flex items-center gap-1.5 text-xs">
              <Activity size={12} style={{ color: "var(--neon-cyan)" }} />
              <span style={{ color: "var(--text-muted)" }}>BTC: </span>
              <span
                className="font-semibold font-mono"
                style={{ color: "var(--neon-cyan)" }}
              >
                {formatPrice(btc.price, currency)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
