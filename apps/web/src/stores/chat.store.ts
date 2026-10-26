import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { api } from "../lib/api";

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationPartner {
  id: string;
  displayName: string;
  gender?: string;
  city?: string;
  state?: string;
  profession?: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

export interface ConversationItem {
  id: string;
  updatedAt: string;
  partner: ConversationPartner;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
    isOwn: boolean;
  } | null;
  unreadCount: number;
}

export interface ChatNotification {
  id: string;
  type: "message" | "interest" | "interest_accepted" | "match";
  title?: string;
  conversationId?: string;
  senderId?: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  targetUrl?: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<string>;
  activeConversationId: string | null;
  typingUsers: Record<string, boolean>; // userId -> isTyping
  totalUnreadCount: number;
  unreadInterestsCount: number;
  newMatchesCount: number;
  activeNotification: ChatNotification | null;

  connectSocket: () => void;
  disconnectSocket: () => void;
  setActiveConversationId: (conversationId: string | null) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<MessageItem | null>;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTotalUnreadCount: (count: number) => void;
  setUnreadInterestsCount: (count: number) => void;
  setNewMatchesCount: (count: number) => void;
  clearNotification: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUserIds: new Set<string>(),
  activeConversationId: null,
  typingUsers: {},
  totalUnreadCount: 0,
  unreadInterestsCount: 0,
  newMatchesCount: 0,
  activeNotification: null,

  connectSocket: () => {
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    const token = localStorage.getItem("everpride_access_token");
    if (!token) return;

    // Determine host origin (strip /api/v1 from baseURL)
    const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001/api/v1";
    const hostOrigin = rawApiUrl.replace(/\/api\/v1\/?$/, "");

    const socket = io(`${hostOrigin}/chat`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socket.on("connect", () => {
      set({ isConnected: true, socket });

      // If there's an active conversation, re-join its room
      const activeId = get().activeConversationId;
      if (activeId) {
        socket.emit("join_conversation", { conversationId: activeId });
      }
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    socket.on("presence_update", ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      set((state) => {
        const next = new Set(state.onlineUserIds);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return { onlineUserIds: next };
      });
    });

    socket.on("user_typing", ({ conversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
      const activeId = get().activeConversationId;
      if (activeId === conversationId) {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [userId]: isTyping,
          },
        }));
      }
    });

    socket.on("incoming_message_notification", ({ conversationId, message, sender }: any) => {
      const currentActiveId = get().activeConversationId;
      // Only show notification if the user does NOT have this conversation open
      if (currentActiveId === conversationId) {
        return;
      }

      set({
        activeNotification: {
          id: message?.id || `notif-${Date.now()}`,
          type: "message",
          title: sender?.displayName || "New Message",
          conversationId,
          senderId: message?.senderId || sender?.id,
          senderName: sender?.displayName || "Someone",
          senderAvatar: sender?.avatarUrl || null,
          content: message?.content || "Sent you a message",
          targetUrl: "/messages",
          createdAt: message?.createdAt || new Date().toISOString(),
        },
      });
    });

    // 2. New Interest received notification
    socket.on("new_interest", ({ interestId, user, message }: any) => {
      set((state) => ({
        unreadInterestsCount: state.unreadInterestsCount + 1,
        activeNotification: {
          id: interestId || `interest-${Date.now()}`,
          type: "interest",
          title: `${user?.displayName || "Someone"} sent you an interest`,
          senderId: user?.id,
          senderName: user?.displayName || "Someone",
          senderAvatar: user?.avatarUrl || null,
          content: message || "Sent you a connection interest request",
          targetUrl: "/interests/received",
          createdAt: new Date().toISOString(),
        },
      }));
    });

    // 3. Interest Accepted notification
    socket.on("interest_accepted", ({ interestId, user }: any) => {
      set((state) => ({
        unreadInterestsCount: Math.max(0, state.unreadInterestsCount - 1),
        newMatchesCount: state.newMatchesCount + 1,
        activeNotification: {
          id: `accepted-${interestId || Date.now()}`,
          type: "interest_accepted",
          title: "Interest Accepted! 🎉",
          senderId: user?.id,
          senderName: user?.displayName || "Someone",
          senderAvatar: user?.avatarUrl || null,
          content: `${user?.displayName || "Someone"} accepted your interest! You are now matched.`,
          targetUrl: "/matches",
          createdAt: new Date().toISOString(),
        },
      }));
    });

    // 4. New Match notification (e.g. mutual reciprocal interest auto-match)
    socket.on("new_match", ({ matchId, user }: any) => {
      set((state) => ({
        newMatchesCount: state.newMatchesCount + 1,
        activeNotification: {
          id: `match-${matchId || Date.now()}`,
          type: "match",
          title: "It's a Mutual Match! ✨",
          senderId: user?.id,
          senderName: user?.displayName || "Someone",
          senderAvatar: user?.avatarUrl || null,
          content: `You and ${user?.displayName || "Someone"} expressed interest in each other!`,
          targetUrl: "/matches",
          createdAt: new Date().toISOString(),
        },
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUserIds: new Set() });
    }
  },

  setActiveConversationId: (conversationId) => {
    const oldId = get().activeConversationId;
    const socket = get().socket;

    if (oldId && socket && oldId !== conversationId) {
      socket.emit("leave_conversation", { conversationId: oldId });
    }

    if (conversationId && socket) {
      socket.emit("join_conversation", { conversationId });
      socket.emit("mark_read", { conversationId });
    }

    set({ activeConversationId: conversationId, typingUsers: {} });
  },

  joinConversation: (conversationId) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("join_conversation", { conversationId });
    }
  },

  leaveConversation: (conversationId) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("leave_conversation", { conversationId });
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<MessageItem | null> => {
    const socket = get().socket;
    const trimmed = content.trim();
    if (!trimmed) return null;

    // 1. Try WebSocket if connected
    if (socket && socket.connected) {
      try {
        const response: any = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve(null), 3500);
          socket.emit("send_message", { conversationId, content: trimmed }, (res: any) => {
            clearTimeout(timeout);
            resolve(res);
          });
        });

        if (response?.status === "sent" && response?.message) {
          return response.message;
        }
      } catch (err) {
        console.warn("[ChatStore] Socket send error, trying REST API fallback...", err);
      }
    }

    // 2. REST API fallback
    try {
      const res = await api.post("/chat/messages", {
        conversationId,
        content: trimmed,
      });
      return res.data.message || res.data;
    } catch (apiErr) {
      console.error("[ChatStore] Failed to send message via REST fallback:", apiErr);
      return null;
    }
  },

  emitTyping: (conversationId, isTyping) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("typing", { conversationId, isTyping });
    }
  },

  markConversationAsRead: (conversationId) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("mark_read", { conversationId });
    }
  },

  setTotalUnreadCount: (count) => {
    if (get().totalUnreadCount !== count) {
      set({ totalUnreadCount: count });
    }
  },

  setUnreadInterestsCount: (count) => {
    if (get().unreadInterestsCount !== count) {
      set({ unreadInterestsCount: count });
    }
  },

  setNewMatchesCount: (count) => {
    if (get().newMatchesCount !== count) {
      set({ newMatchesCount: count });
    }
  },

  clearNotification: () => {
    set({ activeNotification: null });
  },
}));
