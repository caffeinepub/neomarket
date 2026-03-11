import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, GitBranch, List, Search } from "lucide-react";
import { useState } from "react";

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const EXAMPLE_TOPICS = [
  "Photosynthesis",
  "World War II",
  "Machine Learning",
  "Newton's Laws",
  "DNA Replication",
  "French Revolution",
];

const FEATURES = [
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Structured Notes",
    desc: "Summary, key points, explanation, and examples",
  },
  {
    icon: <GitBranch className="h-5 w-5" />,
    label: "Auto Diagrams",
    desc: "Mermaid flowcharts generated from key points",
  },
  {
    icon: <List className="h-5 w-5" />,
    label: "Micro Cheat Sheet",
    desc: "Ultra-short revision bullets with word limits",
  },
  {
    icon: <Download className="h-5 w-5" />,
    label: "PDF Export",
    desc: "Properly formatted A4 PDF with no overlap",
  },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [topic, setTopic] = useState("");

  const handleGenerate = () => {
    const t = topic.trim();
    if (!t) return;
    onNavigate(`/generate?topic=${encodeURIComponent(t)}`);
  };

  return (
    <main className="hero-bg min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.77 0.19 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.77 0.19 195) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-3xl w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AI-POWERED STUDY ASSISTANT
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
            <span className="glow-title text-primary">Study Notes Maker</span>
            <br />
            <span className="text-foreground/90">with AJITO</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Enter any topic → get{" "}
            <span className="text-primary font-semibold">
              structured study notes
            </span>
            , diagrams, and a micro cheat sheet instantly.
          </p>

          <div className="flex gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="landing.search_input"
                className="pl-10 h-12 glass-card border-primary/30 focus:border-primary bg-transparent text-base"
                placeholder="Enter a topic (e.g. Photosynthesis)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                aria-label="Search topic"
              />
            </div>
            <Button
              data-ocid="landing.primary_button"
              size="lg"
              className="h-12 px-6 bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-neon transition-all"
              onClick={handleGenerate}
              disabled={!topic.trim()}
            >
              Generate Notes
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-5">
            <span className="text-xs text-muted-foreground mr-1 self-center">
              Try:
            </span>
            {EXAMPLE_TOPICS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setTopic(t);
                  onNavigate(`/generate?topic=${encodeURIComponent(t)}`);
                }}
                className="px-3 py-1 rounded-full text-xs font-mono border border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-10 text-foreground/80">
            Everything you need to study smarter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors group"
              >
                <div className="text-primary mb-3 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <div className="font-display font-semibold text-sm mb-1">
                  {f.label}
                </div>
                <div className="text-muted-foreground text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 border-t border-border/20 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
