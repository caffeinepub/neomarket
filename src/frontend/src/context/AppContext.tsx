import { ADMIN_USER, MOCK_USERS, type MockUser } from "@/data/mockUsers";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number;
  seen: boolean;
}

export interface CurrentUser extends MockUser {
  isAdmin?: boolean;
  profileImage?: string;
}

interface AppContextValue {
  // Auth
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  signup: (data: Partial<MockUser> & { password: string }) => boolean;
  logout: () => void;

  // Users
  users: MockUser[];
  swipeQueue: MockUser[];
  likedUserIds: string[];
  passedUserIds: string[];
  matches: MockUser[];
  notifications: number;
  clearNotifications: () => void;

  // Actions
  swipe: (userId: string, direction: "like" | "pass") => "match" | null;
  sendMessage: (toUserId: string, text: string) => void;
  messages: Record<string, Message[]>;
  getCompatibilityScore: (userA: MockUser, userB: MockUser) => number;
  updateProfile: (data: Partial<CurrentUser>) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  bannedUserIds: string[];
  onlineCount: number;

  // Stories
  stories: Story[];
  markStorySeen: (storyId: string) => void;
  addStory: (imageUrl: string) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────

const LS_KEYS = {
  auth: "neodate_auth",
  liked: "neodate_liked",
  passed: "neodate_passed",
  messages: "neodate_messages",
  dark: "neodate_dark",
  banned: "neodate_banned",
};

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore
  }
}

const AUTO_REPLIES = [
  "Hey! That's so interesting 😊",
  "I totally agree! Tell me more...",
  "Haha, you're hilarious! 😂",
  "Wow, really? That sounds amazing!",
  "That's exactly how I feel too ❤️",
  "Ok now I'm intrigued... 👀",
  "No way! That's wild 🔥",
  "You seem like a lot of fun!",
  "Aww, that made me smile 😍",
  "I could talk to you all day ✨",
];

