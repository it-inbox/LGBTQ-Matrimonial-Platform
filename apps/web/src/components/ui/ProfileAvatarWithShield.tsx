import React from "react";
import { Lock, ImageOff } from "lucide-react";

export interface ProfileAvatarWithShieldProps {
  /** Photo URL or null/undefined if no photo */
  photoUrl?: string | null;
  /** Member display name for alt text & initial avatar */
  displayName: string;
  /** Whether the photo is protected/blurred */
  isBlurred?: boolean;
  /** Privacy visibility setting (e.g. "MUTUAL_MATCHES_ONLY" | "REQUEST_REQUIRED" | "ALL_MEMBERS") */
  photoVisibility?: string | null;
  /** Optional custom aspect ratio / container classes */
  className?: string;
  /** Optional class names passed directly to the <img> element */
  imgClassName?: string;
  /** Visual variant:
   * - "card": compact card layout (e.g. UniversalProfileCard)
   * - "hero": full-bleed hero layout with ambient vignette & rich badge (e.g. MemberProfileDetailPage)
   */
  variant?: "card" | "hero";
  /** Optional callback when user clicks unblur request button */
  onRequestUnblur?: () => void;
  /** Label for unblur button (default: "Request Unblur") */
  unblurButtonText?: string;
  /** Custom shield content or status badges (overrides default unblur button) */
  shieldContent?: React.ReactNode;
  /** Custom top-left/top-right overlay badges */
  topContent?: React.ReactNode;
  /** Custom bottom overlay content (e.g. hero name & info) */
  bottomContent?: React.ReactNode;
  /** Total count of photos to show as counter badge */
  photoCount?: number;
  /** Active photo index for detail viewer (1-based counter: `${activePhotoIndex} / ${photoCount}`) */
  activePhotoIndex?: number;
  /** Additional custom children rendered inside the container */
  children?: React.ReactNode;
}

export const ProfileAvatarWithShield: React.FC<ProfileAvatarWithShieldProps> = ({
  photoUrl,
  displayName,
  isBlurred = false,
  photoVisibility,
  className = "",
  imgClassName = "",
  variant = "card",
  onRequestUnblur,
  unblurButtonText = "Request Unblur",
  shieldContent,
  topContent,
  bottomContent,
  photoCount,
  activePhotoIndex,
  children,
}) => {
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "?";

  if (variant === "hero") {
    return (
      <div
        className={`relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md border border-slate-200/50 flex flex-col justify-between ${className}`}
      >
        {/* Main Background Photo */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden flex items-center justify-center">
          {photoUrl ? (
            <>
              {/* Blurred atmospheric backdrop for portrait photos on wide screens */}
              <img
                src={photoUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-40 scale-125 pointer-events-none"
              />
              <img
                src={photoUrl}
                alt={displayName}
                className={`relative max-h-full max-w-full w-auto h-full object-contain sm:object-cover transition-all duration-300 ${isBlurred ? "filter blur-3xl scale-110" : ""
                  } ${imgClassName}`}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
              <ImageOff className="w-12 h-12 mb-3 text-slate-500" />
              <span className="text-base font-semibold text-slate-300">No pictures uploaded</span>
            </div>
          )}
          {/* Ambient vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />
        </div>

        {/* Top Overlay / Info Bar */}
        {(topContent || (photoCount && photoCount > 1)) && (
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div>{topContent}</div>
            {photoCount && photoCount > 1 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/50 text-white/90 backdrop-blur-md border border-white/10">
                {activePhotoIndex !== undefined ? `${activePhotoIndex} / ${photoCount}` : photoCount}
              </span>
            )}
          </div>
        )}

        {/* Frosted Privacy Shield Centered Overlay */}
        {isBlurred && (
          <div className="relative z-10 m-auto p-5 text-center max-w-xs bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 text-white">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">
              {photoVisibility === "REQUEST_REQUIRED"
                ? "Requires Approval"
                : photoVisibility === "MUTUAL_MATCHES_ONLY"
                  ? "Matches Only"
                  : "Photo Shield Active"}
            </h2>
            <p className="text-[11px] text-slate-300 mt-1 mb-3">
              {displayName} maintains private photos. Send a request to view clear original pictures.
            </p>
            {shieldContent ? (
              shieldContent
            ) : onRequestUnblur ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestUnblur();
                }}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                {unblurButtonText}
              </button>
            ) : null}
          </div>
        )}

        {/* Bottom Hero Overlay */}
        {bottomContent && <div className="relative z-10">{bottomContent}</div>}

        {children}
      </div>
    );
  }

  // Default "card" variant
  const privacyBadgeText =
    photoVisibility === "REQUEST_REQUIRED"
      ? "Requires Approval"
      : photoVisibility === "MUTUAL_MATCHES_ONLY"
        ? "Matches Only"
        : "Photo Protected";

  return (
    <div className={`relative bg-slate-100 overflow-hidden ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={displayName}
          className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isBlurred ? "filter blur-xl scale-110" : ""
            } ${imgClassName}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-4 text-center">
          <ImageOff className="w-8 h-8 mb-1.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 leading-tight">No pictures uploaded</span>
        </div>
      )}

      {/* Subtle Inner Ring Highlight */}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />

      {/* Photo Count badge */}
      {photoCount && photoCount > 1 && (
        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-slate-900/75 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-md shadow-subtle z-10">
          📷 {photoCount}
        </span>
      )}

      {/* Top Custom Content (e.g. badges) */}
      {topContent && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
          {topContent}
        </div>
      )}

      {/* Frosted Privacy Shield Vignette */}
      {isBlurred && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950/45 backdrop-blur-md text-white text-center transition-colors">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-white drop-shadow-xs">
            {privacyBadgeText}
          </span>
          {shieldContent ? (
            shieldContent
          ) : onRequestUnblur ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestUnblur();
              }}
              className="mt-2 sm:mt-2.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {unblurButtonText}
            </button>
          ) : null}
        </div>
      )}

      {children}
    </div>
  );
};

