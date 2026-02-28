export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="market-footer py-6 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="logo-icon w-5 h-5 rounded flex items-center justify-center text-[10px] font-black">
            N
          </div>
          <span className="font-bold text-sm font-display neon-text">
            NeoMarket
          </span>
        </div>

        <div
          className="text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Market data is for informational purposes only. Not financial advice.
        </div>

        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors hover:text-current"
            style={{ color: "var(--neon-cyan)" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
