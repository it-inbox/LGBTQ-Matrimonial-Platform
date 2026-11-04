export const QUERY_KEYS = {
  matchesFeed: (params?: unknown) =>
    params ? (["matches-feed", params] as const) : (["matches-feed"] as const),
  activitySummary: ["activity-summary"] as const,
  acceptedMatches: ["accepted-matches"] as const,
  receivedInterests: ["received-interests"] as const,
  sentInterests: ["sent-interests"] as const,
  receivedUnblur: ["received-unblur"] as const,
  sentUnblur: ["sent-unblur"] as const,
  conversations: (filter = "all") => ["conversations", filter] as const,
  conversationMessages: (conversationId: string) => ["conversation-messages", conversationId] as const,
  memberProfile: (userId: string) => ["member-profile", userId] as const,
  blockedUsers: ["blocked-users"] as const,
} as const;
