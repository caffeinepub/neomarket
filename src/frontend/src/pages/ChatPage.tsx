import { useApp } from "@/context/AppContext";
import type { MockUser } from "@/data/mockUsers";
import { Heart, MessageCircle, Mic, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const QUICK_EMOJIS = ["❤️", "😍", "😊", "🔥", "✨", "💫", "😂", "👍"];

interface Props {
  initialUserId?: string | null;
}

export function ChatPage({ initialUserId }: Props) {
  const { matches, currentUser, messages, sendMessage } = useApp();
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Select initial user from prop
  useEffect(() => {
    if (initialUserId) {
      const user = matches.find((m) => m.id === initialUserId);
      if (user) setSelectedUser(user);
    } else if (matches.length > 0 && !selectedUser) {
      setSelectedUser(matches[0]);
    }
  }, [initialUserId, matches, selectedUser]);

  // Auto-scroll messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef is a stable ref
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Show typing indicator when waiting for auto-reply
  useEffect(() => {
    if (!selectedUser) return;
    const userMessages = messages[selectedUser.id] ?? [];
    const lastMsg = userMessages[userMessages.length - 1];
    if (lastMsg && lastMsg.fromId === currentUser?.id) {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 1600);
    } else {
      setIsTyping(false);
    }
  }, [messages, selectedUser, currentUser?.id]);

  const handleSend = useCallback(() => {
    if (!selectedUser || !inputText.trim()) return;
    sendMessage(selectedUser.id, inputText.trim());
    setInputText("");
  }, [selectedUser, inputText, sendMessage]);

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

  const currentMessages = selectedUser ? (messages[selectedUser.id] ?? []) : [];

  if (matches.length === 0) {
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
      {/* Sidebar: match list */}
      <div
        className="hidden md:flex flex-col gap-2 overflow-y-auto"
        style={{ width: 260, flexShrink: 0 }}
      >
        <h3
          className="text-sm font-bold mb-2 px-2"
          style={{ color: "rgba(240,230,255,0.5)", letterSpacing: "0.1em" }}
        >
          MATCHES ({matches.length})
        </h3>
        {matches.map((user) => {
          const userMsgs = messages[user.id] ?? [];
          const lastMsg = userMsgs[userMsgs.length - 1];
          const isSelected = selectedUser?.id === user.id;

          return (
            <button
              type="button"
              key={user.id}
              onClick={() => setSelectedUser(user)}
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
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: "1.5px solid rgba(255,45,120,0.3)" }}
                />
                {user.isOnline && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
                    style={{ background: "#00f5d4", width: 10, height: 10 }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.name}
                </p>
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

      {/* Chat window */}
      <div
        className="flex-1 flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,45,120,0.15)",
        }}
      >
        {selectedUser ? (
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
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: "2px solid rgba(255,45,120,0.4)" }}
                />
                {selectedUser.isOnline && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
                    style={{ background: "#00f5d4", width: 10, height: 10 }}
                  />
                )}
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
                    color: selectedUser.isOnline
                      ? "#00f5d4"
                      : "rgba(240,230,255,0.35)",
                  }}
                >
                  {selectedUser.isOnline ? "Online now" : "Offline"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Heart
                  size={16}
                  fill="#ff2d78"
                  style={{ color: "#ff2d78", opacity: 0.7 }}
                />
                <span style={{ color: "rgba(240,230,255,0.4)", fontSize: 12 }}>
                  Matched
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

              {currentMessages.map((msg) => {
                const isSent = msg.fromId === currentUser?.id;
                const time = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
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
                      <span
                        className="mt-1 text-[10px]"
                        style={{
                          color: "rgba(240,230,255,0.25)",
                          textAlign: isSent ? "right" : "left",
                        }}
                      >
                        {time}
                      </span>
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
                placeholder={`Message ${selectedUser.name}...`}
                className="flex-1 dating-input"
                style={{ padding: "10px 14px", fontSize: 14 }}
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
                disabled={!inputText.trim()}
                className="flex-shrink-0 flex items-center justify-center rounded-xl p-3 neon-btn-primary transition-all duration-200"
                style={{
                  opacity: inputText.trim() ? 1 : 0.4,
                }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "rgba(240,230,255,0.3)", fontSize: 14 }}>
              Select a match to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
