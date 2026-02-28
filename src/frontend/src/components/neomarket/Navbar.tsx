import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import type { CurrencyCode } from "@/utils/types";
import { LogIn, LogOut, Moon, Search, Star, Sun } from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onSearchOpen: () => void;
  watchlistCount: number;
  onWatchlistOpen: () => void;
}

export function Navbar({
  isDark,
  onToggleTheme,
  currency,
  onCurrencyChange,
  onSearchOpen,
  watchlistCount,
  onWatchlistOpen,
}: NavbarProps) {
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <header className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="logo-icon w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">
            N
          </div>
          <span className="font-black text-lg font-display tracking-tight neon-text">
            NeoMarket
          </span>
        </div>

        {/* Search trigger */}
        <button
          type="button"
          onClick={onSearchOpen}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm transition-all search-trigger ml-4"
          aria-label="Search assets (Ctrl+K)"
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <span
            className="flex-1 text-left"
            style={{ color: "var(--text-muted)" }}
          >
            Search metals, crypto, forex...
          </span>
          <kbd
            className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-medium border"
            style={{
              color: "var(--text-muted)",
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        <div className="flex-1 sm:flex-none" />

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Mobile search */}
          <button
            type="button"
            onClick={onSearchOpen}
            className="sm:hidden p-2 rounded-xl transition-colors hover:bg-white/8"
            aria-label="Search"
          >
            <Search size={17} style={{ color: "var(--text-muted)" }} />
          </button>

          {/* Currency selector */}
          <CurrencySelector value={currency} onChange={onCurrencyChange} />

          {/* Watchlist */}
          <button
            type="button"
            onClick={onWatchlistOpen}
            className="relative p-2 rounded-xl transition-colors hover:bg-white/8"
            aria-label={`Watchlist (${watchlistCount} items)`}
          >
            <Star size={17} style={{ color: "var(--text-secondary)" }} />
            {watchlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold px-1 bg-amber-500 text-black">
                {watchlistCount > 99 ? "99+" : watchlistCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl transition-all hover:bg-white/8"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun size={17} style={{ color: "var(--text-secondary)" }} />
            ) : (
              <Moon size={17} style={{ color: "var(--text-secondary)" }} />
            )}
          </button>

          {/* Auth */}
          <button
            type="button"
            onClick={isLoggedIn ? clear : login}
            disabled={isLoggingIn}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all auth-btn"
            aria-label={isLoggedIn ? "Sign out" : "Sign in"}
          >
            {isLoggingIn ? (
              <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : isLoggedIn ? (
              <>
                <LogOut size={12} />
                Sign Out
              </>
            ) : (
              <>
                <LogIn size={12} />
                Sign In
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
