# NeoMarket - Live Market Dashboard

## Current State
Project is a NeoPlay gaming portal with games listing, category filters, iframe embeds, and recently played history. Backend has basic canister functionality. Frontend uses React + TypeScript + Tailwind.

## Requested Changes (Diff)

### Add
- Live market dashboard for Metals (Gold XAU, Silver XAG, Platinum XPT), Crypto (BTC, ETH, BNB, SOL, XRP, ADA, DOGE + dynamic list), and Forex (USD, INR, EUR, GBP, JPY, AED, AUD, CAD, SGD, CNY + dynamic list)
- Backend: store watchlist assets per user, favorite pins, and last-seen timestamps
- Auto-refresh every 30 seconds with configurable interval
- Multi-currency conversion engine (user picks display currency, all values convert instantly)
- Interactive mini sparkline charts per card + full expanded line chart with 1D/7D/1M/3M/1Y/MAX filters
- Trend indicator: green line if price up, red line if price down; percentage change with arrow icon
- Shimmer loading skeleton while fetching
- Error fallback with retry button
- Last-updated timestamp display
- Watchlist / favorites system (pin assets to top)
- Search bar for filtering assets
- Market open/close indicator per asset category
- Light/Dark mode toggle
- Scroll progress indicator, section fade-in animations, number flip animation on data update
- Sticky glassmorphism navbar
- Minimal professional footer
- API placeholder structure for Metals API, Crypto API, Forex API (clearly marked with API key sections)

### Modify
- Replace entire gaming portal UI with market dashboard UI
- Backend canister to store user watchlist and favorite assets instead of game history

### Remove
- All gaming portal functionality (game cards, iframe player, categories, recently played)
- Game-related data and assets

## Implementation Plan
1. Update backend canister: watchlist management (add/remove/list), favorites, user preferences
2. Build frontend market dashboard:
   - App shell: sticky navbar, scroll progress bar, dark/light toggle, currency selector dropdown
   - Hero stats bar: market overview (total crypto market cap placeholder, metals summary)
   - Metals section: 3 cards (XAU, XAG, XPT) with sparkline, price, % change, trend color
   - Crypto section: dynamic grid (7+ coins) with sparkline, price in selected currency, % change
   - Forex section: currency exchange rates grid
   - Expanded chart modal: full line chart with time filter buttons (1D/7D/1M/3M/1Y/MAX)
   - API service layer: placeholder fetch functions for Metals, Crypto, Forex APIs with API key config
   - Auto-refresh engine: setInterval 30s, debounced currency change
   - Number flip animation on price update
   - Shimmer skeleton loading state
   - Watchlist panel: pinned/favorited assets
   - Search overlay for filtering assets
   - Responsive layout: mobile stack, tablet 2-col, desktop 3-4 col
3. Wire backend APIs for watchlist persistence
