import { Gamepad2 } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      className="py-10 px-4 sm:px-6 relative overflow-hidden"
      style={{ borderTop: "1px solid var(--glass-border)" }}
    >
      {/* Subtle glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-20 opacity-15 pointer-events-none blur-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,212,255,0.4), rgba(155,89,255,0.4))",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(155,89,255,0.15))",
                  border: "1px solid rgba(0,212,255,0.25)",
                }}
              >
                <Gamepad2 size={14} style={{ color: "var(--neon-cyan)" }} />
              </div>
              <span
                className="font-display font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                <span className="neon-text">Neo</span>Play
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Your gateway to premium browser gaming
            </p>
          </div>

          {/* Attribution */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              © {year} NeoPlay. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Built with <span style={{ color: "rgba(239,68,68,0.8)" }}>♥</span>{" "}
              using{" "}
              <a
                href={caffeineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:underline"
                style={{ color: "var(--neon-cyan)" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "About"].map((link) => (
              <button
                key={link}
                type="button"
                className="text-xs transition-colors duration-200 hover:underline"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--neon-cyan)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-secondary)";
                }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
