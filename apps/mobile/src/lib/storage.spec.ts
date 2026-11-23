import { describe, it, expect, beforeEach, vi } from "vitest";
import * as SecureStore from "expo-secure-store";
import { onboardingStorage } from "./storage";

vi.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
}));

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

describe("Mobile Onboarding Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no draft is stored", async () => {
    (SecureStore.getItemAsync as any).mockResolvedValue(null);

    const draft = await onboardingStorage.getDraft();
    expect(draft).toBeNull();
  });

  it("retrieves and parses stored draft data and step", async () => {
    const mockFormData = {
      gender: "WOMAN",
      profileFor: "SELF",
      city: "Delhi",
    };

    (SecureStore.getItemAsync as any).mockImplementation((key: string) => {
      if (key === "everpride_mobile_onboarding_draft") {
        return Promise.resolve(JSON.stringify(mockFormData));
      }
      if (key === "everpride_mobile_onboarding_step") {
        return Promise.resolve("3");
      }
      return Promise.resolve(null);
    });

    const draft = await onboardingStorage.getDraft();

    expect(draft).not.toBeNull();
    expect(draft?.formData).toEqual(mockFormData);
    expect(draft?.step).toBe(3);
  });

  it("saves draft form data and step to secure store", async () => {
    const mockFormData = {
      gender: "MAN",
      maritalStatus: "NEVER_MARRIED",
    };

    await onboardingStorage.saveDraft(mockFormData, 2);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "everpride_mobile_onboarding_draft",
      JSON.stringify(mockFormData)
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "everpride_mobile_onboarding_step",
      "2"
    );
  });

  it("clears draft and step from secure store", async () => {
    await onboardingStorage.clearDraft();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "everpride_mobile_onboarding_draft"
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "everpride_mobile_onboarding_step"
    );
  });
});
