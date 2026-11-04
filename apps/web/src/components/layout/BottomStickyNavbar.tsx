import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useActivityBadges } from "../../hooks/useActivityBadges";
import { Compass, Sparkles, Send, Eye, MessageSquare } from "lucide-react";

export const BottomStickyNavbar: React.FC = () => {
  const { isAuthenticated, profile } = useAuthStore();
  const location = useLocation();

  const {
    displayConnectBadgeCount,
    pendingInterestsCount,
    totalMatchesCount,
  } = useActivityBadges();

  // Show only if authenticated and profile completed, and on mobile or tablet (< xl)
  if (!isAuthenticated || !profile) {
    return null;
  }

  const navItems = [
    {
      to: "/discover",
      label: "Discover",
      icon: Compass,
      isActive: location.pathname === "/discover",
      badgeCount: 0,
    },
    {
      to: "/matches",
      label: "Matches",
      icon: Sparkles,
      isActive: location.pathname === "/matches",
      badgeCount: totalMatchesCount,
    },
    {
      to: "/messages",
      label: "Connect",
      icon: MessageSquare,
      isActive: location.pathname.startsWith("/messages"),
      badgeCount: displayConnectBadgeCount,
    },
    {
      to: "/interests/received",
      label: "Interests",
      icon: Send,
      isActive: location.pathname.startsWith("/interests"),
      badgeCount: pendingInterestsCount,
    },
    {
      to: "/unblur/received",
      label: "Unblur",
      icon: Eye,
      isActive: location.pathname.startsWith("/unblur"),
      badgeCount: 0,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer relative ${item.isActive
                  ? "text-rose-600 bg-rose-50/80"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform ${item.isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                    }`}
                />
                {item.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
