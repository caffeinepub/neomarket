import { ChevronDown, Gamepad2, Zap } from "lucide-react";

interface HeroSectionProps {
  onExplore: () => void;
}

const STATS = [
  { value: "12+", label: "Games" },
  { value: "7", label: "Categories" },
  { value: "1M+", label: "Players" },
];

export function HeroSection({ onExplore }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="hero-gradient-bg absolute inset-0" aria-hidden="true" />

      {/* Grid overlay */}
      <div
        className="hero-grid-bg absolute inset-0 opacity-60"
        aria-hidden="true"
      />

      {/* Radial glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 opacity-20 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 opacity-15 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(155,89,255,0.5) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.3) 0%, rgba(155,89,255,0.2) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Floating decorative elements */}
      <div
        className="absolute top-20 right-16 w-10 h-10 rounded-2xl opacity-30 animate-float"
        style={{
          background: "rgba(0,212,255,0.15)",
          border: "1px solid rgba(0,212,255,0.3)",
          animationDelay: "0s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-32 left-16 w-6 h-6 rounded-full opacity-25 animate-float"
        style={{
          background: "rgba(155,89,255,0.2)",
          border: "1px solid rgba(155,89,255,0.4)",
          animationDelay: "2s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-40 left-1/3 w-4 h-4 rounded-full opacity-20 animate-float"
        style={{
          background: "rgba(0,212,255,0.3)",
          animationDelay: "1s",
        }}
        aria-hidden="true"
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 fade-in-view visible"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            color: "var(--neon-cyan)",
          }}
        >
          <Zap size={12} />
          Free to Play · No Download Required
        </div>

        {/* Heading */}
        <h1
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-6 fade-in-view visible delay-1"
          style={{ color: "var(--text-primary)" }}
        >
          Play{" "}
          <span className="neon-text" style={{ display: "inline-block" }}>
            Anywhere.
          </span>
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, rgba(240,240,248,0.9), rgba(240,240,248,0.5))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Anytime.
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed fade-in-view visible delay-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Dive into a curated universe of browser games — action, racing,
          puzzles, and more. No installs, no accounts. Just pure gameplay.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-in-view visible delay-3">
          <button
            type="button"
            onClick={onExplore}
            className="play-btn flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold shadow-neon"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #9b59ff)",
              minWidth: "180px",
            }}
          >
            <Gamepad2 size={18} />
            Explore Games
          </button>
          <button
            type="button"
            onClick={() => {
              document
                .querySelector("#trending")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
              backdropFilter: "blur(16px)",
            }}
          >
            Browse All
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 fade-in-view visible delay-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-bold text-2xl sm:text-3xl neon-text">
                {value}
              </div>
              <div
                className="text-xs sm:text-sm mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={onExplore}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-200 hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
        aria-label="Scroll to games"
      >
        <span className="text-xs font-medium tracking-widest uppercase">
          Scroll
        </span>
        <ChevronDown size={16} className="animate-bounce" />
      </button>
    </section>
  );
}
