import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";
import { api } from "../lib/api";
import { authStorage } from "../lib/storage";
import { queryClient } from "../lib/queryClient";
import { QUERY_KEYS } from "../lib/queryKeys";

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
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
    isEdited?: boolean;
    isDeleted?: boolean;
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

  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
  setActiveConversationId: (conversationId: string | null) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<MessageItem | null>;
  editMessage: (messageId: string, content: string) => Promise<MessageItem | null>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTotalUnreadCount: (count: number) => void;
  setUnreadInterestsCount: (count: number) => void;
  setNewMatchesCount: (count: number) => void;
  clearNotification: () => void;
}

const getSocketHost = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4001";
  }
  return "http://localhost:4001";
};

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

  connectSocket: async () => {
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    const token = await authStorage.getAccessToken();
    if (!token) return;

    const hostOrigin = getSocketHost();

    const socket = io(`${hostOrigin}/chat`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socket.on("connect", () => {
      set({ isConnected: true, socket });

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });

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
          createdAt: message?.createdAt || new Date().toISOString(),
        },
      });
    });

    socket.on("new_interest", ({ interestId, user, message }: any) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedInterests });
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
          createdAt: new Date().toISOString(),
        },
      }));
    });

    socket.on("interest_accepted", ({ interestId, user }: any) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentInterests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.acceptedMatches });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
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
          content: `${user?.displayName || "Someone"} accepted your interest!`,
          createdAt: new Date().toISOString(),
        },
      }));
    });

    socket.on("new_match", ({ matchId, user }: any) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.acceptedMatches });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
      set((state) => ({
        newMatchesCount: state.newMatchesCount + 1,
        activeNotification: {
          id: `match-${matchId || Date.now()}`,
          type: "match",
          title: "It's a Mutual Match! ✨",
          senderId: user?.id,
          senderName: user?.displayName || "Someone",
          senderAvatar: user?.avatarUrl || null,
          content: `You and ${user?.displayName || "Someone"} matched!`,
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

    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
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

    if (socket && socket.connected) {
      try {
        const response: any = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 3500);
          socket.emit("send_message", { conversationId, content: trimmed }, (res: any) => {
            clearTimeout(timeout);
            resolve(res);
          });
        });

        if (response?.status === "sent" && response?.message) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
          return response.message;
        }
      } catch (err) {
        console.warn("[ChatStore] Socket send error, trying REST API fallback...", err);
      }
    }

    try {
      const res = await api.post("/chat/messages", {
        conversationId,
        content: trimmed,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
      return res.data.message || res.data;
    } catch (apiErr) {
      console.error("[ChatStore] Failed to send message via REST fallback:", apiErr);
      return null;
    }
  },

  editMessage: async (messageId: string, content: string): Promise<MessageItem | null> => {
    const socket = get().socket;
    const trimmed = content.trim();
    if (!trimmed) return null;

    if (socket && socket.connected) {
      try {
        const response: any = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 3500);
          socket.emit("edit_message", { messageId, content: trimmed }, (res: any) => {
            clearTimeout(timeout);
            resolve(res);
          });
        });

        if (response?.status === "success" && response?.message) {
          return response.message;
        }
      } catch (err) {
        console.warn("[ChatStore] Socket edit error, falling back to REST...", err);
      }
    }

    try {
      const res = await api.patch(`/chat/messages/${messageId}`, {
        content: trimmed,
      });
      return res.data;
    } catch (apiErr) {
      console.error("[ChatStore] Failed to edit message via REST fallback:", apiErr);
      return null;
    }
  },

  deleteMessage: async (messageId: string): Promise<boolean> => {
    const socket = get().socket;

    if (socket && socket.connected) {
      try {
        const response: any = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 3500);
          socket.emit("delete_message", { messageId }, (res: any) => {
            clearTimeout(timeout);
            resolve(res);
          });
        });

        if (response?.status === "success") {
          return true;
        }
      } catch (err) {
        console.warn("[ChatStore] Socket delete error, falling back to REST...", err);
      }
    }

    try {
      await api.delete(`/chat/messages/${messageId}`);
      return true;
    } catch (apiErr) {
      console.error("[ChatStore] Failed to delete message via REST fallback:", apiErr);
      return false;
    }
  },

  emitTyping: (conversationId, isTyping) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit("typing", { conversationId, isTyping });
    }
  },

  markConversationAsRead: (conversationId) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
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
    set({ unreadInterestsCount: count });
  },

  setNewMatchesCount: (count) => {
    set({ newMatchesCount: count });
  },

  clearNotification: () => {
    set({ activeNotification: null });
  },
}));
