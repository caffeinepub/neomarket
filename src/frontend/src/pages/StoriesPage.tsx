import { useApp } from "@/context/AppContext";
import type { Story } from "@/context/AppContext";
import { MOCK_USERS } from "@/data/mockUsers";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function StoriesPage() {
  const { stories, currentUser, markStorySeen, addStory } = useApp();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openStory(story: Story, idx: number) {
    setActiveStory(story);
    setStoryIndex(idx);
    markStorySeen(story.id);
  }

  function closeStory() {
    setActiveStory(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function nextStory() {
    if (storyIndex < stories.length - 1) {
      const next = stories[storyIndex + 1];
      setStoryIndex(storyIndex + 1);
      setActiveStory(next);
      markStorySeen(next.id);
    } else {
      closeStory();
    }
  }

  function prevStory() {
    if (storyIndex > 0) {
      const prev = stories[storyIndex - 1];
      setStoryIndex(storyIndex - 1);
      setActiveStory(prev);
    }
  }

  // Auto-advance every 5s
  // biome-ignore lint/correctness/useExhaustiveDependencies: nextStory intentionally excluded to avoid re-registering on every render
  useEffect(() => {
    if (!activeStory) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      nextStory();
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStory]);

  function handleAddStory(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addStory(url);
  }

  function getUserForStory(story: Story) {
    if (story.userId === currentUser?.id) return currentUser;
    return MOCK_USERS.find((u) => u.id === story.userId);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2
          className="text-3xl font-black font-display mb-2"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Stories
        </h2>
        <p style={{ color: "rgba(240,230,255,0.45)", fontSize: 14 }}>
          See what your matches are up to
        </p>
      </div>

      {/* Stories row */}
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Add Story button */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: 72,
              height: 72,
              background:
                "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(155,93,229,0.15))",
              border: "2px dashed rgba(255,45,120,0.4)",
              color: "#ff2d78",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 20px rgba(255,45,120,0.3)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,45,120,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,45,120,0.4)";
            }}
            aria-label="Add story"
          >
            <Plus size={24} />
          </button>
          <span
            style={{
              color: "rgba(240,230,255,0.4)",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Add Story
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddStory}
            aria-label="Upload story image"
          />
        </div>

        {/* Story bubbles */}
        {stories.map((story, idx) => {
          const storyUser = getUserForStory(story);
          if (!storyUser) return null;
          return (
            <button
              type="button"
              key={story.id}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
              onClick={() => openStory(story, idx)}
              aria-label={`View ${storyUser.name}'s story`}
            >
              <div
                className={story.seen ? "story-ring-seen" : "story-ring"}
                style={{
                  padding: 3,
                  borderRadius: "50%",
                  width: 72,
                  height: 72,
                }}
              >
                <img
                  src={storyUser.avatarUrl ?? ""}
                  alt={storyUser.name}
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover"
                  style={{ display: "block" }}
                />
              </div>
              <span
                style={{
                  color: story.seen
                    ? "rgba(240,230,255,0.3)"
                    : "rgba(240,230,255,0.75)",
                  fontSize: 11,
                  fontWeight: story.seen ? 400 : 600,
                  maxWidth: 72,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {storyUser.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Story grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {stories.map((story, idx) => {
          const storyUser = getUserForStory(story);
          if (!storyUser) return null;
          return (
            <button
              type="button"
              key={story.id}
              onClick={() => openStory(story, idx)}
              className="relative rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
              style={{ aspectRatio: "9/16", background: "#1a0a1f" }}
            >
              <img
                src={story.imageUrl}
                alt={storyUser.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 50%)",
                }}
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                <img
                  src={storyUser.avatarUrl ?? ""}
                  alt={storyUser.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  style={{ border: "1.5px solid rgba(255,45,120,0.5)" }}
                />
                <span
                  className="truncate"
                  style={{ color: "white", fontSize: 12, fontWeight: 600 }}
                >
                  {storyUser.name.split(" ")[0]}
                </span>
              </div>
              {!story.seen && (
                <div
                  className="absolute top-2 right-2 rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: "#ff2d78",
                    boxShadow: "0 0 6px rgba(255,45,120,0.8)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Story viewer modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
        >
          <div
            className="relative"
            style={{
              width: "min(380px, 90vw)",
              maxHeight: "90vh",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Progress bars */}
            <div
              className="absolute top-3 left-3 right-3 z-10 flex gap-1"
              style={{ zIndex: 20 }}
            >
              {stories.map((s, i) => (
                <div key={s.id} className="story-progress-bar">
                  <div
                    ref={i === storyIndex ? progressRef : null}
                    className={`story-progress-fill ${i === storyIndex ? "animating" : ""}`}
                    style={{
                      width:
                        i < storyIndex
                          ? "100%"
                          : i === storyIndex
                            ? undefined
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story image */}
            <img
              src={activeStory.imageUrl}
              alt="Story"
              className="w-full object-cover"
              style={{ height: "80vh", maxHeight: 600 }}
            />

            {/* Overlay gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)",
              }}
            />

            {/* User info */}
            <div className="absolute bottom-6 left-4 right-4 flex items-center gap-3">
              {(() => {
                const u = getUserForStory(activeStory);
                return u ? (
                  <>
                    <img
                      src={u.avatarUrl ?? ""}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: "2px solid rgba(255,45,120,0.6)" }}
                    />
                    <div>
                      <p
                        style={{
                          color: "white",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {u.name}
                      </p>
                      <p
                        style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                      >
                        {new Date(activeStory.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : null;
              })()}
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={closeStory}
              className="absolute top-4 right-4 z-30 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(0,0,0,0.6)",
                width: 32,
                height: 32,
                color: "white",
                zIndex: 30,
              }}
              aria-label="Close story"
            >
              <X size={18} />
            </button>

            {/* Prev / Next tap zones */}
            <button
              type="button"
              className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-start pl-3"
              style={{ width: "40%", background: "none", border: "none" }}
              onClick={prevStory}
              aria-label="Previous story"
            >
              {storyIndex > 0 && (
                <ChevronLeft
                  size={28}
                  style={{ color: "rgba(255,255,255,0.6)" }}
                />
              )}
            </button>
            <button
              type="button"
              className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-end pr-3"
              style={{ width: "40%", background: "none", border: "none" }}
              onClick={nextStory}
              aria-label="Next story"
            >
              <ChevronRight
                size={28}
                style={{ color: "rgba(255,255,255,0.6)" }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
