import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useActivityBadges } from "../../hooks/useActivityBadges";
import {
  User,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface ActivitySidebarProps {
  activeTab?: "received" | "sent" | "iDeclined" | "theyDeclined" | "matches" | "messenger";
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ activeTab }) => {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const {
    displayConnectBadgeCount,
    pendingInterestsCount,
    totalMatchesCount,
  } = useActivityBadges();

  const getInitials = (name?: string) => {
    if (!name) return "EP";
    return name.slice(0, 2).toUpperCase();
  };

  const memberId = user?.id || profile?.id;
  const primaryPhoto = profile?.photos?.find((p) => p.isPrimary) || profile?.photos?.[0];
  const primaryPhotoUrl = primaryPhoto?.originalUrl || primaryPhoto?.url;
  const membership = useAuthStore((s) => s.membership);
  const isPaidMember = membership && membership.tier !== "FREE" && membership.status === "ACTIVE";

  return (
    <aside className="hidden lg:block lg:w-64 shrink-0 space-y-4 self-start">
      {/* Combined Profile & Navigation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Profile Header Section */}
        <div className="p-4 flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-full p-0.5 shadow-sm overflow-hidden ${
              isPaidMember
                ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-500 ring-2 ring-amber-400/40"
                : "bg-gradient-to-tr from-brand-600 to-pink-500"
            }`}>
              {primaryPhotoUrl ? (
                <img
                  src={primaryPhotoUrl}
                  alt={profile?.displayName || "Profile"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-brand-700 font-extrabold text-sm">
                  {profile?.displayName ? getInitials(profile.displayName) : <User className="w-5 h-5" />}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10" />
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 truncate" title={profile?.displayName || "Member"}>
                {profile?.displayName || "Member"}
              </h3>
              <Link
                to="/profile/edit"
                title="Edit Profile"
                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
            </div>
            {isPaidMember ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md mt-0.5 self-start">
                <span>⭐</span>
                <span>{membership.planName}</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">Free Member</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Navigation Links */}
        <nav className="divide-y divide-slate-100/80">
          <Link
            to="/discover"
            className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold transition-all ${
              location.pathname === "/discover"
                ? "text-brand-600 bg-brand-50/70 font-bold"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>Discover</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            to="/matches"
            className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold transition-all ${
              activeTab === "matches" || location.pathname === "/matches"
                ? "text-brand-600 bg-brand-50/70 font-bold"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Matches</span>
              {totalMatchesCount > 0 && (
                <Badge variant="brand" size="sm">
                  {totalMatchesCount}
                </Badge>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            to="/messages"
            className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold transition-all ${
              activeTab === "messenger" || location.pathname.startsWith("/messages")
                ? "text-brand-600 bg-brand-50/70 font-bold"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Connect</span>
              {displayConnectBadgeCount > 0 && (
                <Badge variant="danger" size="sm">
                  {displayConnectBadgeCount}
                </Badge>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            to="/interests/received"
            className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold transition-all ${
              (location.pathname.startsWith("/interests") || location.pathname.startsWith("/interest")) &&
              !location.pathname.startsWith("/unblur")
                ? "text-brand-600 bg-brand-50/70 font-bold"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Interests</span>
              {pendingInterestsCount > 0 && (
                <Badge variant="brand" size="sm">
                  {pendingInterestsCount}
                </Badge>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            to="/unblur/received"
            className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold transition-all ${
              location.pathname.startsWith("/unblur") || location.pathname.startsWith("/photo-access")
                ? "text-brand-600 bg-brand-50/70 font-bold"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>Unblur Requests</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </nav>
      </div>

      {/* Upgrade Banner & Benefits Card (Integrated into Left Sidebar) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider bg-pink-100/60 px-2 py-0.5 rounded-full">
            Special Offer
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            46% Off
          </span>
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
            You are <span className="text-rose-500 font-black">missing out</span> on verified partner benefits!
          </h4>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs">👁️</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">3x more views</p>
              <p className="text-[11px] text-slate-400">Featured placement on active feeds</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs">📞</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Direct contact</p>
              <p className="text-[11px] text-slate-400">Call & message accepted matches</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs">🛡️</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Privacy shields</p>
              <p className="text-[11px] text-slate-400">Discreet ghost mode & unblur controls</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <Link
            to="/membership/upgrade"
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-brand-600 hover:from-rose-600 hover:to-brand-700 shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Upgrade to Premium</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
