import { useApp } from "@/context/AppContext";
import { formatLastActive } from "@/context/AppContext";
import type { MockUser } from "@/data/mockUsers";
import {
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  Mic,
  Send,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const QUICK_EMOJIS = ["❤️", "😍", "😊", "🔥", "✨", "💫", "😂", "👍"];

interface Props {
  initialMatchId?: string | null;
}

export function ChatPage({ initialMatchId }: Props) {
  const {
    matches,
    currentUser,
    messages,
    sendMessage,
    markMessagesSeen,
    getMatchUser,
    connectionRequests,
    respondToRequest,
  } = useApp();

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"matches" | "requests">(
    "matches",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rateLimitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) ?? null;
  const selectedUser: MockUser | undefined = selectedMatchId
    ? getMatchUser(selectedMatchId)
    : undefined;

  // Pending requests for current user
  const pendingRequests = connectionRequests.filter(
    (r) => r.toId === currentUser?.id && r.status === "pending",
  );

  // Select initial match
  useEffect(() => {
    if (initialMatchId) {
      setSelectedMatchId(initialMatchId);
    } else if (matches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(matches[0].id);
    }
  }, [initialMatchId, matches, selectedMatchId]);

  // Mark messages as seen when conversation is opened
  useEffect(() => {
    if (selectedMatchId) {
      markMessagesSeen(selectedMatchId);
    }
  }, [selectedMatchId, markMessagesSeen]);

  // Auto-scroll messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef is stable
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedMatchId]);

  // Show typing indicator when waiting for auto-reply
  useEffect(() => {
    if (!selectedMatchId || !selectedUser) return;
    const matchMessages = messages[selectedMatchId] ?? [];
    const lastMsg = matchMessages[matchMessages.length - 1];
    if (lastMsg && lastMsg.fromId === currentUser?.id) {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 1600);
    } else {
      setIsTyping(false);
    }
  }, [messages, selectedMatchId, selectedUser, currentUser?.id]);

  // Poll for new messages every 3 seconds (re-render trigger)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMatchId) {
        markMessagesSeen(selectedMatchId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedMatchId, markMessagesSeen]);

  const handleSend = useCallback(() => {
    if (!selectedMatchId || !inputText.trim()) return;

    const ok = sendMessage(selectedMatchId, inputText.trim());
    if (!ok) {
      // Rate limited
      setIsRateLimited(true);
      if (rateLimitRef.current) clearTimeout(rateLimitRef.current);
      rateLimitRef.current = setTimeout(() => setIsRateLimited(false), 5000);
      return;
    }
    setInputText("");
  }, [selectedMatchId, inputText, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  function addEmoji(emoji: string) {
    setInputText((t) => t + emoji);
  }

  const currentMessages = selectedMatchId
    ? (messages[selectedMatchId] ?? [])
    : [];

  if (matches.length === 0 && pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <MessageCircle
          size={48}
          style={{ color: "rgba(255,45,120,0.35)", marginBottom: 16 }}
        />
        <p
          className="text-xl font-bold mb-2"
          style={{ color: "rgba(240,230,255,0.5)" }}
        >
          No matches yet
        </p>
        <p
          className="text-sm text-center"
          style={{ color: "rgba(240,230,255,0.3)" }}
        >
          Match with someone to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-140px)] flex gap-4">
      {/* Sidebar */}
      <div
        className="hidden md:flex flex-col gap-2 overflow-hidden"
        style={{ width: 260, flexShrink: 0 }}
      >
        {/* Sidebar tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarTab("matches")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background:
                sidebarTab === "matches"
                  ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(155,93,229,0.15))"
                  : "transparent",
              color:
                sidebarTab === "matches" ? "#ff2d78" : "rgba(240,230,255,0.4)",
              border:
                sidebarTab === "matches"
                  ? "1px solid rgba(255,45,120,0.3)"
                  : "1px solid transparent",
            }}
          >
            <Heart size={11} />
            Matches ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("requests")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative"
            style={{
              background:
                sidebarTab === "requests"
                  ? "linear-gradient(135deg, rgba(0,245,212,0.15), rgba(155,93,229,0.1))"
                  : "transparent",
              color:
                sidebarTab === "requests" ? "#00f5d4" : "rgba(240,230,255,0.4)",
              border:
                sidebarTab === "requests"
                  ? "1px solid rgba(0,245,212,0.3)"
                  : "1px solid transparent",
            }}
          >
            <Users size={11} />
            Requests
            {pendingRequests.length > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-black"
                style={{
                  width: 14,
                  height: 14,
                  background: "#ff2d78",
                  color: "white",
                }}
              >
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Matches list */}
        {sidebarTab === "matches" && (
          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
            {matches.map((match) => {
              const user = getMatchUser(match.id);
              if (!user) return null;
              const regUser = user as { lastActive?: number };
              const lastActiveStr = regUser.lastActive
                ? formatLastActive(regUser.lastActive)
                : undefined;
              const isOnline = lastActiveStr === "Online";
              const matchMsgs = messages[match.id] ?? [];
              const lastMsg = matchMsgs[matchMsgs.length - 1];
              const isSelected = selectedMatchId === match.id;
              const unreadCount = matchMsgs.filter(
                (m) => m.toId === currentUser?.id && !m.seenAt,
              ).length;

              return (
                <button
                  type="button"
                  key={match.id}
                  onClick={() => {
                    setSelectedMatchId(match.id);
                    markMessagesSeen(match.id);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 w-full"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(155,93,229,0.1))"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "1px solid rgba(255,45,120,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isSelected
                      ? "0 0 16px rgba(255,45,120,0.1)"
                      : "none",
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: "1.5px solid rgba(255,45,120,0.3)" }}
                    />
                    {isOnline && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
                        style={{ background: "#00f5d4", width: 10, height: 10 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {user.name}
                      </p>
                      {unreadCount > 0 && (
                        <span
                          className="flex items-center justify-center rounded-full text-[9px] font-black flex-shrink-0"
                          style={{
                            width: 16,
                            height: 16,
                            background: "#ff2d78",
                            color: "white",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "rgba(240,230,255,0.4)" }}
                    >
                      {lastMsg ? lastMsg.text : "Say hi! 👋"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Requests list */}
        {sidebarTab === "requests" && (
          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Users size={24} style={{ color: "rgba(255,255,255,0.2)" }} />
                <p
                  className="text-xs text-center"
                  style={{ color: "rgba(240,230,255,0.3)" }}
                >
                  No pending requests
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => {
                const sender = getMatchUser(req.fromId) as MockUser | undefined;
                const senderName = sender?.name ?? "Someone";
                const senderAvatar = sender?.avatarUrl;
                return (
                  <div
                    key={req.id}
                    className="flex flex-col gap-2 p-3 rounded-2xl"
                    style={{
                      background: "rgba(255,45,120,0.06)",
                      border: "1px solid rgba(255,45,120,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {senderAvatar ? (
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          loading="lazy"
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          style={{ border: "1px solid rgba(255,45,120,0.3)" }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,45,120,0.15)" }}
                        >
                          <Users size={14} style={{ color: "#ff2d78" }} />
                        </div>
                      )}
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {senderName} wants to connect
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => respondToRequest(req.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200"
                        style={{
                          background: "rgba(0,245,212,0.1)",
                          border: "1px solid rgba(0,245,212,0.3)",
                          color: "#00f5d4",
                        }}
                      >
                        <UserCheck size={10} />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respondToRequest(req.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200"
                        style={{
                          background: "rgba(255,80,80,0.08)",
                          border: "1px solid rgba(255,80,80,0.25)",
                          color: "#ff5050",
                        }}
                      >
                        <UserX size={10} />
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Chat window */}
      <div
        className="flex-1 flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,45,120,0.15)",
        }}
      >
        {selectedUser && selectedMatch ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,45,120,0.1)",
              }}
            >
              <div className="relative">
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: "2px solid rgba(255,45,120,0.4)" }}
                />
                {(() => {
                  const regUser = selectedUser as { lastActive?: number };
                  const isOnline =
                    regUser.lastActive &&
                    Date.now() - regUser.lastActive < 5 * 60 * 1000;
                  return isOnline ? (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
                      style={{ background: "#00f5d4", width: 10, height: 10 }}
                    />
                  ) : null;
                })()}
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedUser.name}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: (() => {
                      const regUser = selectedUser as { lastActive?: number };
                      return regUser.lastActive &&
                        Date.now() - regUser.lastActive < 5 * 60 * 1000
                        ? "#00f5d4"
                        : "rgba(240,230,255,0.35)";
                    })(),
                  }}
                >
                  {(() => {
                    const regUser = selectedUser as { lastActive?: number };
                    return regUser.lastActive
                      ? formatLastActive(regUser.lastActive)
                      : selectedUser.isOnline
                        ? "Online now"
                        : "Offline";
                  })()}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Heart
                  size={16}
                  fill="#ff2d78"
                  style={{ color: "#ff2d78", opacity: 0.7 }}
                />
                <span style={{ color: "rgba(240,230,255,0.4)", fontSize: 12 }}>
                  {selectedMatch.compatibilityScore}% match
                </span>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
              style={{ minHeight: 0 }}
            >
              {currentMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 60,
                      height: 60,
                      background:
                        "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(155,93,229,0.15))",
                      border: "1px solid rgba(255,45,120,0.2)",
                    }}
                  >
                    <Heart
                      size={24}
                      fill="#ff2d78"
                      style={{ color: "#ff2d78" }}
                    />
                  </div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "rgba(240,230,255,0.5)" }}
                  >
                    You matched with {selectedUser.name}!
                  </p>
                  <p
                    className="text-xs text-center"
                    style={{ color: "rgba(240,230,255,0.3)" }}
                  >
                    Be the first to say something 💬
                  </p>
                </div>
              )}

              {currentMessages.map((msg, idx) => {
                const isSent = msg.fromId === currentUser?.id;
                const time = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isLastSent =
                  isSent &&
                  idx === currentMessages.length - 1 &&
                  !currentMessages
                    .slice(idx + 1)
                    .some((m) => m.fromId === currentUser?.id);

                return (
                  <div
                    key={msg.id}
                    className="flex"
                    style={{
                      justifyContent: isSent ? "flex-end" : "flex-start",
                      animation: "fadeInUp 0.25s ease both",
                    }}
                  >
                    <div className="flex flex-col" style={{ maxWidth: "75%" }}>
                      <div
                        className={
                          isSent ? "chat-bubble-sent" : "chat-bubble-received"
                        }
                      >
                        <p
                          style={{
                            color: "rgba(240,230,255,0.9)",
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.text}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1 mt-1"
                        style={{
                          justifyContent: isSent ? "flex-end" : "flex-start",
                        }}
                      >
                        <span
                          className="text-[10px]"
                          style={{ color: "rgba(240,230,255,0.25)" }}
                        >
                          {time}
                        </span>
                        {isSent && (
                          <span>
                            {msg.seenAt ? (
                              <CheckCheck
                                size={11}
                                style={{ color: "#00f5d4" }}
                                aria-label="Seen"
                              />
                            ) : (
                              <Check
                                size={11}
                                style={{ color: "rgba(240,230,255,0.3)" }}
                                aria-label="Sent"
                              />
                            )}
                          </span>
                        )}
                        {isSent && isLastSent && msg.seenAt && (
                          <span
                            className="text-[9px] font-semibold"
                            style={{ color: "#00f5d4" }}
                          >
                            Seen
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex" style={{ justifyContent: "flex-start" }}>
                  <div className="chat-bubble-received">
                    <div className="flex items-center gap-1">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Emoji row */}
            <div
              className="flex items-center gap-2 px-5 py-2"
              style={{ borderTop: "1px solid rgba(255,45,120,0.08)" }}
            >
              {QUICK_EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => addEmoji(e)}
                  className="text-lg transition-transform duration-150 hover:scale-125"
                  style={{
                    lineHeight: 1.2,
                    background: "none",
                    border: "none",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: "1px solid rgba(255,45,120,0.1)" }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRateLimited
                    ? "Slow down... 🐌"
                    : `Message ${selectedUser.name}...`
                }
                disabled={isRateLimited}
                className="flex-1 dating-input"
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  opacity: isRateLimited ? 0.5 : 1,
                }}
              />

              {/* Voice (UI only) */}
              <button
                type="button"
                className="flex-shrink-0 flex items-center justify-center rounded-xl p-3 transition-all duration-200"
                style={{
                  background: "rgba(155,93,229,0.1)",
                  border: "1px solid rgba(155,93,229,0.3)",
                  color: "#9b5de5",
                }}
                aria-label="Voice message"
                title="Voice message (UI only)"
              >
                <Mic size={16} />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || isRateLimited}
                className="flex-shrink-0 flex items-center justify-center rounded-xl p-3 neon-btn-primary transition-all duration-200"
                style={{
                  opacity: inputText.trim() && !isRateLimited ? 1 : 0.4,
                }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Rate limit warning */}
            {isRateLimited && (
              <div
                className="px-4 py-2 text-xs text-center"
                style={{
                  background: "rgba(255,80,80,0.08)",
                  color: "#ff5050",
                  borderTop: "1px solid rgba(255,80,80,0.1)",
                }}
              >
                Slow down — message limit reached. Try again in a few seconds.
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 14 }}>
              {matches.length > 0
                ? "Select a match to start chatting"
                : "No matches yet — start swiping!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
