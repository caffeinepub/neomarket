/**
 * MicroCheat Generator — Main Page
 * All client-side. No backend calls needed.
 */

import { A4Preview } from "@/components/cheat/A4Preview";
import { AdvancedOptions } from "@/components/cheat/AdvancedOptions";
import { CelebrationOverlay } from "@/components/cheat/CelebrationOverlay";
import { Footer } from "@/components/cheat/Footer";
import { QAPairInput } from "@/components/cheat/QAPairInput";
import { aiCompress } from "@/utils/aiCompressor";
import type { CheatMode, QAPair } from "@/utils/cheatTypes";
import { generatePDF } from "@/utils/pdfEngine";
import { generateQRContent, generateQRDataURL } from "@/utils/qrGenerator";
import {
  AlignJustify,
  BookOpen,
  ChevronDown,
  Download,
  Loader2,
  Moon,
  PenTool,
  Shrink,
  Sun,
  Wand2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const NUM_QA = 10;
const QA_KEYS = Array.from({ length: NUM_QA }, (_, i) => `qa-slot-${i}`);
const EMPTY_PAIRS: QAPair[] = Array.from({ length: NUM_QA }, () => ({
  question: "",
  answer: "",
}));

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return progress;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 40;
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      alpha: number;
    };

    const COLORS = ["#00f5ff", "#a855f7", "#00ff88"];
    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.4 + 0.1,
      }),
    );

    let raf: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export function MicroCheatPage() {
  const scrollProgress = useScrollProgress();

  // State
  const [pairs, setPairs] = useState<QAPair[]>(EMPTY_PAIRS);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<CheatMode>("normal");
  const [bulletMode, setBulletMode] = useState(false);
  const [zoom, setZoom] = useState(55);
  const [darkPreview, setDarkPreview] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);

  // Advanced options
  const [shuffle, setShuffle] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [footerText, setFooterText] = useState("");
  const [watermark, setWatermark] = useState("");

  // UI state
  const [errors, setErrors] = useState<boolean[]>(Array(NUM_QA).fill(false));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Debounce ref for preview
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewPairs, setPreviewPairs] = useState<QAPair[]>(EMPTY_PAIRS);

  // Update preview with debounce
  const updatePreview = useCallback((newPairs: QAPair[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewPairs(newPairs);
    }, 300);
  }, []);

  const handlePairChange = useCallback(
    (index: number, field: "question" | "answer", value: string) => {
      setPairs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        updatePreview(next);
        return next;
      });
    },
    [updatePreview],
  );

  // AI Compress
  const handleAutoShorten = useCallback(() => {
    setPairs((prev) => {
      const compressed = prev.map((p) => ({
        ...p,
        answer: p.answer ? aiCompress(p.answer, bulletMode) : p.answer,
      }));
      updatePreview(compressed);
      return compressed;
    });
  }, [bulletMode, updatePreview]);

  // Generate
  const handleGenerate = useCallback(async () => {
    // Validate: at least one pair filled
    const newErrors = pairs.map((p) => !p.question.trim() && !p.answer.trim());
    const hasAnyContent = pairs.some(
      (p) => p.question.trim() || p.answer.trim(),
    );
    if (!hasAnyContent) {
      setErrors(Array(NUM_QA).fill(true));
      return;
    }
    setErrors(newErrors);
    setIsGenerating(true);
    setGenerateProgress(0);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 60));
      setGenerateProgress(i);
    }
    setIsGenerating(false);
    setGenerated(true);
    setPreviewPairs([...pairs]);
  }, [pairs]);

  // Download PDF
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      let qrDataUrl: string | null = null;
      if (studentName.trim()) {
        const qrContent = generateQRContent(studentName);
        qrDataUrl = await generateQRDataURL(qrContent);
      }

      let activePairs = [...pairs];
      if (shuffle) {
        const arr = [...activePairs];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        activePairs = arr;
      }

      await generatePDF({
        title: title || "Micro Cheat Sheet",
        pairs: activePairs,
        mode,
        watermark,
        footerText,
        qrDataUrl,
        studentName,
      });
      setCelebration(true);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [pairs, title, mode, watermark, footerText, studentName, shuffle]);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: darkMode ? "#0a0a0a" : "#f0f4f8" }}
    >
      <ParticleCanvas />

      {/* Scroll progress bar */}
      <div
        role="progressbar"
        tabIndex={-1}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
        aria-label="Page scroll progress"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(0,245,255,0.1)",
          zIndex: 200,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #00f5ff, #a855f7, #00ff88)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Navbar */}
      <header
        className="mc-navbar sticky top-0 z-50 px-4 py-3"
        style={{ zIndex: 100 }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(168,85,247,0.2))",
              border: "1px solid rgba(0,245,255,0.35)",
            }}
          >
            <BookOpen size={16} style={{ color: "#00f5ff" }} />
          </div>

          <h1
            className="neon-title font-black text-sm sm:text-base md:text-lg leading-tight flex-1 min-w-0 truncate"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            ⚡ MicroCheat
          </h1>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono"
              style={{
                background: "rgba(0,245,255,0.06)",
                border: "1px solid rgba(0,245,255,0.2)",
                color: "rgba(0,245,255,0.7)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#00ff88" }}
              />
              AI v3.0
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className="neon-btn-cyan rounded-lg p-2"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Hero section */}
        <section
          className="py-12 md:py-16 text-center px-4"
          style={{
            background: darkMode
              ? "linear-gradient(180deg, rgba(0,245,255,0.04) 0%, transparent 100%)"
              : "linear-gradient(180deg, rgba(0,180,255,0.06) 0%, transparent 100%)",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              className="neon-hero-title font-black leading-tight mb-3"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: "clamp(22px, 5vw, 52px)",
              }}
            >
              Gareebo ka sahara❌
              <br />
              Aapna AJIT bhai✅
            </h2>
            <p
              className="text-sm md:text-base font-mono mb-2"
              style={{ color: "rgba(0,245,255,0.6)" }}
            >
              AI-Powered Micro Cheat Generator 3.0 — Legendary Hacker Edition
            </p>
            <p
              className="text-xs"
              style={{
                color: darkMode
                  ? "rgba(200,240,255,0.35)"
                  : "rgba(30,60,100,0.5)",
              }}
            >
              10 Q&A fields · AI compressor · Handwriting mode · Micro mode ·
              Live A4 preview · jsPDF export
            </p>
          </div>
        </section>

        {/* Sheet title input */}
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <input
            type="text"
            className="mc-input"
            placeholder="Sheet title (e.g. Physics — Chapter 5)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            aria-label="Cheat sheet title"
            style={{
              fontSize: 15,
              fontWeight: 600,
              background: darkMode
                ? "rgba(0,245,255,0.04)"
                : "rgba(0,150,200,0.06)",
              color: darkMode ? "#e0f7ff" : "#1a3050",
              border: darkMode
                ? "1px solid rgba(0,245,255,0.15)"
                : "1px solid rgba(0,150,200,0.25)",
            }}
          />
        </div>

        {/* Main layout: Q&A + Preview */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            {/* Left: Q&A inputs + toolbar */}
            <div className="flex flex-col gap-4">
              {/* AI toolbar */}
              <div
                className="glass-panel p-3 flex flex-wrap items-center gap-2"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,150,200,0.06)",
                  borderColor: darkMode
                    ? "rgba(0,245,255,0.15)"
                    : "rgba(0,150,200,0.2)",
                }}
              >
                {/* Auto shorten */}
                <button
                  type="button"
                  className="neon-btn-cyan rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
                  onClick={handleAutoShorten}
                  title="AI compress all answers to ~50%"
                >
                  <Wand2 size={13} />🤖 Auto Shorten
                </button>

                {/* Mode pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    className={`mode-pill${mode === "normal" ? " active" : ""}`}
                    onClick={() => setMode("normal")}
                    aria-pressed={mode === "normal"}
                  >
                    <AlignJustify size={11} className="inline mr-1" />📝 Normal
                  </button>
                  <button
                    type="button"
                    className={`mode-pill${mode === "handwriting" ? " active" : ""}`}
                    onClick={() => setMode("handwriting")}
                    aria-pressed={mode === "handwriting"}
                    style={
                      mode === "handwriting"
                        ? {
                            borderColor: "rgba(168,85,247,0.6)",
                            color: "#a855f7",
                            boxShadow: "0 0 12px rgba(168,85,247,0.2)",
                          }
                        : {}
                    }
                  >
                    <PenTool size={11} className="inline mr-1" />
                    ✍️ Handwriting
                  </button>
                  <button
                    type="button"
                    className={`mode-pill${mode === "ultra-compact" ? " active" : ""}`}
                    onClick={() => setMode("ultra-compact")}
                    aria-pressed={mode === "ultra-compact"}
                    style={
                      mode === "ultra-compact"
                        ? {
                            borderColor: "rgba(255,80,80,0.6)",
                            color: "#ff5050",
                            boxShadow: "0 0 12px rgba(255,80,80,0.2)",
                          }
                        : {}
                    }
                  >
                    <Shrink size={11} className="inline mr-1" />😈 Micro Mode
                  </button>
                </div>

                {/* Bullet toggle */}
                <label
                  className="flex items-center gap-1.5 text-xs cursor-pointer ml-auto"
                  style={{
                    color: darkMode
                      ? "rgba(200,240,255,0.6)"
                      : "rgba(30,60,100,0.7)",
                  }}
                >
                  <input
                    type="checkbox"
                    className="neon-toggle"
                    checked={bulletMode}
                    onChange={(e) => setBulletMode(e.target.checked)}
                    aria-label="Bullet format toggle"
                  />
                  Bullet format
                </label>
              </div>

              {/* Q&A Fields */}
              <div
                className="flex flex-col gap-3"
                style={{
                  fontFamily:
                    mode === "handwriting" ? "'Sora', cursive" : undefined,
                }}
              >
                {pairs.map((pair, i) => (
                  <QAPairInput
                    key={QA_KEYS[i]}
                    index={i}
                    pair={pair}
                    onChange={handlePairChange}
                    hasError={errors[i]}
                  />
                ))}
              </div>

              {/* Advanced Options */}
              <div
                className="glass-panel overflow-hidden"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,150,200,0.05)",
                  borderColor: darkMode
                    ? "rgba(168,85,247,0.2)"
                    : "rgba(0,150,200,0.2)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setAdvOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  aria-expanded={advOpen}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#a855f7" }}
                  >
                    ⚙️ Advanced Options
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: "rgba(168,85,247,0.6)",
                      transform: advOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                <div className={`collapse-content${advOpen ? " open" : ""}`}>
                  <div className="px-4 pb-4 flex flex-col gap-4">
                    {/* Shuffle */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div
                          className="text-xs font-semibold"
                          style={{
                            color: darkMode ? "#e0f7ff" : "#1a3050",
                          }}
                        >
                          Shuffle Q&A Order
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{
                            color: darkMode
                              ? "rgba(200,240,255,0.4)"
                              : "rgba(30,60,100,0.5)",
                          }}
                        >
                          Randomize order in PDF
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="neon-toggle"
                        checked={shuffle}
                        onChange={(e) => setShuffle(e.target.checked)}
                        aria-label="Shuffle Q&A order"
                      />
                    </div>

                    {/* Student name */}
                    <div>
                      <label
                        className="text-xs font-semibold block mb-1.5"
                        style={{ color: darkMode ? "#e0f7ff" : "#1a3050" }}
                        htmlFor="student-name"
                      >
                        🔲 Student Name (for QR code)
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        className="mc-input"
                        style={{
                          fontSize: 13,
                          padding: "7px 10px",
                          background: darkMode
                            ? "rgba(0,245,255,0.04)"
                            : "rgba(0,150,200,0.06)",
                          color: darkMode ? "#e0f7ff" : "#1a3050",
                        }}
                        placeholder="Enter student name..."
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                      {studentName.trim() && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "rgba(0,245,255,0.55)" }}
                        >
                          ✓ QR will include name, date & time
                        </p>
                      )}
                    </div>

                    {/* Footer text */}
                    <div>
                      <label
                        className="text-xs font-semibold block mb-1.5"
                        style={{ color: darkMode ? "#e0f7ff" : "#1a3050" }}
                        htmlFor="footer-text"
                      >
                        Custom Footer Text
                      </label>
                      <input
                        id="footer-text"
                        type="text"
                        className="mc-input"
                        style={{
                          fontSize: 13,
                          padding: "7px 10px",
                          background: darkMode
                            ? "rgba(0,245,255,0.04)"
                            : "rgba(0,150,200,0.06)",
                          color: darkMode ? "#e0f7ff" : "#1a3050",
                        }}
                        placeholder="E.g. Physics — Chapter 3 | Class 12"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                      />
                    </div>

                    {/* Watermark */}
                    <div>
                      <label
                        className="text-xs font-semibold block mb-1.5"
                        style={{ color: darkMode ? "#e0f7ff" : "#1a3050" }}
                        htmlFor="watermark"
                      >
                        Watermark Text
                      </label>
                      <input
                        id="watermark"
                        type="text"
                        className="mc-input"
                        style={{
                          fontSize: 13,
                          padding: "7px 10px",
                          background: darkMode
                            ? "rgba(0,245,255,0.04)"
                            : "rgba(0,150,200,0.06)",
                          color: darkMode ? "#e0f7ff" : "#1a3050",
                        }}
                        placeholder="E.g. CONFIDENTIAL"
                        value={watermark}
                        onChange={(e) => setWatermark(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <button
                type="button"
                className="neon-btn-primary rounded-2xl px-6 py-4 text-base font-black flex items-center justify-center gap-2 w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
                aria-busy={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating... {generateProgress}%
                  </>
                ) : (
                  <>
                    <Zap size={18} />⚡ Generate Micro Cheat
                  </>
                )}
              </button>

              {/* Progress bar (visible during generation) */}
              {isGenerating && (
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 4, background: "rgba(0,245,255,0.1)" }}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${generateProgress}%`, height: "100%" }}
                  />
                </div>
              )}

              {/* Download button (after generate) */}
              {generated && !isGenerating && (
                <button
                  type="button"
                  className="neon-btn-cyan rounded-2xl px-6 py-4 text-base font-black flex items-center justify-center gap-2 w-full"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  aria-busy={isDownloading}
                  style={{
                    fontSize: 15,
                    border: "1px solid rgba(0,245,255,0.5)",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />📥 Download PDF
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right: A4 Preview */}
            <div className="hidden lg:block">
              <div
                className="glass-panel p-4 sticky top-20"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,150,200,0.04)",
                  borderColor: darkMode
                    ? "rgba(0,245,255,0.12)"
                    : "rgba(0,150,200,0.2)",
                }}
              >
                <A4Preview
                  title={title}
                  pairs={previewPairs}
                  mode={mode}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  darkPreview={darkPreview}
                  onToggleDarkPreview={() => setDarkPreview((v) => !v)}
                  watermark={watermark}
                  footerText={footerText}
                  studentName={studentName}
                  shuffle={shuffle}
                />
              </div>
            </div>
          </div>

          {/* Mobile preview (collapsible) */}
          <div className="lg:hidden mt-6">
            <details className="glass-panel">
              <summary
                className="px-4 py-3 cursor-pointer text-sm font-semibold"
                style={{ color: "rgba(0,245,255,0.8)" }}
              >
                👁 Live A4 Preview (tap to expand)
              </summary>
              <div className="p-4 overflow-x-auto">
                <A4Preview
                  title={title}
                  pairs={previewPairs}
                  mode={mode}
                  zoom={40}
                  onZoomChange={() => {}}
                  darkPreview={darkPreview}
                  onToggleDarkPreview={() => setDarkPreview((v) => !v)}
                  watermark={watermark}
                  footerText={footerText}
                  studentName={studentName}
                  shuffle={shuffle}
                />
              </div>
            </details>
          </div>
        </div>

        <Footer />
      </div>

      {/* Celebration overlay */}
      <CelebrationOverlay
        visible={celebration}
        onDismiss={() => setCelebration(false)}
      />
    </div>
  );
}
