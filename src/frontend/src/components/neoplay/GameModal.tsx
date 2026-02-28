// useRecordPlay removed — backend API no longer exists in this project
import { AlertCircle, Maximize, Minimize, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalGame } from "./gameData";
import { saveRecentlyPlayed } from "./gameData";

interface GameModalProps {
  game: LocalGame | null;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDialogElement>(null);
  // Record play on open (fire-and-forget)
  useEffect(() => {
    if (!game) return;
    setIsLoading(true);
    setHasError(false);
    saveRecentlyPlayed(game.id);
  }, [game]);

  // Escape key to close
  useEffect(() => {
    if (!game) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isFullscreen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [game, onClose, isFullscreen]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    // Re-mount iframe by clearing src and resetting
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "";
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src;
        }
      });
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // Fallback: use CSS "fullscreen"
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change (e.g. pressing Esc exits fullscreen)
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!game) return null;

  return (
    /* Use native <dialog> semantics via a positioned overlay */
    <div
      className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      aria-hidden="false"
    >
      <dialog
        ref={containerRef}
        open
        className="modal-content relative w-full flex flex-col rounded-2xl overflow-hidden"
        aria-label={`Playing ${game.title}`}
        style={{
          maxWidth: "min(1100px, 95vw)",
          maxHeight: "90vh",
          background: "var(--modal-bg)",
          border: "1px solid rgba(0,212,255,0.15)",
          boxShadow:
            "0 0 60px rgba(0,212,255,0.15), 0 30px 80px rgba(0,0,0,0.7)",
          padding: 0,
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="font-display font-bold text-base truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {game.title}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(0,212,255,0.1)",
                color: "var(--neon-cyan)",
                border: "1px solid rgba(0,212,255,0.2)",
              }}
            >
              {game.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-secondary)",
              }}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:scale-110"
              style={{
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.15)",
                color: "rgba(255,120,120,0.8)",
              }}
              aria-label="Close game"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Game area */}
        <div
          className="relative w-full flex-1"
          style={{ aspectRatio: "16/9", minHeight: "300px" }}
        >
          {/* Loading spinner */}
          {isLoading && !hasError && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
              style={{ background: "rgba(5,5,12,0.95)" }}
            >
              <div
                className="neon-spinner w-12 h-12 rounded-full"
                role="status"
                aria-label="Loading game..."
              />
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Loading {game.title}…
              </p>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 px-6"
              style={{ background: "rgba(5,5,12,0.98)" }}
            >
              <AlertCircle size={40} style={{ color: "rgba(255,80,80,0.7)" }} />
              <div className="text-center">
                <p
                  className="font-display font-bold text-base mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Game failed to load
                </p>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  The game may be temporarily unavailable or requires a
                  different browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #9b59ff)",
                }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* iframe */}
          {!hasError && (
            <iframe
              ref={iframeRef}
              src={game.embedUrl}
              title={game.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
              allow="fullscreen; autoplay"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: "block" }}
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
