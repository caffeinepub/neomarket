import { formatPrice } from "@/utils/marketData";
import type { MarketAsset } from "@/utils/types";
import { Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchOverlayProps {
  assets: MarketAsset[];
  currency: string;
  onSelectAsset: (asset: MarketAsset) => void;
  onClose: () => void;
}

/**
 * Full-screen search overlay with fuzzy filtering.
 * Keyboard navigation: arrows + enter.
 */
export function SearchOverlay({
  assets,
  currency,
  onSelectAsset,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = query.trim()
    ? assets.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      })
    : assets.slice(0, 12);

  // Group by category
  const grouped = {
    metal: filtered.filter((a) => a.category === "metal"),
    crypto: filtered.filter((a) => a.category === "crypto"),
    forex: filtered.filter((a) => a.category === "forex"),
  };

  const flatList = [...grouped.metal, ...grouped.crypto, ...grouped.forex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatList[selectedIndex]) {
      onSelectAsset(flatList[selectedIndex]);
    }
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = "none";
  };

  const renderGroup = (label: string, items: MarketAsset[], offset: number) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-2">
        <div
          className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </div>
        {items.map((asset, i) => {
          const globalIdx = offset + i;
          const isActive = globalIdx === selectedIndex;
          const isPositive = asset.change24h >= 0;

          return (
            <button
              key={asset.symbol}
              type="button"
              onClick={() => onSelectAsset(asset)}
              onMouseEnter={() => setSelectedIndex(globalIdx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isActive ? "search-result-active" : "search-result"}`}
            >
              {asset.iconUrl ? (
                <img
                  src={asset.iconUrl}
                  alt={asset.symbol}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                  onError={handleImgError}
                />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold market-icon-fallback flex-shrink-0">
                  {asset.category === "metal"
                    ? "⬡"
                    : asset.category === "crypto"
                      ? "◈"
                      : "⟳"}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {asset.symbol.split("/").pop()}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {asset.name}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-sm font-semibold font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatPrice(asset.price, currency)}
                </div>
                <div
                  className={`flex items-center gap-0.5 justify-end text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                >
                  {isPositive ? (
                    <TrendingUp size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {isPositive ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      aria-hidden="true"
    >
      <div
        className="search-overlay-panel w-full max-w-xl rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search metals, crypto, currencies..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
            aria-label="Search assets"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close search"
          >
            <X size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Hint */}
        <div
          className="flex items-center gap-3 px-4 py-2 text-xs border-b border-white/5"
          style={{ color: "var(--text-muted)" }}
        >
          <span>↑↓ navigate</span>
          <span>↩ open chart</span>
          <span>Esc close</span>
          {query && (
            <span className="ml-auto">
              {flatList.length} result{flatList.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No assets found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {renderGroup("Precious Metals", grouped.metal, 0)}
              {renderGroup(
                "Cryptocurrency",
                grouped.crypto,
                grouped.metal.length,
              )}
              {renderGroup(
                "Forex",
                grouped.forex,
                grouped.metal.length + grouped.crypto.length,
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
