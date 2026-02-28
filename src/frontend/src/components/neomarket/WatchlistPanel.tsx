import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatPrice } from "@/utils/marketData";
import type { MarketAsset } from "@/utils/types";
import { AlertCircle, Star, X } from "lucide-react";
import { SparklineChart } from "./SparklineChart";

interface WatchlistPanelProps {
  watchlist: string[];
  allAssets: MarketAsset[];
  currency: string;
  onRemove: (symbol: string) => void;
  onAssetClick: (asset: MarketAsset) => void;
  onClose: () => void;
}

/**
 * Slide-in watchlist panel from the right side.
 */
export function WatchlistPanel({
  watchlist,
  allAssets,
  currency,
  onRemove,
  onAssetClick,
  onClose,
}: WatchlistPanelProps) {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const watchedAssets = watchlist
    .map((sym) => allAssets.find((a) => a.symbol === sym))
    .filter((a): a is MarketAsset => !!a);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = "none";
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="watchlist-panel fixed top-0 right-0 h-full z-50 flex flex-col"
        aria-label="Watchlist"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
            <span
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Watchlist
            </span>
            {watchedAssets.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">
                {watchedAssets.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close watchlist"
          >
            <X size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <AlertCircle size={32} style={{ color: "var(--text-muted)" }} />
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign in to save your watchlist across sessions
              </div>
            </div>
          ) : watchedAssets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <Star size={32} style={{ color: "var(--text-muted)" }} />
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Star any asset to track it here
              </div>
            </div>
          ) : (
            watchedAssets.map((asset) => {
              const isPositive = asset.change24h >= 0;
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  className="watchlist-item w-full flex items-center gap-3 px-4 py-3 cursor-pointer group text-left"
                  onClick={() => onAssetClick(asset)}
                  aria-label={`Open chart for ${asset.name}`}
                >
                  {/* Icon */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {asset.symbol.split("/").pop()}
                      </span>
                      <span
                        className={`text-xs font-semibold $isPositive ? "text-emerald-400" : "text-red-400"`}
                      >
                        {isPositive ? "+" : ""}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatPrice(asset.price, currency)}
                      </span>
                      <SparklineChart
                        data={asset.sparkline}
                        isPositive={isPositive}
                        width={50}
                        height={18}
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(asset.symbol);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                    aria-label={`Remove ${asset.symbol} from watchlist`}
                  >
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
