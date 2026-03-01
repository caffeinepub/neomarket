import { useEffect, useRef, useState } from "react";

interface CelebrationOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  isCircle: boolean;
}

const COLORS = [
  "#00ffff",
  "#bf00ff",
  "#00ff88",
  "#ff6b6b",
  "#ffd93d",
  "#6bcbff",
  "#ff8c42",
  "#ffffff",
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    duration: Math.random() * 2 + 2.5,
    delay: Math.random() * 1.5,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
}

export function CelebrationOverlay({
  visible,
  onDismiss,
}: CelebrationOverlayProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [confetti] = useState(() => generateConfetti(100));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (visible) {
      setFadingOut(false);
      dialogRef.current?.focus();
      // Auto-dismiss after 5s
      timerRef.current = setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => onDismiss(), 500);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFadingOut(true);
    setTimeout(() => onDismiss(), 500);
  };

  if (!visible) return null;

  return (
    <dialog
      ref={dialogRef}
      open
      className={`celebration-overlay${fadingOut ? " fading-out" : ""}`}
      onClick={handleDismiss}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          handleDismiss();
        }
      }}
      aria-label="Celebration message"
      style={{
        border: "none",
        padding: 0,
        maxWidth: "100vw",
        maxHeight: "100vh",
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          aria-hidden="true"
          style={{
            left: `${piece.x}vw`,
            top: "-20px",
            width: piece.size,
            height: piece.size,
            background: piece.color,
            borderRadius: piece.isCircle ? "50%" : "2px",
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
            boxShadow: `0 0 4px ${piece.color}`,
          }}
        />
      ))}

      {/* Message */}
      <div className="celebration-text">
        🎉 AJIT BABA KI KRIPA SE
        <br />
        TU PASS HOJAYE BETA 🎉
      </div>

      <p
        className="mt-6 text-sm"
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        Click anywhere to dismiss
      </p>

      <p
        className="mt-2 text-xs"
        style={{
          color: "rgba(0,255,255,0.4)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        PDF downloaded successfully ✓
      </p>
    </dialog>
  );
}
