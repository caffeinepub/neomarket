import { useScrollProgress } from "@/hooks/useScrollProgress";

/**
 * Thin neon progress bar that tracks scroll position at the very top of the page.
 */
export function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      style={{ background: "transparent" }}
    >
      <div
        className="scroll-progress-bar h-full transition-none"
        style={{ width: `${progress}%` }}
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />
    </div>
  );
}
