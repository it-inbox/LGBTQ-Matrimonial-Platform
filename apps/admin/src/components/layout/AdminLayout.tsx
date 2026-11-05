import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Database,
  LogOut,
  ShieldAlert,
  Heart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAdminAuthStore } from "../../stores/admin-auth.store";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuthStore();

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: location.pathname === "/",
    },
    {
      to: "/users",
      label: "Users & Profiles",
      icon: Users,
      isActive: location.pathname.startsWith("/users"),
    },
    {
      to: "/memberships",
      label: "Memberships & Plans",
      icon: CreditCard,
      isActive: location.pathname.startsWith("/memberships"),
    },
    {
      to: "/dummy-data",
      label: "Dummy Data Tools",
      icon: Database,
      isActive: location.pathname.startsWith("/dummy-data"),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-brand-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-brand-500 fill-brand-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white leading-none">
                  Ever<span className="text-brand-500">Pride</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Admin Console
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.isActive
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-75" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout Bottom Box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-xs border border-brand-500/30">
                {user?.email?.[0]?.toUpperCase() || user?.role?.[0] || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {user?.email || user?.phoneNumber || "Admin User"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>EverPride Operations Dashboard</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold">
              {navItems.find((n) => n.isActive)?.label || "Overview"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors"
            >
              <span>Open Member App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              API Connected (:4001)
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
};

