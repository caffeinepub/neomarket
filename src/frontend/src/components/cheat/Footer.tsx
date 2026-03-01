export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="text-center py-4 px-4 mt-8"
      style={{
        borderTop: "1px solid rgba(0,255,255,0.08)",
        color: "var(--text-muted)",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      © {year} · Built with <span style={{ color: "#bf00ff" }}>♥</span> using{" "}
      <a
        href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#00ffff", textDecoration: "none" }}
        onFocus={(e) => {
          e.currentTarget.style.textDecoration = "underline";
        }}
        onBlur={(e) => {
          e.currentTarget.style.textDecoration = "none";
        }}
      >
        caffeine.ai
      </a>
    </footer>
  );
}
