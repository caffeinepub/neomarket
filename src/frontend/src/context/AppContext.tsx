import type { MockUser, RegisteredUser } from "@/data/mockUsers";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  seenAt?: number;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number;
  seen: boolean;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: number;
  compatibilityScore: number;
}

export interface ConnectionRequest {
  id: string;
  fromId: string;
  toId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
}

export interface SearchFilters {
  nameSearch: string;
  minAge: number;
  maxAge: number;
  locationFilter: string;
  hobbyFilter: string;
  lifestyleFilter: string;
  onlineOnly: boolean;
  sortBy: "newest" | "mostActive" | "bestMatch";
}

export interface CurrentUser extends MockUser {
  isAdmin?: boolean;
  profileImage?: string;
  passwordHash?: string;
  joinedAt?: number;
  lastActive?: number;
  profileViews?: number;
}

interface AppContextValue {
  // Auth
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  signup: (data: Partial<MockUser> & { password: string }) => boolean;
  logout: () => void;

  // Users
  users: RegisteredUser[];
  swipeQueue: MockUser[];
  filteredUsers: MockUser[];
  likedUserIds: string[];
  passedUserIds: string[];
  matches: Match[];
  getMatchUser: (matchId: string) => MockUser | undefined;
  notifications: number;
  clearNotifications: () => void;
  onlineCount: number;

  // Search filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;

  // Pagination
  currentPage: number;
  loadMoreUsers: () => void;

  // Actions
  swipe: (userId: string, direction: "like" | "pass") => "match" | null;
  sendMessage: (matchId: string, text: string) => boolean;
  messages: Record<string, Message[]>;
  markMessagesSeen: (matchId: string) => void;
  getCompatibilityScore: (userA: MockUser, userB: MockUser) => number;
  updateProfile: (data: Partial<CurrentUser>) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  bannedUserIds: string[];
  incrementProfileViews: (userId: string) => void;

  // Connection requests
  connectionRequests: ConnectionRequest[];
  sendConnectionRequest: (toId: string) => boolean;
  respondToRequest: (requestId: string, accept: boolean) => void;

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
  usersDb: "neodate_users_db",
  swipes: "neodate_swipes",
  matches: "neodate_matches",
  messages: "neodate_messages",
  dark: "neodate_dark",
  banned: "neodate_banned",
  requests: "neodate_requests",
  msgRate: "neodate_msg_rate",
};

const PAGE_SIZE = 10;
const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const ADMIN_HASH = hashPassword("admin123");

function hashPassword(password: string): string {
  return btoa(encodeURIComponent(`${password}neodate_salt`));
}

function isUserOnline(lastActive: number): boolean {
  return Date.now() - lastActive < ONLINE_THRESHOLD;
}

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
    // Ignore storage errors
  }
}

