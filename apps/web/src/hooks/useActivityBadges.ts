import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import { useChatStore } from "../stores/chat.store";

export interface ActivitySummary {
  pendingInterestsCount: number;
  matchIds: string[];
  unreadConversationsCount: number;
}

export function useActivityBadges() {
  const { isAuthenticated, profile } = useAuthStore();
  const totalUnreadCount = useChatStore((s) => s.totalUnreadCount);
  const socketUnreadInterests = useChatStore((s) => s.unreadInterestsCount);
  const socketNewMatches = useChatStore((s) => s.newMatchesCount);
  const location = useLocation();

  // Single aggregated query for all badge counts and match IDs
  const { data: summary } = useQuery<ActivitySummary>({
    queryKey: QUERY_KEYS.activitySummary,
    queryFn: async () => {
      const res = await api.get("/matches/summary");
      return res.data;
    },
    enabled: !!isAuthenticated && !!profile,
  });

  const displayConnectBadgeCount =
    (summary?.unreadConversationsCount || 0) > 0
      ? summary!.unreadConversationsCount
      : totalUnreadCount;

  const pendingInterestsCount =
    (summary?.pendingInterestsCount || 0) + socketUnreadInterests;

  // Listen for seen matches updates in localStorage
  const [seenMatchIds, setSeenMatchIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("everpride_seen_match_ids");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem("everpride_seen_match_ids");
        setSeenMatchIds(raw ? JSON.parse(raw) : []);
      } catch {
        setSeenMatchIds([]);
      }
    };
    window.addEventListener("matches_seen_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("matches_seen_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isMatchesPage = location.pathname === "/matches";

  const totalMatchesCount = useMemo(() => {
    if (isMatchesPage) return 0;
    const matchIds = summary?.matchIds || [];
    if (matchIds.length === 0) return socketNewMatches;
    const seenSet = new Set(seenMatchIds);
    const unseenList = matchIds.filter((id: string) => !seenSet.has(id));
    return unseenList.length + socketNewMatches;
  }, [summary?.matchIds, seenMatchIds, socketNewMatches, isMatchesPage]);

  return {
    displayConnectBadgeCount,
    pendingInterestsCount,
    totalMatchesCount,
  };
}
