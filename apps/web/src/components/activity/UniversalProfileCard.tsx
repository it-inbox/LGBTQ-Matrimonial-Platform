import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Lock,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../ui/Badge";

export interface ProfileCardData {
  id: string;
  userId?: string;
  displayName: string;
  pronouns?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  orientation?: string | null;
  outnessStatus?: string | null;
  heightCm?: number | null;
  city?: string | null;
  state?: string | null;
  religion?: string | null;
  profession?: string | null;
  annualIncome?: string | null;
  education?: string | null;
  maritalStatus?: string | null;
  photos?: Array<{
    id?: string;
    url?: string;
    originalUrl?: string;
    blurredUrl?: string;
    isPrimary?: boolean;
    isBlurred?: boolean;
  }>;
}

interface UniversalProfileCardProps {
  profile: ProfileCardData;
  userId?: string;
  headerStatusLeft?: React.ReactNode;
  headerStatusRight?: React.ReactNode;
  messageSnippet?: string | null;
  actionsFooter?: React.ReactNode;
  onRequestUnblur?: () => void;
  badge?: "matched" | "outness" | null;
}

export const UniversalProfileCard: React.FC<UniversalProfileCardProps> = ({
  profile,
  userId,
  headerStatusLeft,
  headerStatusRight,
  messageSnippet,
  actionsFooter,
  onRequestUnblur,
  badge = "outness",
}) => {
  const navigate = useNavigate();

  const calculateAge = (dobString?: string | Date | null) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const targetUserId = userId || profile.userId || profile.id;

  const handleNavigateToProfile = (e: React.MouseEvent) => {
    // Only navigate if click didn't come from a button, link or unblur request
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    if (targetUserId) {
      navigate(`/profile/${targetUserId}`);
    }
  };

  const primaryPhoto =
    profile.photos?.find((p) => p.isPrimary) || profile.photos?.[0];
  const photoUrl =
    primaryPhoto?.url || primaryPhoto?.originalUrl || primaryPhoto?.blurredUrl;
  const isBlurred = primaryPhoto?.isBlurred ?? false;
  const age = calculateAge(profile.dateOfBirth);

  const getOutnessBadge = (status?: string | null) => {
    switch (status) {
      case "DISCREET_NOT_OUT":
        return (
          <Badge variant="warning" size="sm">
            Discreet
          </Badge>
        );
      case "OUT_TO_SELECT_FEW":
        return (
          <Badge variant="neutral" size="sm">
            Out to friends
          </Badge>
        );
      default:
        return (
          <Badge variant="success" size="sm">
            Openly Out
          </Badge>
        );
    }
  };

  return (
    <div
      onClick={handleNavigateToProfile}
      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-row group w-full h-64 sm:h-72 cursor-pointer"
    >
      {/* Photo Section: Fixed horizontal aspect on mobile, tablet, and desktop */}
      <div className="relative w-36 xs:w-44 sm:w-56 md:w-60 h-full shrink-0 bg-slate-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={profile.displayName}
            className={`w-full h-full object-cover object-top transition-all duration-300 group-hover:scale-105 ${
              isBlurred ? "filter blur-xl scale-110" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-600 font-bold text-3xl sm:text-4xl">
            {profile.displayName?.[0] || "?"}
          </div>
        )}

        {/* Photo Count badge */}
        {profile.photos && profile.photos.length > 1 && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-slate-900/70 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
            📷 {profile.photos.length}
          </span>
        )}

        {/* Top Right Badge */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
          {badge === "matched" ? (
            <Badge variant="success" size="sm" icon={<Sparkles className="w-2.5 h-2.5" />}>
              Matched
            </Badge>
          ) : badge === "outness" && profile.outnessStatus ? (
            getOutnessBadge(profile.outnessStatus)
          ) : null}
        </div>

        {/* Blur Shield Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs text-white text-center">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide">
              Photo Protected
            </span>
            {onRequestUnblur && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestUnblur();
                }}
                className="mt-1.5 sm:mt-2.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-xs transition-all cursor-pointer"
              >
                Request Unblur
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-3 sm:p-5 flex-1 min-w-0 flex flex-col justify-between h-full overflow-hidden">
        <div className="min-w-0">
          {/* Header Status Bar */}
          {(headerStatusLeft || headerStatusRight) && (
            <div className="flex items-center justify-between mb-1 gap-1.5 flex-wrap">
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                {headerStatusLeft}
              </div>
              <div className="text-[11px] sm:text-xs">{headerStatusRight}</div>
            </div>
          )}

          {/* Name & Age */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap group-hover:text-brand-600 transition-colors">
            <span>{profile.displayName || "Member"}</span>
            {age ? <span>, {age}</span> : ""}
            {profile.pronouns && (
              <span className="text-xs font-normal text-slate-400">
                ({profile.pronouns})
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all ml-auto hidden sm:block" />
          </h2>

          {/* Sexual / Gender Identity */}
          <p className="text-xs font-semibold text-brand-600 mb-1.5 truncate">
            {profile.gender?.replace(/_/g, " ")} • {profile.orientation}
          </p>

          {/* Vitals row */}
          <div className="space-y-1 text-xs text-slate-600 mb-1.5">
            <p className="flex items-center gap-1.5 text-slate-700 font-medium flex-wrap">
              {profile.heightCm
                ? `${Math.floor(profile.heightCm / 30.48)}ft ${Math.round(
                    (profile.heightCm % 30.48) / 2.54
                  )}in • `
                : ""}
              <span>{profile.city || "New Delhi"}</span>
              <span>•</span>
              <span className="text-slate-500">
                {profile.religion || "Hindu"}
              </span>
            </p>
            <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[200px]">{profile.profession || "Professional"}</span>
              {profile.annualIncome && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 truncate">{profile.annualIncome}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px]">{profile.education || "Graduate"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{profile.maritalStatus || "Never Married"}</span>
              </div>
            </div>
          </div>

          {messageSnippet && (
            <div className="text-xs italic text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 mt-1 truncate max-w-full">
              "{messageSnippet}"
            </div>
          )}
        </div>

        {/* Footer Actions: Seamless edge-to-edge full width buttons matching reference */}
        {actionsFooter && (
          <div className="border-t border-rose-100 -mx-3 sm:-mx-5 -mb-3 sm:-mb-5 bg-rose-50/50 flex items-stretch divide-x divide-rose-100/80 text-xs font-semibold shrink-0 h-11">
            {actionsFooter}
          </div>
        )}
      </div>
    </div>
  );
};
