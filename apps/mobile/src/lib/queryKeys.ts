export const QUERY_KEYS = {
  matchesFeed: (page = 1, filters?: any) => ["matches-feed", page, filters],
  matchesRecent: ["matches", "recent"],
  sentInterests: ["interests", "sent"],
  receivedInterests: ["interests", "received"],
  conversations: ["chat", "conversations"],
  messages: (convId: string) => ["chat", "messages", convId],
  myProfile: ["profile", "me"],
  membership: ["payments", "membership"],
};
