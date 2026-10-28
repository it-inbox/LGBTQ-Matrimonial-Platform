import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import { Shield, EyeOff, Check, Lock, AlertCircle, Ban, UserCheck, Loader2 } from "lucide-react";

interface BlockedItem {
  id: string;
  blockedUserId: string;
  reason?: string | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    city?: string | null;
    state?: string | null;
    profession?: string | null;
    avatarUrl?: string | null;
  };
}

export const PrivacySettingsPage: React.FC = () => {
  const { profile, fetchProfile } = useAuthStore();
  const [photoVisibility, setPhotoVisibility] = useState(
    profile?.photoVisibility || "MUTUAL_MATCHES_ONLY"
  );
  const [ghostModeEnabled, setGhostModeEnabled] = useState(
    profile?.ghostModeEnabled || false
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Blocked users management
  const [blockedUsers, setBlockedUsers] = useState<BlockedItem[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const res = await api.get("/matches/blocked");
      setBlockedUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
    } finally {
      setLoadingBlocked(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (blockedUserId: string) => {
    setUnblockingId(blockedUserId);
    try {
      await api.post(`/matches/unblock/${blockedUserId}`);
      setBlockedUsers((prev) => prev.filter((item) => item.blockedUserId !== blockedUserId));
    } catch (err) {
      console.error("Failed to unblock user:", err);
    } finally {
      setUnblockingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/profiles/me/privacy", {
        photoVisibility,
        ghostModeEnabled,
      });
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy & Safety Center</h1>
            <p className="text-xs text-slate-500">Fine-tune who can view your identity, photos, and manage blocked members</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Privacy preferences updated successfully.
        </div>
      )}

      {/* Visibility Preferences Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Photo Visibility Controls
          </h2>
          <div className="space-y-3">
            {[
              {
                id: "ALL_MEMBERS",
                title: "Visible to Verified Members",
                desc: "Any signed-in member can view your photos without requesting permission.",
              },
              {
                id: "MUTUAL_MATCHES_ONLY",
                title: "Mutual Matches Only (Recommended)",
                desc: "Photos automatically unblur only after you and another member mutually accept interest.",
              },
              {
                id: "REQUEST_REQUIRED",
                title: "Require My Approval",
                desc: "Photos are blurred for everyone by default. You receive an unblur request when someone wants to see your photos.",
              },
            ].map((tier) => (
              <label
                key={tier.id}
                onClick={() => setPhotoVisibility(tier.id)}
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  photoVisibility === tier.id
                    ? "border-brand-500 bg-brand-50/40"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{tier.title}</span>
                  {photoVisibility === tier.id && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Browsing Discretion
          </h2>
          <label
            onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
            className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={ghostModeEnabled}
              onChange={() => {}}
              className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-bold text-slate-900">Ghost Mode (Incognito Browsing)</span>
              <p className="text-xs text-slate-500 mt-0.5">
                When active, other members will not be notified that you viewed their profile or appeared in their visitor logs.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? "Saving Changes..." : "Save Privacy Settings"}
          </button>
        </div>
      </div>

      {/* Blocked Accounts Management Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Blocked Members
              </h2>
              <p className="text-xs text-slate-500">
                Accounts you block cannot contact you, send interests, or see your active status
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
            {blockedUsers.length}
          </span>
        </div>

        {loadingBlocked ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Loading blocked accounts...</span>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No blocked members</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Any member you block from their profile or chat will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedUsers.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                    {item.user.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.displayName}
                        className="w-full h-full object-cover filter blur-xs"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                        {item.user.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {item.user.displayName}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {[item.user.profession, item.user.city].filter(Boolean).join(" • ") || "Blocked member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnblock(item.blockedUserId)}
                  disabled={unblockingId === item.blockedUserId}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {unblockingId === item.blockedUserId ? "Unblocking..." : "Unblock"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
