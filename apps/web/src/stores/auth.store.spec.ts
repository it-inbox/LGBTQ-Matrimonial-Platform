import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./auth.store";
import { api } from "../lib/api";
import { useChatStore } from "./chat.store";
import { queryClient } from "../lib/queryClient";

vi.mock("../lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("./chat.store", () => ({
  useChatStore: {
    getState: vi.fn(() => ({
      disconnectSocket: vi.fn(),
    })),
  },
}));

vi.mock("../lib/queryClient", () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

describe("Auth Store (Zustand)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      profile: null,
      membership: null,
      isAuthenticated: false,
      isLoading: false,
      isLoginModalOpen: false,
    });
  });

  it("handles modal open and close actions", () => {
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);

    useAuthStore.getState().openLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);

    useAuthStore.getState().closeLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);
  });

  it("login persists tokens to localStorage and updates state", async () => {
    const mockData = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { id: "u1", phoneNumber: "+1234567890", role: "USER" },
      profile: { id: "p1", displayName: "Alex" },
      membership: { tier: "PRO", status: "ACTIVE" },
    };

    (api.post as any).mockResolvedValueOnce({ data: mockData });

    await useAuthStore.getState().login("+1234567890", "123456");

    expect(localStorage.getItem("everpride_access_token")).toBe("mock-access-token");
    expect(localStorage.getItem("everpride_refresh_token")).toBe("mock-refresh-token");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe("u1");
    expect(state.profile?.displayName).toBe("Alex");
    expect(state.membership?.tier).toBe("PRO");
  });

  it("logout notifies backend, cleans storage, disconnects chat, and clears query cache", () => {
    localStorage.setItem("everpride_access_token", "existing-access");
    localStorage.setItem("everpride_refresh_token", "existing-refresh");
    (api.post as any).mockResolvedValueOnce({});

    const disconnectSocketMock = vi.fn();
    (useChatStore.getState as any).mockReturnValue({
      disconnectSocket: disconnectSocketMock,
    });

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "USER" },
    });

    useAuthStore.getState().logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout", {
      refreshToken: "existing-refresh",
    });
    expect(disconnectSocketMock).toHaveBeenCalled();
    expect(localStorage.getItem("everpride_access_token")).toBeNull();
    expect(localStorage.getItem("everpride_refresh_token")).toBeNull();
    expect(queryClient.clear).toHaveBeenCalled();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
