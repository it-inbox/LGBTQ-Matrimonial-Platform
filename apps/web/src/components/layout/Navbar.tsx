import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import {
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { isAuthenticated, profile, logout, openLoginModal } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

        {/* Desktop topbar tabs removed per user requirement: desktop navigation is handled via sidebar and layout */}


        {/* Right Controls: Desktop Profile (lg+) + Mobile/Tablet Hamburger (< lg) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Profile link for desktop (lg and above) */}
              <div className="hidden lg:flex items-center gap-2">
                {profile ? (
                  <Link
                    to="/profile/edit"
                    title="Edit your profile details"
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                      {profile.displayName?.[0] || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate">
                      {profile.displayName}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold select-none">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span>Completing Profile</span>
                  </div>
                )}
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
              </div>

              {/* Hamburger Button (Mobile & Tablet: < lg) for remaining navigation items */}
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

      {/* Mobile/Tablet Drawer Menu (Fixed floating overlay on top of the dashboard, < lg) */}
      {isAuthenticated && isMobileMenuOpen && (
        <div 
          onClick={closeMobileMenu}
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-b border-slate-200 shadow-2xl px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto max-w-lg mx-auto sm:rounded-b-2xl"
          >
          {profile && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {profile.displayName?.[0] || <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-sm truncate">
                  {profile.displayName}
                </p>
                <p className="text-xs text-brand-600 font-semibold truncate">
                  {profile.gender?.replace(/_/g, " ")} • {profile.orientation}
                </p>
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Account & Settings
          </div>

          <nav className="space-y-1">
            <Link
              to="/profile/edit"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                location.pathname === "/profile/edit"
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Edit Profile & Preferences</span>
            </Link>

            <Link
              to="/privacy-settings"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                location.pathname === "/privacy-settings"
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Privacy & Ghost Mode</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                logout();
                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </header>
  );
};
