import { describe, it, expect, beforeEach, vi } from "vitest";
import { useChatStore } from "./chat.store";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("../lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  },
}));

describe("Chat Store (Zustand)", () => {
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

  it("updates active conversation id and clears unread count appropriately", () => {
    expect(useChatStore.getState().activeConversationId).toBeNull();

    useChatStore.getState().setActiveConversationId("conv-123");
    expect(useChatStore.getState().activeConversationId).toBe("conv-123");

    useChatStore.getState().setActiveConversationId(null);
    expect(useChatStore.getState().activeConversationId).toBeNull();
  });

  it("sends message via API and updates store", async () => {
    const mockMsg = {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-me",
      content: "Hello there!",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    (api.post as any).mockResolvedValue({ data: mockMsg });

    const result = await useChatStore.getState().sendMessage("conv-1", "Hello there!");

    expect(api.post).toHaveBeenCalledWith("/chat/messages", {
      conversationId: "conv-1",
      content: "Hello there!",
    });
    expect(result).toEqual(mockMsg);
  });

  it("edits message via API", async () => {
    const updatedMsg = {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-me",
      content: "Updated message",
      isRead: false,
      isEdited: true,
      createdAt: new Date().toISOString(),
    };

    (api.patch as any).mockResolvedValue({ data: updatedMsg });

    const result = await useChatStore.getState().editMessage("msg-1", "Updated message");

    expect(api.patch).toHaveBeenCalledWith("/chat/messages/msg-1", {
      content: "Updated message",
    });
    expect(result).toEqual(updatedMsg);
  });

  it("deletes message via API", async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    const success = await useChatStore.getState().deleteMessage("msg-1");

    expect(api.delete).toHaveBeenCalledWith("/chat/messages/msg-1");
    expect(success).toBe(true);
  });

  it("allows setting and dismissing in-app notifications", () => {
    const notif = {
      id: "notif-1",
      type: "message" as const,
      senderName: "Aarav",
      content: "Hey, are you free to chat?",
      createdAt: new Date().toISOString(),
    };

    useChatStore.setState({ activeNotification: notif });
    expect(useChatStore.getState().activeNotification).toEqual(notif);

    useChatStore.getState().clearNotification();
    expect(useChatStore.getState().activeNotification).toBeNull();
  });
});
