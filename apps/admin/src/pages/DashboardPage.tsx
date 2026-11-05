import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Users,
  UserCheck,
  UserX,
  Bot,
  HeartHandshake,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <h3 className="font-bold text-sm">Failed to load platform statistics</h3>
        <p className="text-xs text-rose-400 mt-1">
          {(error as any)?.response?.data?.message || (error as Error).message}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { users, matches, memberships } = data;

  const statCards = [
    {
      label: "Total Registered Users",
      value: users.total.toLocaleString(),
      sub: `${users.real.toLocaleString()} real • ${users.dummy.toLocaleString()} dummy`,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      link: "/users",
    },
    {
      label: "Active Real Users",
      value: users.active.toLocaleString(),
      sub: `${users.banned} banned / deactivated`,
      icon: UserCheck,
      color: "from-emerald-500 to-teal-600",
      link: "/users?status=active",
    },
    {
      label: "Verified Profiles",
      value: users.verified.toLocaleString(),
      sub: `${Math.round((users.verified / (users.total || 1)) * 100)}% verification rate`,
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      link: "/users",
    },
    {
      label: "Match Interests Sent",
      value: matches.totalInterests.toLocaleString(),
      sub: `${matches.acceptedInterests.toLocaleString()} accepted matches`,
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-600",
      link: "/users",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and overview of EverPride community metrics.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-brand-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="text-2xl font-black text-white tracking-tight">{card.value}</div>
                <p className="text-xs text-slate-400 font-medium">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: User Composition & Membership Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Account Composition */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">User Base Breakdown</h3>
                <p className="text-[11px] text-slate-400">Real users vs Synthetic seeder profiles</p>
              </div>
            </div>
            <Link
              to="/dummy-data"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Manage Seed Data →
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">Real Members</span>
                <span className="text-slate-100">{users.real.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{
                    width: `${Math.round((users.real / (users.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">Synthetic Dummy Users</span>
                <span className="text-slate-100">{users.dummy.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                  style={{
                    width: `${Math.round((users.dummy / (users.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">Active vs Deactivated Accounts</span>
                <span className="text-slate-100">
                  {users.active.toLocaleString()} / {users.total.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.round((users.active / (users.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Membership Tier Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Membership Tiers</h3>
                <p className="text-[11px] text-slate-400">Current active member subscriptions</p>
              </div>
            </div>
            <Link
              to="/memberships"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              View Subscribers →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(memberships).map(([tier, count]: [string, any]) => (
              <div
                key={tier}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {tier.replace("_", " ")}
                </span>
                <div className="text-xl font-black text-white">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

