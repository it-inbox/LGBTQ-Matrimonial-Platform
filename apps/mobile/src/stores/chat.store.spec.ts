import { describe, it, expect, beforeEach, vi } from "vitest";
import { useChatStore } from "./chat.store";
import { api } from "../lib/api";

vi.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
}));

vi.mock("../lib/api", () => ({
  api: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("../lib/storage", () => ({
  authStorage: {
    getTokens: vi.fn().mockResolvedValue({ accessToken: "dummy-token" }),
  },
}));

vi.mock("../lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  },
}));

describe("Mobile Chat Store (Zustand)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.setState({
      socket: null,
      isConnected: false,
      onlineUserIds: new Set<string>(),
      activeConversationId: null,
      typingUsers: {},
      totalUnreadCount: 0,
      unreadInterestsCount: 0,
      newMatchesCount: 0,
      activeNotification: null,
    });
  });

  it("updates active conversation id and clears unread count", () => {
    expect(useChatStore.getState().activeConversationId).toBeNull();

    useChatStore.getState().setActiveConversationId("conv-mobile-1");
    expect(useChatStore.getState().activeConversationId).toBe("conv-mobile-1");

    useChatStore.getState().setActiveConversationId(null);
    expect(useChatStore.getState().activeConversationId).toBeNull();
  });

  it("sends message via API", async () => {
    const mockMsg = {
      id: "msg-mob-1",
      conversationId: "conv-mob-1",
      senderId: "user-me",
      content: "Hello from mobile",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    (api.post as any).mockResolvedValue({ data: mockMsg });

    const result = await useChatStore.getState().sendMessage("conv-mob-1", "Hello from mobile");

    expect(api.post).toHaveBeenCalledWith("/chat/messages", {
      conversationId: "conv-mob-1",
      content: "Hello from mobile",
    });
    expect(result).toEqual(mockMsg);
  });

  it("edits message via API", async () => {
    const updatedMsg = {
      id: "msg-mob-1",
      conversationId: "conv-mob-1",
      senderId: "user-me",
      content: "Edited mobile message",
      isRead: false,
      isEdited: true,
      createdAt: new Date().toISOString(),
    };

    (api.patch as any).mockResolvedValue({ data: updatedMsg });

    const result = await useChatStore.getState().editMessage("msg-mob-1", "Edited mobile message");

    expect(api.patch).toHaveBeenCalledWith("/chat/messages/msg-mob-1", {
      content: "Edited mobile message",
    });
    expect(result).toEqual(updatedMsg);
  });

  it("deletes message via API", async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    const success = await useChatStore.getState().deleteMessage("msg-mob-1");

    expect(api.delete).toHaveBeenCalledWith("/chat/messages/msg-mob-1");
    expect(success).toBe(true);
  });
});
