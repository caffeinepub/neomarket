import { Footer } from "@/components/neomarket/Footer";
import { HeroStats } from "@/components/neomarket/HeroStats";
import { LineChart } from "@/components/neomarket/LineChart";
import { MarketSection } from "@/components/neomarket/MarketSection";
import { Navbar } from "@/components/neomarket/Navbar";
import { SearchOverlay } from "@/components/neomarket/SearchOverlay";
import { WatchlistPanel } from "@/components/neomarket/WatchlistPanel";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  useAddToWatchlist,
  useGetPreferredCurrency,
  useGetWatchlist,
  useRemoveFromWatchlist,
  useSetPreferredCurrency,
} from "@/hooks/useQueries";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useTheme } from "@/hooks/useTheme";
import { fetchCrypto, fetchForex, fetchMetals } from "@/utils/marketData";
import type { CurrencyCode, MarketAsset } from "@/utils/types";
import { BarChart3, Coins, DollarSign, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Auto-refresh interval (ms) ─────────────────────────────────────────────
const REFRESH_INTERVAL = 30_000;

/**
 * NeoMarket — Ultra-Premium Fintech Market Dashboard
 * Real-time prices for Metals, Crypto, and Forex.
 */
export default function App() {
  const { isDark, toggle } = useTheme();
  const scrollProgress = useScrollProgress();

  // ── Data state ───────────────────────────────────────────────────────────
  const [metals, setMetals] = useState<MarketAsset[]>([]);
  const [crypto, setCrypto] = useState<MarketAsset[]>([]);
  const [forex, setForex] = useState<MarketAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [localWatchlist, setLocalWatchlist] = useState<string[]>([]);

  // ── Backend queries ───────────────────────────────────────────────────────
  const { data: backendWatchlist } = useGetWatchlist();
  const { data: preferredCurrency } = useGetPreferredCurrency();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const setPreferredCurrency = useSetPreferredCurrency();

  // Sync backend watchlist to local
  useEffect(() => {
    if (backendWatchlist) setLocalWatchlist(backendWatchlist);
  }, [backendWatchlist]);

  // Sync preferred currency from backend
  useEffect(() => {
    if (preferredCurrency) {
      setCurrency(preferredCurrency as CurrencyCode);
    }
  }, [preferredCurrency]);

  // ── Intersection observer for fade-in animations ──────────────────────────
  useIntersectionObserver();

  // ── Data fetching ─────────────────────────────────────────────────────────
  const refresh = useCallback(
    async (showLoader = false) => {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const [metalsData, cryptoData, forexData] = await Promise.all([
          fetchMetals(currency),
          fetchCrypto(currency),
          fetchForex(currency),
        ]);

        setMetals(metalsData);
        setCrypto(cryptoData);
        setForex(forexData);
        setLastUpdated(new Date());
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currency],
  );

  // Initial load + auto-refresh
  useEffect(() => {
    void refresh(true);
    const interval = setInterval(() => void refresh(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  // ── Currency change handler ───────────────────────────────────────────────
  const handleCurrencyChange = useCallback(
    (newCurrency: CurrencyCode) => {
      setCurrency(newCurrency);
      setPreferredCurrency.mutate(newCurrency);
    },
    [setPreferredCurrency],
  );

  // ── Watchlist toggle ──────────────────────────────────────────────────────
  const handleFavoriteToggle = useCallback(
    (symbol: string) => {
      const isInList = localWatchlist.includes(symbol);
      if (isInList) {
        setLocalWatchlist((prev) => prev.filter((s) => s !== symbol));
        removeFromWatchlist.mutate(symbol);
      } else {
        setLocalWatchlist((prev) => [...prev, symbol]);
        addToWatchlist.mutate(symbol);
      }
    },
    [localWatchlist, addToWatchlist, removeFromWatchlist],
  );

  // ── Keyboard shortcut: Ctrl+K for search ─────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Meta tags ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = "NeoMarket — Live Market Dashboard";
    const desc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (desc) {
      desc.setAttribute(
        "content",
        "Real-time prices for Gold, Silver, Bitcoin, Ethereum and 20+ assets. Live market dashboard with interactive charts.",
      );
    }
    const metaTheme = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (metaTheme) {
      metaTheme.setAttribute("content", isDark ? "#070a14" : "#f4f6fb");
    }
  }, [isDark]);

  const allAssets = [...metals, ...crypto, ...forex];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--page-bg)", color: "var(--text-primary)" }}
    >
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar fixed top-0 left-0 h-[2px] z-[60] transition-all"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />

      {/* Sticky navbar */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggle}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onSearchOpen={() => setSearchOpen(true)}
        watchlistCount={localWatchlist.length}
        onWatchlistOpen={() => setWatchlistOpen(true)}
      />

      <main>
        {/* Hero section */}
        <section className="market-hero py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="fade-in-view visible">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
                style={{
                  background: "rgba(var(--neon-cyan-rgb, 0, 240, 255), 0.08)",
                  borderColor: "rgba(var(--neon-cyan-rgb, 0, 240, 255), 0.2)",
                  color: "var(--neon-cyan)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                {isRefreshing ? "Refreshing..." : "Live Market Data"}
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight mb-3 leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                The <span className="neon-text">Premium</span> Market
                <br className="hidden sm:block" /> Dashboard
              </h1>

              <p
                className="text-base sm:text-lg max-w-2xl mx-auto"
                style={{ color: "var(--text-muted)" }}
              >
                Real-time prices for Gold, Silver, Platinum, 10+
                Cryptocurrencies, and global Forex rates. Auto-refreshes every
                30s.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
                {[
                  { label: "Assets Tracked", value: `${allAssets.length}+` },
                  { label: "Refresh Rate", value: "30s" },
                  { label: "Markets", value: "3 Types" },
                  { label: "Currencies", value: "10 FX" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black font-mono neon-text">
                      {stat.value}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hero stats bar */}
        <HeroStats
          metals={metals}
          crypto={crypto}
          lastUpdated={lastUpdated}
          currency={currency}
        />

        {/* Metals Section */}
        <MarketSection
          title="Precious Metals"
          subtitle="Gold, Silver & Platinum spot prices"
          icon={<span>⬡</span>}
          assets={metals}
          currency={currency}
          watchlist={localWatchlist}
          isLoading={isLoading}
          onFavoriteToggle={handleFavoriteToggle}
          onCardClick={setSelectedAsset}
          defaultExpanded={true}
          initialVisibleCount={3}
        />

        {/* Crypto Section */}
        <MarketSection
          title="Cryptocurrency"
          subtitle="Top digital assets by market cap"
          icon={<span>◈</span>}
          assets={crypto}
          currency={currency}
          watchlist={localWatchlist}
          isLoading={isLoading}
          onFavoriteToggle={handleFavoriteToggle}
          onCardClick={setSelectedAsset}
          initialVisibleCount={8}
        />

        {/* Forex Section */}
        <MarketSection
          title="Forex Rates"
          subtitle="Global currency exchange rates"
          icon={<span>⟳</span>}
          assets={forex}
          currency={currency}
          watchlist={localWatchlist}
          isLoading={isLoading}
          onFavoriteToggle={handleFavoriteToggle}
          onCardClick={setSelectedAsset}
          initialVisibleCount={6}
        />

        {/* API Integration Guide */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 fade-in-view">
          <div className="max-w-7xl mx-auto">
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: "var(--market-card-bg)",
                borderColor: "rgba(var(--neon-cyan-rgb, 0, 240, 255), 0.12)",
              }}
            >
              <h2
                className="text-lg font-bold font-display mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                🔌 Connect Real Market Data
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Currently showing realistic demo data. To connect live APIs,
                update{" "}
                <code
                  className="font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(var(--neon-cyan-rgb),0.08)",
                    color: "var(--neon-cyan)",
                  }}
                >
                  src/utils/marketData.ts
                </code>
                :
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Metals",
                    api: "metals-api.com",
                    key: "metals.apiKey",
                  },
                  {
                    label: "Crypto",
                    api: "coingecko.com/api/v3",
                    key: "crypto.apiKey",
                  },
                  {
                    label: "Forex",
                    api: "exchangerate-api.com",
                    key: "forex.apiKey",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl p-3 border"
                    style={{
                      background:
                        "rgba(var(--neon-cyan-rgb, 0, 240, 255), 0.03)",
                      borderColor:
                        "rgba(var(--neon-cyan-rgb, 0, 240, 255), 0.08)",
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: "var(--neon-cyan)" }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.api}
                    </div>
                    <div
                      className="text-xs font-mono mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      API_CONFIG.{item.key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Line chart modal */}
      {selectedAsset && (
        <LineChart
          asset={selectedAsset}
          currency={currency}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Search overlay */}
      {searchOpen && (
        <SearchOverlay
          assets={allAssets}
          currency={currency}
          onSelectAsset={(asset) => {
            setSelectedAsset(asset);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Watchlist panel */}
      {watchlistOpen && (
        <WatchlistPanel
          watchlist={localWatchlist}
          allAssets={allAssets}
          currency={currency}
          onRemove={handleFavoriteToggle}
          onAssetClick={(asset) => {
            setSelectedAsset(asset);
            setWatchlistOpen(false);
          }}
          onClose={() => setWatchlistOpen(false)}
        />
      )}
    </div>
  );
}
