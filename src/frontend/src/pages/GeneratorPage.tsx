import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useAddSheet } from "@/hooks/useQueries";
import { type StudyNotes, generateNotes } from "@/utils/notesGenerator";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  FileDown,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    mermaid?: {
      initialize: (cfg: object) => void;
      render: (id: string, source: string) => Promise<{ svg: string }>;
    };
    html2canvas?: (
      el: HTMLElement,
      opts?: object,
    ) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (
        opts?: object,
      ) => {
        addImage: (
          d: string,
          fmt: string,
          x: number,
          y: number,
          w: number,
          h: number,
        ) => void;
        addPage: () => void;
        save: (name: string) => void;
      };
    };
  }
}

interface GeneratorPageProps {
  topic: string;
  onNavigate: (path: string) => void;
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

function SkeletonBlock({
  lines = 3,
  className = "",
}: { lines?: number; className?: string }) {
  const keys = SKELETON_KEYS.slice(0, lines);
  return (
    <div className={`space-y-2 ${className}`}>
      {keys.map((k, i) => (
        <div
          key={k}
          className={`skeleton h-4 rounded ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

async function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function renderMermaid(source: string): Promise<string> {
  if (!window.mermaid) {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js",
    );
    await new Promise((r) => setTimeout(r, 300));
  }
  if (!window.mermaid) throw new Error("Mermaid not loaded");
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
  });
  const id = `mermaid-${Date.now()}`;
  const { svg } = await window.mermaid.render(id, source);
  return svg;
}

async function exportPDF(elementId: string, topic: string): Promise<void> {
  await Promise.all([
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    ),
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    ),
  ]);
  await new Promise((r) => setTimeout(r, 200));
  const el = document.getElementById(elementId);
  if (!el || !window.html2canvas || !window.jspdf)
    throw new Error("Export failed");
  const canvas = await window.html2canvas(el, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: "#0a0a0a",
  });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 10;
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;
  let yPos = margin;
  let remaining = imgH;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  while (remaining > 0) {
    const sliceH = Math.min(remaining, pageH - margin * 2);
    pdf.addImage(dataUrl, "JPEG", margin, yPos, imgW, sliceH);
    remaining -= sliceH;
    yPos = margin;
    if (remaining > 0) pdf.addPage();
  }
  pdf.save(`${topic.replace(/\s+/g, "-")}-notes.pdf`);
}

function MermaidDisplay({ svg }: { svg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = svg;
  }, [svg]);
  return <div ref={ref} />;
}

export function GeneratorPage({ topic, onNavigate }: GeneratorPageProps) {
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"short" | "detailed">(
    "detailed",
  );
  const [wordLimit, setWordLimit] = useState(8);
  const [diagramSrc, setDiagramSrc] = useState("");
  const [diagramSvg, setDiagramSvg] = useState("");
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [fontChoice, setFontChoice] = useState<"sans" | "serif" | "mono">(
    "sans",
  );
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const addSheet = useAddSheet();
  const { identity } = useInternetIdentity();

  const fontClass = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono text-sm",
  }[fontChoice];

  const truncate = useCallback(
    (text: string) => {
      const words = text.split(" ");
      return words.length <= wordLimit
        ? text
        : `${words.slice(0, wordLimit).join(" ")}…`;
    },
    [wordLimit],
  );

  const loadNotes = useCallback(
    async (t: string, diff: "short" | "detailed") => {
      setLoading(true);
      setError(null);
      setDiagramSvg("");
      try {
        const result = await generateNotes(t, diff);
        setNotes(result);
        setDiagramSrc(result.mermaidDiagram);
        const saved = JSON.parse(
          localStorage.getItem("ajito_notes_local") || "[]",
        ) as StudyNotes[];
        const filtered = saved.filter((n) => n.topic !== t);
        localStorage.setItem(
          "ajito_notes_local",
          JSON.stringify([result, ...filtered].slice(0, 10)),
        );
      } catch {
        setError("Failed to generate notes. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (topic) loadNotes(topic, difficulty);
  }, [topic, difficulty, loadNotes]);

  useEffect(() => {
    if (!diagramSrc || loading) return;
    setDiagramLoading(true);
    renderMermaid(diagramSrc)
      .then(setDiagramSvg)
      .catch(() =>
        setDiagramSvg(
          '<p style="color:#888;font-size:12px">Diagram preview unavailable</p>',
        ),
      )
      .finally(() => setDiagramLoading(false));
  }, [diagramSrc, loading]);

  const handleSave = async () => {
    if (!notes) return;
    if (!identity) {
      toast.success("Saved locally (login to sync to cloud)");
      return;
    }
    try {
      await addSheet.mutateAsync({
        title: `${notes.topic} — Notes`,
        content: [
          { question: "Summary", answer: notes.summary },
          { question: "Key Points", answer: notes.keyPoints.join("\n") },
          { question: "Explanation", answer: notes.explanation },
          { question: "Example", answer: notes.example },
          { question: "Cheat Notes", answer: notes.cheatNotes.join("\n") },
          { question: "Diagram", answer: notes.mermaidDiagram },
        ],
      });
      toast.success("Notes saved to dashboard!");
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleExportPDF = async () => {
    if (!notes) return;
    setPdfExporting(true);
    try {
      await exportPDF("notes-preview-pane", notes.topic);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("PDF export failed — try a different browser");
    } finally {
      setPdfExporting(false);
    }
  };

  const copyCheatSheet = () => {
    if (!notes) return;
    navigator.clipboard.writeText(
      notes.cheatNotes.map((n) => `• ${n}`).join("\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No topic specified.</p>
          <Button onClick={() => onNavigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-mono no-print">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="hover:text-primary"
          >
            Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-xs">{topic}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          {/* ── LEFT COLUMN ── */}
          <aside className="w-full lg:w-[38%] space-y-4 no-print">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    TOPIC
                  </div>
                  <h1 className="font-display font-bold text-xl leading-tight">
                    {topic}
                  </h1>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid="generator.primary_button"
                  onClick={() => loadNotes(topic, difficulty)}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 text-xs">Regenerate</span>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-mono">
                  DIFFICULTY
                </div>
                <Select
                  value={difficulty}
                  onValueChange={(v) =>
                    setDifficulty(v as "short" | "detailed")
                  }
                >
                  <SelectTrigger
                    data-ocid="generator.select"
                    className="h-9 bg-muted/20"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">
                      Short (Quick Overview)
                    </SelectItem>
                    <SelectItem value="detailed">
                      Detailed (Full Notes)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mt-3">
                <div className="text-xs text-muted-foreground font-mono">
                  FONT STYLE
                </div>
                <Select
                  value={fontChoice}
                  onValueChange={(v) =>
                    setFontChoice(v as "sans" | "serif" | "mono")
                  }
                >
                  <SelectTrigger className="h-9 bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans">Sans-serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-sm text-primary">
                  ⚡ Micro Cheat Sheet
                </h2>
                <button
                  type="button"
                  onClick={copyCheatSheet}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="space-y-1 mb-4">
                {loading
                  ? SKELETON_KEYS.map((k, i) => (
                      <div
                        key={k}
                        className="skeleton h-3 rounded"
                        style={{ width: `${70 + (i % 3) * 10}%` }}
                      />
                    ))
                  : notes?.cheatNotes.map((note) => (
                      <div
                        key={note.slice(0, 20)}
                        className="flex gap-2 text-xs font-mono leading-relaxed"
                      >
                        <span className="text-primary shrink-0">•</span>
                        <span className="text-foreground/80">
                          {truncate(note)}
                        </span>
                      </div>
                    ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Word limit per bullet</span>
                  <span className="font-mono text-primary">{wordLimit}</span>
                </div>
                <Slider
                  data-ocid="generator.toggle"
                  min={3}
                  max={10}
                  step={1}
                  value={[wordLimit]}
                  onValueChange={([v]) => setWordLimit(v)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                data-ocid="generator.save_button"
                onClick={handleSave}
                disabled={!notes || loading || addSheet.isPending}
                className="w-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                variant="outline"
              >
                {addSheet.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Notes
              </Button>
              <Button
                data-ocid="generator.upload_button"
                onClick={handleExportPDF}
                disabled={!notes || loading || pdfExporting}
                variant="outline"
                className="w-full hover:bg-secondary/10 hover:text-secondary hover:border-secondary/40"
              >
                {pdfExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </Button>
            </div>

            {!identity && (
              <p className="text-xs text-muted-foreground text-center">
                <button
                  type="button"
                  onClick={() => onNavigate("/auth")}
                  className="text-primary hover:underline"
                >
                  Login
                </button>{" "}
                to sync notes to your dashboard.
              </p>
            )}
          </aside>

          {/* ── RIGHT COLUMN: Preview ── */}
          <section className="flex-1 min-w-0">
            {loading && (
              <div
                data-ocid="generator.loading_state"
                className="glass-card rounded-xl p-6 space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="font-mono text-sm text-primary">
                    Generating notes for "{topic}"…
                  </span>
                </div>
                {["Summary", "Key Points", "Explanation"].map((s) => (
                  <div key={s}>
                    <div className="skeleton h-3 w-24 rounded mb-3" />
                    <SkeletonBlock lines={s === "Key Points" ? 5 : 3} />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="glass-card rounded-xl p-6 border-destructive/30">
                <div className="flex gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
                <Button
                  className="mt-4"
                  onClick={() => loadNotes(topic, difficulty)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </div>
            )}

            {!loading && !error && notes && (
              <div
                id="notes-preview-pane"
                ref={previewRef}
                className={`glass-card rounded-xl p-6 space-y-6 preview-pane ${fontClass}`}
              >
                <div className="border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono text-primary uppercase tracking-widest">
                      Study Notes
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl">
                    {notes.topic}
                  </h2>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                    Summary
                  </h3>
                  <p className="text-foreground/85 leading-relaxed">
                    {notes.summary}
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                    Key Points
                  </h3>
                  <ul className="space-y-1.5">
                    {notes.keyPoints.map((kp) => (
                      <li
                        key={kp.slice(0, 30)}
                        className="flex gap-2 text-foreground/85"
                      >
                        <span className="text-primary font-mono shrink-0">
                          →
                        </span>
                        <span className="leading-relaxed">{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                    Explanation
                  </h3>
                  <p className="text-foreground/85 leading-relaxed">
                    {notes.explanation}
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                    Example
                  </h3>
                  <div className="border-l-2 border-primary/40 pl-4 text-foreground/80 italic leading-relaxed">
                    {notes.example}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-3">
                    Diagram
                  </h3>
                  <div className="mermaid-container rounded-lg bg-muted/20 p-4 min-h-[100px] flex items-center justify-center">
                    {diagramLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading diagram…
                      </div>
                    ) : diagramSvg ? (
                      <MermaidDisplay svg={diagramSvg} />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Diagram will appear here
                      </p>
                    )}
                  </div>

                  <div className="mt-3 no-print">
                    <div className="text-xs text-muted-foreground font-mono mb-1.5">
                      EDIT DIAGRAM SOURCE
                    </div>
                    <Textarea
                      data-ocid="generator.editor"
                      value={diagramSrc}
                      onChange={(e) => setDiagramSrc(e.target.value)}
                      className="font-mono text-xs bg-muted/10 border-border/50 resize-none h-28"
                      spellCheck={false}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-7"
                      onClick={() => {
                        setDiagramLoading(true);
                        renderMermaid(diagramSrc)
                          .then(setDiagramSvg)
                          .catch(() =>
                            setDiagramSvg("<p>Invalid diagram syntax</p>"),
                          )
                          .finally(() => setDiagramLoading(false));
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Re-render
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
                    ⚡ Quick Cheat Notes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {notes.cheatNotes.map((n) => (
                      <div
                        key={n.slice(0, 20)}
                        className="flex gap-2 text-xs font-mono text-foreground/75"
                      >
                        <span className="text-primary shrink-0">•</span>
                        <span>{truncate(n)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
