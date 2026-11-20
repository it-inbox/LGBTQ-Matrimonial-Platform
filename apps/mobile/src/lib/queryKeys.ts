export const QUERY_KEYS = {
  matchesFeed: (page = 1, filters?: any) => ["matches-feed", page, filters],
  matchesRecent: ["matches", "recent"],
  acceptedMatches: ["matches", "accepted"],
  sentInterests: ["interests", "sent"],
  receivedInterests: ["interests", "received"],
  sentUnblur: ["unblur", "sent"],
  receivedUnblur: ["unblur", "received"],
  conversations: ["chat", "conversations"],
  messages: (convId: string) => ["chat", "messages", convId],
  myProfile: ["profile", "me"],
  memberProfile: (userId: string) => ["profile", "member", userId],
  interactionStatus: (targetUserId: string) => ["profile", "interaction", targetUserId],
  membership: ["payments", "membership"],
};

