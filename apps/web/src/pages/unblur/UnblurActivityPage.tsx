import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { EmptyActivityState } from "../../components/layout/EmptyActivityState";
import { UnblurHeader } from "../../components/layout/UnblurHeader";
import { UniversalProfileCard } from "../../components/activity/UniversalProfileCard";
import {
  Check,
  X,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface UnblurActivityPageProps {
  initialTab?: "received" | "sent";
}

export const UnblurActivityPage: React.FC<UnblurActivityPageProps> = ({
  initialTab = "received",
}) => {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<"received" | "sent">(initialTab);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "DECLINED">("ALL");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync tab if prop changes
  React.useEffect(() => {
    setCurrentTab(initialTab);
    setStatusFilter("ALL");
  }, [initialTab]);

  // Fetch Received Unblur Requests
  const { data: receivedData, isLoading: isLoadingReceived } = useQuery({
    queryKey: ["received-unblur"],
    queryFn: async () => {
      const res = await api.get("/matches/photo-access/received");
      return res.data;
    },
    enabled: currentTab === "received",
  });

  // Fetch Sent Unblur Requests
  const { data: sentData, isLoading: isLoadingSent } = useQuery({
    queryKey: ["sent-unblur"],
    queryFn: async () => {
      const res = await api.get("/matches/photo-access/sent");
      return res.data;
    },
    enabled: currentTab === "sent",
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      return api.post(`/matches/photo-access/${id}/respond`, { status });
    },
    onSuccess: (_, variables) => {
      setSuccessToast(
        variables.status === "ACCEPTED"
          ? "Unblur permission approved! They can now view your original photos."
          : "Photo access request declined."
      );
      queryClient.invalidateQueries({ queryKey: ["received-unblur"] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
  });

  const rawList = currentTab === "received" ? receivedData : sentData;
  const isLoading = currentTab === "received" ? isLoadingReceived : isLoadingSent;

  const filteredList = (rawList || []).filter((item: any) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full flex flex-col">
      {successToast && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        <ActivitySidebar activeTab={currentTab} />

        {/* Center Main Content: Stationary filter bar + independently scrollable cards */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Standalone Filter Card: completely stationary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-4 shadow-xs space-y-3.5 shrink-0">
            <UnblurHeader activeTab={currentTab} />

            {/* Quick Status Segmented Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {(["ALL", "PENDING", "ACCEPTED", "DECLINED"] as const).map((filter) => {
                const count = (rawList || []).filter((item: any) =>
                  filter === "ALL" ? true : item.status === filter
                ).length;
                const isSelected = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "ALL" ? "All Requests" : filter.charAt(0) + filter.slice(1).toLowerCase()} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Cards List: Only cards scrollable, extends to the bottom */}
          <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-4 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center">
                <EmptyActivityState type={currentTab === "received" ? "unblur-received" : "unblur-sent"} />
              </div>
            ) : (
              <div className="space-y-4">
              {filteredList.map((item: any) => {
                const targetProfile = currentTab === "received" ? item.requester?.profile : item.target?.profile;
                if (!targetProfile) return null;

                return (
                  <UniversalProfileCard
                    key={item.id}
                    profile={targetProfile}
                    badge="outness"
                    headerStatusLeft={
                      <span>
                        {currentTab === "received" ? "Request received on " : "Request sent on "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    }
                    headerStatusRight={renderStatusBadge(item.status)}
                    actionsFooter={
                      currentTab === "received" ? (
                        item.status === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              disabled={respondMutation.isPending}
                              onClick={() =>
                                respondMutation.mutate({ id: item.id, status: "ACCEPTED" })
                              }
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-xs cursor-pointer disabled:opacity-50 group"
                            >
                              <Check className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span>Allow Unblur</span>
                            </button>
                            <button
                              type="button"
                              disabled={respondMutation.isPending}
                              onClick={() =>
                                respondMutation.mutate({ id: item.id, status: "DECLINED" })
                              }
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-50 transition-colors font-bold text-xs cursor-pointer disabled:opacity-50 group"
                            >
                              <X className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center py-2 px-3 text-slate-500 font-medium text-xs text-center">
                            {item.status === "ACCEPTED"
                              ? "You approved photo unblur access for this member."
                              : "You declined this unblur photo request."}
                          </div>
                        )
                      ) : (
                        <div className="flex-1 flex items-center justify-between px-4 py-2">
                          <span className="text-slate-600 font-medium text-xs truncate">
                            {item.status === "ACCEPTED"
                              ? "Member approved your request! Their original photos are now visible."
                              : item.status === "DECLINED"
                              ? "Member declined your unblur request."
                              : "Waiting for the member to approve photo access."}
                          </span>
                          <div className="shrink-0 ml-2">{renderStatusBadge(item.status)}</div>
                        </div>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};
