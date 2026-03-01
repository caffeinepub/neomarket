import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="cheat-navbar sticky top-0 z-50 px-4 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(191,0,255,0.2))",
            border: "1px solid rgba(0,255,255,0.4)",
          }}
        >
          <BookOpen size={16} style={{ color: "#00ffff" }} />
        </div>

        <h1
          className="neon-title font-display font-black text-base sm:text-lg md:text-xl leading-tight flex-1 min-w-0"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Gareebo ka sahara❌ &nbsp;Aapna AJIT bhai✅
        </h1>

        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono flex-shrink-0"
          style={{
            background: "rgba(0,255,255,0.06)",
            border: "1px solid rgba(0,255,255,0.2)",
            color: "rgba(0,255,255,0.7)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00ff88" }}
          />
          AI Powered
        </div>
      </div>
    </header>
  );
}
