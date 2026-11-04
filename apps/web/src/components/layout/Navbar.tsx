import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import {
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Edit3,
  ShieldCheck,
  Headphones,
  MessageSquareQuote,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { isAuthenticated, profile, isLoading, logout, openLoginModal } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isOnboardingPage = location.pathname.startsWith("/onboarding");

  // Compute display member ID
  const memberDisplayId = React.useMemo(() => {
    if (!profile) return "EP-MEMBER";
    const rawId = (profile as any)?.user?.id || profile.id || profile.userId || "9109";
    const shortCode = rawId.replace(/-/g, "").slice(-4).toUpperCase();
    return `ID - SATX${shortCode}`;
  }, [profile]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with Pride Rainbow subtle gradient */}
        <Link
          to={isAuthenticated ? (profile ? "/discover" : "/onboarding") : "/"}
          className="flex items-center gap-2.5 group"
          onClick={closeMobileMenu}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-pride-pink to-pride-yellow p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Heart className="w-5 h-5 text-brand-600 fill-brand-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              Ever<span className="text-brand-600">Pride</span>
            </span>
          </div>
        </Link>

        {/* Right Controls: Desktop Profile (lg+) + Mobile/Tablet Hamburger (< lg) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoading ? (
            /* During initial session hydration, keep controls clean without flickering premature state */
            <div className="w-24 h-8 bg-slate-100/80 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Profile link for desktop (lg and above) */}
              <div className="hidden lg:flex items-center gap-2">
                {profile ? (
                  <Link
                    to="/profile/edit"
                    title="Edit your profile details"
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    {(() => {
                      const primaryPhoto = profile.photos?.find((p) => p.isPrimary) || profile.photos?.[0];
                      const primaryPhotoUrl = primaryPhoto?.originalUrl || primaryPhoto?.url;
                      return primaryPhotoUrl ? (
                        <img
                          src={primaryPhotoUrl}
                          alt={profile.displayName}
                          className="w-7 h-7 rounded-full object-cover border border-brand-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                          {profile.displayName?.[0] || <User className="w-4 h-4" />}
                        </div>
                      );
                    })()}
                    <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate">
                      {profile.displayName}
                    </span>
                  </Link>
                ) : isOnboardingPage ? (
                  <div className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold select-none">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span>Completing Profile</span>
                  </div>
                ) : null}
                {!isOnboardingPage && (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    title="Log out"
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Hamburger Button (Mobile & Tablet: < lg) - hidden on /onboarding page */}
              {!isOnboardingPage && (
                <div className="lg:hidden flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6 text-slate-900" />
                    ) : (
                      <Menu className="w-6 h-6 text-slate-900" />
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-800">
                  Sign In
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right-edge full-height Drawer Menu (< lg) rendered via Portal */}
      {isAuthenticated && !isOnboardingPage && isMobileMenuOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeMobileMenu}
            className="lg:hidden fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in flex justify-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] sm:max-w-sm h-full h-[100dvh] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar rounded-l-3xl animate-in slide-in-from-right duration-300 relative border-l border-slate-200/80"
            >
              {/* Top Close Icon Button */}
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Menu Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Profile Card Header */}
                {profile && (
                  <div className="flex items-center gap-4 pt-2">
                    {(() => {
                      const primaryPhoto = profile.photos?.find((p) => p.isPrimary) || profile.photos?.[0];
                      const primaryPhotoUrl = primaryPhoto?.originalUrl || primaryPhoto?.url;
                      return (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-100 shadow-xs flex items-center justify-center">
                          {primaryPhotoUrl ? (
                            <img
                              src={primaryPhotoUrl}
                              alt={profile.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-9 h-9 text-slate-400" />
                          )}
                        </div>
                      );
                    })()}
                    <div className="min-w-0 flex-1 pr-6">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight truncate">
                        {profile.displayName || "Member"}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                        {memberDisplayId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upgrade Membership Card */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/membership/upgrade");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#e12a4c] hover:bg-[#c9203e] text-white font-bold text-sm shadow-sm transition-all duration-150 cursor-pointer text-center block"
                  >
                    Upgrade Membership
                  </button>
                  <p className="text-center text-[11px] font-semibold text-slate-500">
                    Flat 65% OFF till 02 Nov
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-1" />

                {/* Navigation List Items with Chevron */}
                <nav className="space-y-0.5">
                  {[
                    {
                      label: "Edit Profile",
                      icon: Edit3,
                      onClick: () => {
                        closeMobileMenu();
                        navigate("/profile/edit");
                      },
                    },
                    {
                      label: "Partner Preferences",
                      icon: Heart,
                      onClick: () => {
                        closeMobileMenu();
                        navigate("/profile/edit#partner-preferences");
                      },
                    },
                    {
                      label: "Safety Center",
                      icon: ShieldCheck,
                      onClick: () => {
                        closeMobileMenu();
                        navigate("/privacy-settings");
                      },
                    },
                    {
                      label: "Help & Support",
                      icon: Headphones,
                      onClick: () => {
                        closeMobileMenu();
                        navigate("/help");
                      },
                    },
                    {
                      label: "Success Stories",
                      icon: MessageSquareQuote,
                      onClick: () => {
                        closeMobileMenu();
                        navigate("/stories");
                      },
                    },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between py-3 px-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                          <span className="text-xs sm:text-[13px] font-medium text-slate-800 group-hover:text-slate-900">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions: Log Out */}
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                    navigate("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
