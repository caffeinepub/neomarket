import type { MockUser } from "@/data/mockUsers";
import { CheckCircle, Clock, Heart, MapPin, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CompatibilityMeter } from "./CompatibilityMeter";

interface Props {
  user: MockUser;
  compatScore: number;
  onSwipe: (direction: "like" | "pass") => void;
  stackIndex: number;
  lastActiveStr?: string;
}

export function SwipeCard({
  user,
  compatScore,
  onSwipe,
  stackIndex,
  lastActiveStr,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [isFlyingOff, setIsFlyingOff] = useState<"like" | "pass" | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const THRESHOLD = 100;
  const MAX_ROTATE = 18;
  const rotation = (dragX / 300) * MAX_ROTATE;
  const likeOpacity = Math.max(0, Math.min(1, dragX / THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / THRESHOLD));

  const isOnline = lastActiveStr === "Online";

  function startDrag(clientX: number, clientY: number) {
    isDragging.current = true;
    startX.current = clientX;
    startY.current = clientY;
    cardRef.current?.classList.add("dragging");
  }

  function moveDrag(clientX: number) {
    if (!isDragging.current) return;
    const dx = clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  }

  function endDrag() {
    if (!isDragging.current) return;
    isDragging.current = false;
    cardRef.current?.classList.remove("dragging");
    const dx = currentX.current;

    if (Math.abs(dx) >= THRESHOLD) {
      const dir = dx > 0 ? "like" : "pass";
      setIsFlyingOff(dir);
      setTimeout(() => onSwipe(dir), 350);
    } else {
      setDragX(0);
      currentX.current = 0;
    }
  }

  // Mouse events
  function onMouseDown(e: React.MouseEvent) {
    if (stackIndex !== 0) return;
    startDrag(e.clientX, e.clientY);
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      moveDrag(e.clientX);
    }
    function onMouseUp() {
      endDrag();
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  // Touch events
  function onTouchStart(e: React.TouchEvent) {
    if (stackIndex !== 0) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current) return;
    moveDrag(e.touches[0].clientX);
  }

  function onTouchEnd() {
    endDrag();
  }

  const STACK_OFFSETS = [
    { scale: 1, y: 0, z: 3 },
    { scale: 0.94, y: 16, z: 2 },
    { scale: 0.88, y: 32, z: 1 },
  ];

  const s = STACK_OFFSETS[stackIndex] ?? { scale: 0.82, y: 48, z: 0 };
  const transform = isFlyingOff
    ? isFlyingOff === "like"
      ? "translate(150%, -20%) rotate(30deg)"
      : "translate(-150%, -20%) rotate(-30deg)"
    : stackIndex === 0
      ? `translateX(${dragX}px) rotate(${rotation}deg) scale(${s.scale}) translateY(${s.y}px)`
      : `scale(${s.scale}) translateY(${s.y}px)`;

  const lifestyle_colors: Record<string, string> = {
    active: "#00f5d4",
    homebody: "#9b5de5",
    adventurer: "#ff2d78",
    creative: "#ffd60a",
  };

  const hoverGlow =
    isHovered && stackIndex === 0
      ? "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(255,45,120,0.35), 0 0 50px rgba(155,93,229,0.2)"
      : stackIndex === 0
        ? "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(255,45,120,0.1)"
        : "0 10px 30px rgba(0,0,0,0.5)";

  return (
    <div
      ref={cardRef}
      className="swipe-card"
      style={{
        zIndex: s.z,
        transform,
        transition: isDragging.current
          ? "none"
          : "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease",
        pointerEvents: stackIndex === 0 ? "auto" : "none",
        boxShadow: hoverGlow,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Card image */}
      <div
        className="relative"
        style={{ height: 420, background: "#1a0a1f", borderRadius: 24 }}
      >
        <img
          src={user.avatarUrl}
          alt={user.name}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ borderRadius: 24 }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
            borderRadius: 24,
          }}
        />

        {/* LIKE overlay */}
        <div
          className="swipe-card-like-overlay"
          style={{ opacity: likeOpacity }}
        >
          <div
            style={{
              background: "rgba(0,245,80,0.2)",
              borderRadius: 16,
              padding: "10px 20px",
              border: "3px solid rgba(0,245,80,0.9)",
            }}
          >
            <span
              style={{
                color: "#00f550",
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              LIKE
            </span>
          </div>
        </div>

        {/* NOPE overlay */}
        <div
          className="swipe-card-nope-overlay"
          style={{ opacity: nopeOpacity }}
        >
          <div
            style={{
              background: "rgba(255,50,50,0.2)",
              borderRadius: 16,
              padding: "10px 20px",
              border: "3px solid rgba(255,80,80,0.9)",
            }}
          >
            <span
              style={{
                color: "#ff5050",
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              NOPE
            </span>
          </div>
        </div>

        {/* Online / Last active badge */}
        {lastActiveStr && (
          <div
            className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            {isOnline ? (
              <span className="online-dot" style={{ width: 7, height: 7 }} />
            ) : (
              <Clock size={9} style={{ color: "rgba(240,230,255,0.5)" }} />
            )}
            <span
              style={{
                color: isOnline ? "#00f5d4" : "rgba(240,230,255,0.55)",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {lastActiveStr.toUpperCase()}
            </span>
          </div>
        )}

        {/* Like count */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <Heart size={11} fill="#ff2d78" style={{ color: "#ff2d78" }} />
          <span
            style={{
              color: "rgba(240,230,255,0.8)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {user.likeCount.toLocaleString()}
          </span>
        </div>

        {/* Bottom info */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ borderRadius: "0 0 24px 24px" }}
        >
          {/* Name + age + verified */}
          <div className="flex items-center gap-2 mb-1">
            <span
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 800,
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              {user.name}
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 20,
                fontWeight: 400,
              }}
            >
              {user.age}
            </span>
            {user.isVerified && (
              <CheckCircle
                size={16}
                style={{ color: "#00f5d4" }}
                fill="rgba(0,245,212,0.2)"
              />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              {user.location}
            </span>
          </div>

          {/* Lifestyle badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: `rgba(${lifestyle_colors[user.lifestyle]}, 0.15)`,
                border: `1px solid ${lifestyle_colors[user.lifestyle]}40`,
                color: lifestyle_colors[user.lifestyle],
              }}
            >
              <Zap size={9} />
              {user.lifestyle.toUpperCase()}
            </span>
          </div>

          {/* Hobbies */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {user.hobbies.slice(0, 3).map((h) => (
              <span
                key={h}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Compatibility */}
          <CompatibilityMeter score={compatScore} showLabel size="sm" />
        </div>
      </div>
    </div>
  );
}
