import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function animate() {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      if (el) {
        el.style.transform = `translate(${currentX - 20}px, ${currentY - 20}px)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none"
      style={{
        zIndex: 1,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255, 45, 120, 0.25) 0%, rgba(155, 93, 229, 0.1) 60%, transparent 100%)",
        opacity: 0.7,
        transition: "opacity 0.2s ease",
        top: 0,
        left: 0,
      }}
    />
  );
}