// Generate mock stories
function buildStories(): Story[] {
  return MOCK_USERS.slice(0, 12).map((u, i) => ({
    id: `story_${u.id}`,
    userId: u.id,
    imageUrl: `https://picsum.photos/seed/${u.id}/400/700`,
    timestamp: Date.now() - i * 3600000,
    seen: false,
  }));
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth ──────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = loadLS<CurrentUser | null>(LS_KEYS.auth, null);
    return saved;
  });

  // ── Swipe state ───────────────────────────────────────────────────
  const [likedUserIds, setLikedUserIds] = useState<string[]>(() =>
    loadLS(LS_KEYS.liked, []),
  );
  const [passedUserIds, setPassedUserIds] = useState<string[]>(() =>
    loadLS(LS_KEYS.passed, []),
  );

  // ── Messages ──────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Record<string, Message[]>>(() =>
    loadLS(LS_KEYS.messages, {}),
  );

  // ── Dark mode ──────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => loadLS(LS_KEYS.dark, true));

  // ── Notifications ──────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(3);

  // ── Admin: banned users ────────────────────────────────────────────
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(() =>
    loadLS(LS_KEYS.banned, []),
  );

  // ── Stories ────────────────────────────────────────────────────────
  const [stories, setStories] = useState<Story[]>(buildStories);

  // ── Auto-reply timer refs ──────────────────────────────────────────
  const autoReplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Computed ───────────────────────────────────────────────────────
  const swipeQueue = useMemo(() => {
    if (!currentUser) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) =>
        !likedUserIds.includes(u.id) &&
        !passedUserIds.includes(u.id) &&
        u.id !== currentUser.id,
    );
  }, [currentUser, likedUserIds, passedUserIds]);

  const matches = useMemo(() => {
    // Simulate: every liked user has "liked back" (for demo)
    return MOCK_USERS.filter((u) => likedUserIds.includes(u.id));
  }, [likedUserIds]);

  const onlineCount = useMemo(
    () => MOCK_USERS.filter((u) => u.isOnline).length,
    [],
  );

  // ── Compatibility score ────────────────────────────────────────────
  const getCompatibilityScore = useCallback(
    (userA: MockUser, userB: MockUser): number => {
      const sharedHobbies = userA.hobbies.filter((h) =>
        userB.hobbies.map((bh) => bh.toLowerCase()).includes(h.toLowerCase()),
      ).length;
      const sharedInterests = userA.interests.filter((i) =>
        userB.interests.map((bi) => bi.toLowerCase()).includes(i.toLowerCase()),
      ).length;
      const sameLifestyle = userA.lifestyle === userB.lifestyle ? 20 : 0;
      const ageDiff = Math.abs(userA.age - userB.age);
      const ageScore = Math.max(0, 20 - ageDiff * 4);
      const score =
        sharedHobbies * 10 + sharedInterests * 5 + sameLifestyle + ageScore;
      return Math.min(100, score);
    },
    [],
  );

  // ── Auth functions ──────────────────────────────────────────────────
  const login = useCallback((username: string, password: string): boolean => {
    // Admin login
    if (username === "admin" && password === "admin123") {
      const adminUser: CurrentUser = { ...ADMIN_USER, isAdmin: true };
      setCurrentUser(adminUser);
      saveLS(LS_KEYS.auth, adminUser);
      setNotifications(0);
      return true;
    }
    // Demo login — any email/password
    const existingUser = MOCK_USERS.find(
      (u) =>
        u.name.toLowerCase().replace(/\s+/g, "") ===
        username.toLowerCase().replace(/\s+/g, ""),
    );
    const demoUser: CurrentUser = existingUser ?? {
      ...MOCK_USERS[0],
      id: `user_${Date.now()}`,
      name: username || "NeoUser",
    };
    setCurrentUser(demoUser);
    saveLS(LS_KEYS.auth, demoUser);
    return true;
  }, []);

  const signup = useCallback(
    (data: Partial<MockUser> & { password: string }): boolean => {
      const newUser: CurrentUser = {
        id: `user_${Date.now()}`,
        name: data.name || "New User",
        age: data.age || 25,
        gender: data.gender || "nonbinary",
        location: data.location || "Earth",
        lifestyle: data.lifestyle || "active",
        hobbies: data.hobbies || [],
        interests: data.interests || [],
        bio: data.bio || "",
        avatarUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70) + 1}`,
        isVerified: false,
        likeCount: 0,
        isOnline: true,
      };
      setCurrentUser(newUser);
      saveLS(LS_KEYS.auth, newUser);
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(LS_KEYS.auth);
    setLikedUserIds([]);
    setPassedUserIds([]);
    saveLS(LS_KEYS.liked, []);
    saveLS(LS_KEYS.passed, []);
  }, []);

  // ── Swipe ───────────────────────────────────────────────────────────
  const swipe = useCallback(
    (userId: string, direction: "like" | "pass"): "match" | null => {
      if (direction === "like") {
        setLikedUserIds((prev) => {
          const next = [...prev, userId];
          saveLS(LS_KEYS.liked, next);
          return next;
        });
        setNotifications((n) => n + 1);
        // Simulate match (50% chance for demo)
        if (Math.random() > 0.4) return "match";
      } else {
        setPassedUserIds((prev) => {
          const next = [...prev, userId];
          saveLS(LS_KEYS.passed, next);
          return next;
        });
      }
      return null;
    },
    [],
  );

  // ── Messages ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (toUserId: string, text: string) => {
      if (!currentUser || !text.trim()) return;
      const msg: Message = {
        id: `msg_${Date.now()}`,
        fromId: currentUser.id,
        toId: toUserId,
        text: text.trim(),
        timestamp: Date.now(),
        isRead: false,
      };
      setMessages((prev) => {
        const key = toUserId;
        const next = { ...prev, [key]: [...(prev[key] ?? []), msg] };
        saveLS(LS_KEYS.messages, next);
        return next;
      });

      // Auto-reply after 1.5s
      if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = setTimeout(() => {
        const reply: Message = {
          id: `msg_reply_${Date.now()}`,
          fromId: toUserId,
          toId: currentUser.id,
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          timestamp: Date.now(),
          isRead: false,
        };
        setMessages((prev) => {
          const key = toUserId;
          const next = { ...prev, [key]: [...(prev[key] ?? []), reply] };
          saveLS(LS_KEYS.messages, next);
          return next;
        });
      }, 1500);
    },
    [currentUser],
  );

  // ── Profile update ──────────────────────────────────────────────────
  const updateProfile = useCallback((data: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      saveLS(LS_KEYS.auth, updated);
      return updated;
    });
  }, []);

  // ── Admin ────────────────────────────────────────────────────────────
  const banUser = useCallback((userId: string) => {
    setBannedUserIds((prev) => {
      const next = [...prev, userId];
      saveLS(LS_KEYS.banned, next);
      return next;
    });
  }, []);

  const unbanUser = useCallback((userId: string) => {
    setBannedUserIds((prev) => {
      const next = prev.filter((id) => id !== userId);
      saveLS(LS_KEYS.banned, next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => setNotifications(0), []);

  // ── Stories ──────────────────────────────────────────────────────────
  const markStorySeen = useCallback((storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, seen: true } : s)),
    );
  }, []);

  const addStory = useCallback(
    (imageUrl: string) => {
      if (!currentUser) return;
      const newStory: Story = {
        id: `story_my_${Date.now()}`,
        userId: currentUser.id,
        imageUrl,
        timestamp: Date.now(),
        seen: false,
      };
      setStories((prev) => [newStory, ...prev]);
    },
    [currentUser],
  );

  // ── Dark mode ────────────────────────────────────────────────────────
  const toggleDarkMode = useCallback(() => {
    setDarkMode((v) => {
      const next = !v;
      saveLS(LS_KEYS.dark, next);
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      signup,
      logout,
      users: MOCK_USERS,
      swipeQueue,
      likedUserIds,
      passedUserIds,
      matches,
      notifications,
      clearNotifications,
      swipe,
      sendMessage,
      messages,
      getCompatibilityScore,
      updateProfile,
      banUser,
      unbanUser,
      bannedUserIds,
      onlineCount,
      stories,
      markStorySeen,
      addStory,
      darkMode,
      toggleDarkMode,
    }),
    [
      currentUser,
      login,
      signup,
      logout,
      swipeQueue,
      likedUserIds,
      passedUserIds,
      matches,
      notifications,
      clearNotifications,
      swipe,
      sendMessage,
      messages,
      getCompatibilityScore,
      updateProfile,
      banUser,
      unbanUser,
      bannedUserIds,
      onlineCount,
      stories,
      markStorySeen,
      addStory,
      darkMode,
      toggleDarkMode,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