function formatLastActive(lastActive: number): string {
  const diff = Date.now() - lastActive;
  if (diff < ONLINE_THRESHOLD) return "Online";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

// Export for use in components
export { hashPassword, isUserOnline, formatLastActive };

// ─── Provider ─────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth ──────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = loadLS<CurrentUser | null>(LS_KEYS.auth, null);
    return saved;
  });

  // ── Real users DB ─────────────────────────────────────────────────
  const [usersDb, setUsersDb] = useState<RegisteredUser[]>(() =>
    loadLS<RegisteredUser[]>(LS_KEYS.usersDb, []),
  );

  // ── Swipes ────────────────────────────────────────────────────────
  const [swipesDb, setSwipesDb] = useState<Record<string, "like" | "pass">>(
    () => loadLS(LS_KEYS.swipes, {}),
  );

  // ── Matches ───────────────────────────────────────────────────────
  const [matchesDb, setMatchesDb] = useState<Match[]>(() =>
    loadLS<Match[]>(LS_KEYS.matches, []),
  );

  // ── Messages ──────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Record<string, Message[]>>(() =>
    loadLS(LS_KEYS.messages, {}),
  );

  // ── Dark mode ──────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => loadLS(LS_KEYS.dark, true));

  // ── Admin: banned users ────────────────────────────────────────────
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(() =>
    loadLS(LS_KEYS.banned, []),
  );

  // ── Connection requests ────────────────────────────────────────────
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >(() => loadLS<ConnectionRequest[]>(LS_KEYS.requests, []));

  // ── Stories ────────────────────────────────────────────────────────
  const [stories, setStories] = useState<Story[]>([]);

  // ── Pagination ─────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Search filters ──────────────────────────────────────────────────
  const [searchFilters, setSearchFiltersState] = useState<SearchFilters>({
    nameSearch: "",
    minAge: 18,
    maxAge: 99,
    locationFilter: "",
    hobbyFilter: "",
    lifestyleFilter: "",
    onlineOnly: false,
    sortBy: "newest",
  });

  // ── Refs ──────────────────────────────────────────────────────────
  const autoReplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Update lastActive ──────────────────────────────────────────────
  const touchLastActive = useCallback(() => {
    if (!currentUser) return;
    const now = Date.now();
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, lastActive: now };
      saveLS(LS_KEYS.auth, updated);
      return updated;
    });
    setUsersDb((prev) => {
      const updated = prev.map((u) =>
        u.id === currentUser.id ? { ...u, lastActive: now } : u,
      );
      saveLS(LS_KEYS.usersDb, updated);
      return updated;
    });
  }, [currentUser]);

  // ── Derived: users list (excluding current, excluded banned) ────────
  const users = useMemo<RegisteredUser[]>(() => {
    if (!currentUser) return [];
    return usersDb
      .filter((u) => u.id !== currentUser.id && !bannedUserIds.includes(u.id))
      .map((u) => ({
        ...u,
        isOnline: isUserOnline(u.lastActive),
      }));
  }, [usersDb, currentUser, bannedUserIds]);

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

  // ── Filter + sort users ──────────────────────────────────────────
  const filteredUsers = useMemo<MockUser[]>(() => {
    if (!currentUser) return [];
    const likedOrPassed = new Set(
      Object.keys(swipesDb)
        .filter((k) => k.startsWith(`${currentUser.id}_`))
        .map((k) => k.split("_")[1]),
    );
    const matchedUserIds = new Set(
      matchesDb
        .filter(
          (m) => m.user1Id === currentUser.id || m.user2Id === currentUser.id,
        )
        .map((m) => (m.user1Id === currentUser.id ? m.user2Id : m.user1Id)),
    );

    let result = users.filter(
      (u) => !likedOrPassed.has(u.id) && !matchedUserIds.has(u.id),
    );

    const f = searchFilters;
    if (f.nameSearch.trim()) {
      const q = f.nameSearch.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q));
    }
    if (f.minAge > 18) {
      result = result.filter((u) => u.age >= f.minAge);
    }
    if (f.maxAge < 99) {
      result = result.filter((u) => u.age <= f.maxAge);
    }
    if (f.locationFilter.trim()) {
      const q = f.locationFilter.toLowerCase();
      result = result.filter((u) => u.location.toLowerCase().includes(q));
    }
    if (f.hobbyFilter.trim()) {
      const q = f.hobbyFilter.toLowerCase();
      result = result.filter((u) =>
        u.hobbies.some((h) => h.toLowerCase().includes(q)),
      );
    }
    if (f.lifestyleFilter && f.lifestyleFilter !== "all") {
      result = result.filter((u) => u.lifestyle === f.lifestyleFilter);
    }
    if (f.onlineOnly) {
      result = result.filter((u) => u.isOnline);
    }

    // Sort
    if (f.sortBy === "newest") {
      result = result.sort(
        (a, b) =>
          (b as RegisteredUser).joinedAt - (a as RegisteredUser).joinedAt,
      );
    } else if (f.sortBy === "mostActive") {
      result = result.sort(
        (a, b) =>
          (b as RegisteredUser).lastActive - (a as RegisteredUser).lastActive,
      );
    } else if (f.sortBy === "bestMatch" && currentUser) {
      result = result.sort(
        (a, b) =>
          getCompatibilityScore(currentUser, b) -
          getCompatibilityScore(currentUser, a),
      );
    }
    return result;
  }, [
    users,
    currentUser,
    swipesDb,
    matchesDb,
    searchFilters,
    getCompatibilityScore,
  ]);

  // ── Paginated swipe queue ──────────────────────────────────────────
  const swipeQueue = useMemo<MockUser[]>(() => {
    return filteredUsers.slice(0, currentPage * PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // ── Online count ───────────────────────────────────────────────────
  const onlineCount = useMemo(
    () => users.filter((u) => u.isOnline).length,
    [users],
  );

  // ── Notification count (pending requests + unseen messages) ─────────
  const notifications = useMemo(() => {
    if (!currentUser) return 0;
    const pendingRequests = connectionRequests.filter(
      (r) => r.toId === currentUser.id && r.status === "pending",
    ).length;
    let unseenMessages = 0;
    for (const [, msgs] of Object.entries(messages)) {
      unseenMessages += msgs.filter(
        (m) => m.toId === currentUser.id && !m.seenAt,
      ).length;
    }
    return pendingRequests + unseenMessages;
  }, [connectionRequests, messages, currentUser]);

  // ── Matches helper ─────────────────────────────────────────────────
  const getMatchUser = useCallback(
    (matchId: string): MockUser | undefined => {
      const match = matchesDb.find((m) => m.id === matchId);
      if (!match || !currentUser) return undefined;
      const otherId =
        match.user1Id === currentUser.id ? match.user2Id : match.user1Id;
      return usersDb.find((u) => u.id === otherId);
    },
    [matchesDb, currentUser, usersDb],
  );

  // ── Stories (seeded from real users) ────────────────────────────────
  useEffect(() => {
    if (usersDb.length < 3) {
      setStories([]);
      return;
    }
    const storyUsers = usersDb.slice(0, 12);
    setStories(
      storyUsers.map((u, i) => ({
        id: `story_${u.id}`,
        userId: u.id,
        imageUrl: `https://picsum.photos/seed/${u.id}/400/700`,
        timestamp: Date.now() - i * 3600000,
        seen: false,
      })),
    );
  }, [usersDb]);

  // ── Auth functions ──────────────────────────────────────────────────
  const login = useCallback(
    (username: string, password: string): boolean => {
      const hash = hashPassword(password);

      // Admin login (hardcoded)
      if (username.toLowerCase() === "admin" && hash === ADMIN_HASH) {
        const adminUser: CurrentUser = {
          id: "admin",
          name: "Admin",
          age: 30,
          gender: "nonbinary",
          location: "Global",
          lifestyle: "active",
          hobbies: ["Managing", "Analytics"],
          interests: ["Technology", "Data"],
          bio: "NeoDate Administrator",
          avatarUrl: "https://i.pravatar.cc/300?img=21",
          isVerified: true,
          likeCount: 0,
          isOnline: true,
          isAdmin: true,
          lastActive: Date.now(),
        };
        setCurrentUser(adminUser);
        saveLS(LS_KEYS.auth, adminUser);
        return true;
      }

      // Real user login from DB
      const found = usersDb.find(
        (u) =>
          u.name.toLowerCase().replace(/\s+/g, "") ===
            username.toLowerCase().replace(/\s+/g, "") &&
          u.passwordHash === hash,
      );
      if (!found) return false;

      const now = Date.now();
      const loggedIn: CurrentUser = {
        ...found,
        isOnline: true,
        lastActive: now,
      };
      setCurrentUser(loggedIn);
      saveLS(LS_KEYS.auth, loggedIn);

      // Update lastActive in DB
      setUsersDb((prev) => {
        const updated = prev.map((u) =>
          u.id === found.id ? { ...u, lastActive: now, isOnline: true } : u,
        );
        saveLS(LS_KEYS.usersDb, updated);
        return updated;
      });

      return true;
    },
    [usersDb],
  );

  const signup = useCallback(
    (data: Partial<MockUser> & { password: string }): boolean => {
      if (!data.password || data.password.length < 6) return false;
      const passwordHash = hashPassword(data.password);
      const now = Date.now();
      const newUser: RegisteredUser = {
        id: `user_${now}`,
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
        isAdmin: false,
        passwordHash,
        joinedAt: now,
        lastActive: now,
        profileViews: 0,
      };

      setUsersDb((prev) => {
        const updated = [...prev, newUser];
        saveLS(LS_KEYS.usersDb, updated);
        return updated;
      });

      const loggedIn: CurrentUser = { ...newUser };
      setCurrentUser(loggedIn);
      saveLS(LS_KEYS.auth, loggedIn);
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(LS_KEYS.auth);
    setCurrentPage(1);
  }, []);

  // ── Swipe ───────────────────────────────────────────────────────────
  const swipe = useCallback(
    (userId: string, direction: "like" | "pass"): "match" | null => {
      if (!currentUser) return null;
      touchLastActive();

      const key = `${currentUser.id}_${userId}`;
      setSwipesDb((prev) => {
        const updated = { ...prev, [key]: direction };
        saveLS(LS_KEYS.swipes, updated);
        return updated;
      });

      if (direction === "like") {
        // Check if reverse swipe exists
        const reverseKey = `${userId}_${currentUser.id}`;
        const reverseSwipe = swipesDb[reverseKey];
        if (reverseSwipe === "like") {
          // Create match
          const targetUser = usersDb.find((u) => u.id === userId);
          const compatScore = targetUser
            ? getCompatibilityScore(currentUser, targetUser)
            : 50;
          const newMatch: Match = {
            id: `match_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            user1Id: currentUser.id,
            user2Id: userId,
            matchedAt: Date.now(),
            compatibilityScore: compatScore,
          };
          setMatchesDb((prev) => {
            // Prevent duplicates
            const exists = prev.some(
              (m) =>
                (m.user1Id === currentUser.id && m.user2Id === userId) ||
                (m.user1Id === userId && m.user2Id === currentUser.id),
            );
            if (exists) return prev;
            const updated = [...prev, newMatch];
            saveLS(LS_KEYS.matches, updated);
            return updated;
          });
          return "match";
        }
      }
      return null;
    },
    [currentUser, swipesDb, usersDb, getCompatibilityScore, touchLastActive],
  );

  // ── Messages ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (matchId: string, text: string): boolean => {
      if (!currentUser || !text.trim()) return false;

      // Verify they are matched
      const match = matchesDb.find((m) => m.id === matchId);
      if (!match) return false;
      const isParticipant =
        match.user1Id === currentUser.id || match.user2Id === currentUser.id;
      if (!isParticipant) return false;

      // Rate limiting: max 10 messages per minute
      const rateData = loadLS<number[]>(LS_KEYS.msgRate, []);
      const now = Date.now();
      const recentMessages = rateData.filter((t) => now - t < 60000);
      if (recentMessages.length >= 10) return false;
      saveLS(LS_KEYS.msgRate, [...recentMessages, now]);

      touchLastActive();

      const otherId =
        match.user1Id === currentUser.id ? match.user2Id : match.user1Id;
      const msg: Message = {
        id: `msg_${now}`,
        fromId: currentUser.id,
        toId: otherId,
        text: text.trim(),
        timestamp: now,
        isRead: false,
      };

      setMessages((prev) => {
        const next = {
          ...prev,
          [matchId]: [...(prev[matchId] ?? []), msg],
        };
        saveLS(LS_KEYS.messages, next);
        return next;
      });

      // Auto-reply after 1.5s (simulated other user)
      if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
      autoReplyTimer.current = setTimeout(() => {
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
        const reply: Message = {
          id: `msg_reply_${Date.now()}`,
          fromId: otherId,
          toId: currentUser.id,
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          timestamp: Date.now(),
          isRead: false,
        };
        setMessages((prev) => {
          const next = {
            ...prev,
            [matchId]: [...(prev[matchId] ?? []), reply],
          };
          saveLS(LS_KEYS.messages, next);
          return next;
        });
      }, 1500);

      return true;
    },
    [currentUser, matchesDb, touchLastActive],
  );

  // ── Mark messages seen ──────────────────────────────────────────────
  const markMessagesSeen = useCallback(
    (matchId: string) => {
      if (!currentUser) return;
      const now = Date.now();
      setMessages((prev) => {
        const msgs = prev[matchId] ?? [];
        const updated = msgs.map((m) =>
          m.toId === currentUser.id && !m.seenAt ? { ...m, seenAt: now } : m,
        );
        const next = { ...prev, [matchId]: updated };
        saveLS(LS_KEYS.messages, next);
        return next;
      });
    },
    [currentUser],
  );

  // ── Profile update ──────────────────────────────────────────────────
  const updateProfile = useCallback(
    (data: Partial<CurrentUser>) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...data };
        saveLS(LS_KEYS.auth, updated);
        return updated;
      });
      // Also update in DB
      if (currentUser) {
        setUsersDb((prev) => {
          const updated = prev.map((u) =>
            u.id === currentUser.id ? { ...u, ...data } : u,
          );
          saveLS(LS_KEYS.usersDb, updated);
          return updated;
        });
      }
      touchLastActive();
    },
    [currentUser, touchLastActive],
  );

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

  const clearNotifications = useCallback(() => {
    // Mark all pending requests to current user as seen (just triggers re-render)
    // Notifications computed from state, no separate state to reset
  }, []);

  // ── Connection requests ──────────────────────────────────────────────
  const sendConnectionRequest = useCallback(
    (toId: string): boolean => {
      if (!currentUser) return false;
      touchLastActive();

      // Prevent duplicates
      const exists = connectionRequests.some(
        (r) =>
          r.fromId === currentUser.id &&
          r.toId === toId &&
          r.status === "pending",
      );
      if (exists) return false;

      const newReq: ConnectionRequest = {
        id: `req_${Date.now()}`,
        fromId: currentUser.id,
        toId,
        status: "pending",
        createdAt: Date.now(),
      };
      setConnectionRequests((prev) => {
        const updated = [...prev, newReq];
        saveLS(LS_KEYS.requests, updated);
        return updated;
      });
      return true;
    },
    [currentUser, connectionRequests, touchLastActive],
  );

  const respondToRequest = useCallback(
    (requestId: string, accept: boolean) => {
      if (!currentUser) return;
      touchLastActive();
      setConnectionRequests((prev) => {
        const updated: ConnectionRequest[] = prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: (accept ? "accepted" : "rejected") as
                  | "accepted"
                  | "rejected",
              }
            : r,
        );
        saveLS(LS_KEYS.requests, updated);
        return updated;
      });
    },
    [currentUser, touchLastActive],
  );

  // ── Profile views ──────────────────────────────────────────────────
  const incrementProfileViews = useCallback((userId: string) => {
    setUsersDb((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, profileViews: (u.profileViews || 0) + 1 } : u,
      );
      saveLS(LS_KEYS.usersDb, updated);
      return updated;
    });
  }, []);

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

  // ── Search filters ────────────────────────────────────────────────
  const setSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFiltersState((prev) => ({ ...prev, ...filters }));
    setCurrentPage(1);
  }, []);

  // ── Pagination ────────────────────────────────────────────────────
  const loadMoreUsers = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

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
      users,
      swipeQueue,
      filteredUsers,
      likedUserIds: Object.keys(swipesDb)
        .filter(
          (k) => k.startsWith(`${currentUser?.id}_`) && swipesDb[k] === "like",
        )
        .map((k) => k.split("_")[1]),
      passedUserIds: Object.keys(swipesDb)
        .filter(
          (k) => k.startsWith(`${currentUser?.id}_`) && swipesDb[k] === "pass",
        )
        .map((k) => k.split("_")[1]),
      matches: matchesDb.filter(
        (m) => m.user1Id === currentUser?.id || m.user2Id === currentUser?.id,
      ),
      getMatchUser,
      notifications,
      clearNotifications,
      onlineCount,
      searchFilters,
      setSearchFilters,
      currentPage,
      loadMoreUsers,
      swipe,
      sendMessage,
      messages,
      markMessagesSeen,
      getCompatibilityScore,
      updateProfile,
      banUser,
      unbanUser,
      bannedUserIds,
      incrementProfileViews,
      connectionRequests,
      sendConnectionRequest,
      respondToRequest,
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
      users,
      swipeQueue,
      filteredUsers,
      swipesDb,
      matchesDb,
      getMatchUser,
      notifications,
      clearNotifications,
      onlineCount,
      searchFilters,
      setSearchFilters,
      currentPage,
      loadMoreUsers,
      swipe,
      sendMessage,
      messages,
      markMessagesSeen,
      getCompatibilityScore,
      updateProfile,
      banUser,
      unbanUser,
      bannedUserIds,
      incrementProfileViews,
      connectionRequests,
      sendConnectionRequest,
      respondToRequest,
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
