import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  CreditCard,
  Crown,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";

export const MembershipsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedTier, setSelectedTier] = useState<"PRO" | "PRO_MAX" | "PRO_SUPREME" | "PREMIER_LITE">("PRO");
  const [durationDays, setDurationDays] = useState(30);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      if (!targetUserId.trim()) throw new Error("Please enter a valid User ID");
      const res = await api.patch(`/admin/memberships/${targetUserId.trim()}`, {
        tier: selectedTier,
        durationDays: Number(durationDays),
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg(`Successfully upgraded User ${targetUserId} to ${selectedTier}!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
  });

  const tiers = [
    {
      id: "PRO",
      name: "EverPride Pro",
      desc: "25 Super Interests, Unlimited Chats, verified badge",
      color: "from-blue-600 to-indigo-600",
    },
    {
      id: "PRO_MAX",
      name: "EverPride Pro Max",
      desc: "50 Super Interests + 50 Spotlights, priority match display",
      color: "from-purple-600 to-pink-600",
    },
    {
      id: "PRO_SUPREME",
      name: "EverPride Pro Supreme",
      desc: "80 Super Interests + 80 Spotlights, highest discovery boost",
      color: "from-pink-600 to-rose-600",
    },
    {
      id: "PREMIER_LITE",
      name: "Premier Lite (Assisted)",
      desc: "150 Super Interests + dedicated match consultant perks",
      color: "from-amber-500 to-yellow-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Memberships & Subscriptions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community membership distribution and grant/override subscriptions for members.
        </p>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {stats?.memberships &&
          Object.entries(stats.memberships).map(([tier, count]: [string, any]) => (
            <div
              key={tier}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {tier.replace("_", " ")}
              </span>
              <div className="text-2xl font-black text-white">{count}</div>
            </div>
          ))}
      </div>

      {/* Manual Membership Upgrade Simulator Tool */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Manual Membership Grant Tool</h2>
            <p className="text-xs text-slate-400">
              Provision instant premium perks for customer support, VIPs, or automated testing.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            upgradeMutation.mutate();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Target User ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Copy the ID from the <strong>Users Directory</strong> page.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Plan Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiers.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTier(t.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTier === t.id
                      ? "bg-brand-500/10 border-brand-500/60 ring-1 ring-brand-500"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    {selectedTier === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Duration
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-brand-500"
            >
              <option value={7}>7 Days (Trial)</option>
              <option value={30}>1 Month (30 Days)</option>
              <option value={90}>3 Months (90 Days)</option>
              <option value={180}>6 Months (180 Days)</option>
              <option value={365}>1 Year (365 Days)</option>
            </select>
          </div>

          {upgradeMutation.isError && (
            <p className="text-xs text-rose-400 font-medium">
              {(upgradeMutation.error as any)?.response?.data?.message ||
                upgradeMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={upgradeMutation.isPending}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {upgradeMutation.isPending ? "Provisioning Perks..." : "Grant Membership Perks"}
          </button>
        </form>
      </div>
    </div>
  );
};

