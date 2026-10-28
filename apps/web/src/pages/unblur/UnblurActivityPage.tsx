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
  Eye,
  EyeOff,
  ShieldBan,
  AlertTriangle,
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

  // Revoke confirmation modal state
  const [revokingRequest, setRevokingRequest] = useState<any | null>(null);

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

  const toggleHideMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden?: boolean }) => {
      return api.post(`/matches/photo-access/${id}/toggle-hide`, { isHidden });
    },
    onSuccess: (res) => {
      const isNowHidden = res.data?.isHidden;
      setSuccessToast(
        isNowHidden
          ? "Photos temporarily hidden from this member. They will see blurred photos until you unhide."
          : "Photos unhidden. The member can now view your original photos again."
      );
      queryClient.invalidateQueries({ queryKey: ["received-unblur"] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return api.post(`/matches/photo-access/${id}/revoke`);
    },
    onSuccess: () => {
      setSuccessToast("Photo access completely revoked. They must send a new unblur request to view your pictures.");
      setRevokingRequest(null);
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

  const renderStatusBadge = (status: string, isHidden?: boolean) => {
    switch (status) {
      case "ACCEPTED":
        if (isHidden) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Temporarily Hidden</span>
            </span>
          );
        }
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
                    userId={currentTab === "received" ? item.requester?.id : item.target?.id}
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
                          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-slate-50/70 rounded-xl">
                            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                              {item.status === "ACCEPTED" ? (
                                item.isHidden ? (
                                  <span className="text-amber-700 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Photos temporarily hidden from this member</span>
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Unblur access active</span>
                                  </span>
                                )
                              ) : (
                                "You declined this unblur photo request."
                              )}
                            </div>

                            {/* Management Actions for ACCEPTED requests */}
                            {item.status === "ACCEPTED" && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={toggleHideMutation.isPending}
                                  onClick={() =>
                                    toggleHideMutation.mutate({
                                      id: item.id,
                                      isHidden: !item.isHidden,
                                    })
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                    item.isHidden
                                      ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                  title={item.isHidden ? "Unhide pictures" : "Temporarily hide pictures"}
                                >
                                  {item.isHidden ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Unhide Pictures</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Temporarily Hide</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={revokeMutation.isPending}
                                  onClick={() => setRevokingRequest(item)}
                                  className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                  title="Completely revoke photo access"
                                >
                                  <ShieldBan className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Revoke</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="flex-1 flex items-center justify-between px-4 py-2">
                          <span className="text-slate-600 font-medium text-xs truncate">
                            {item.status === "ACCEPTED"
                              ? item.isHidden
                                ? "Member has temporarily hidden their photos."
                                : "Member approved your request! Their original photos are visible."
                              : item.status === "DECLINED"
                              ? "Member declined your unblur request."
                              : "Waiting for the member to approve photo access."}
                          </span>
                          <div className="shrink-0 ml-2">{renderStatusBadge(item.status, item.isHidden)}</div>
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

      {/* Revoke Confirmation Modal */}
      {revokingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ShieldBan className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Revoke Photo Access?
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to revoke photo access for{" "}
              <strong className="text-slate-700">
                {revokingRequest?.requester?.profile?.displayName || "this member"}
              </strong>
              ? Their access to your pictures will be completely removed and they will have to send another unblur request for you to approve.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokingRequest(null)}
                disabled={revokeMutation.isPending}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => revokeMutation.mutate({ id: revokingRequest.id })}
                disabled={revokeMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {revokeMutation.isPending ? "Revoking..." : "Revoke Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
