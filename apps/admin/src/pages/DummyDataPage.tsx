import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const DummyDataPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [purgeConfirmText, setPurgeConfirmText] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: stats, refetch } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/dummy/purge");
      return res.data;
    },
    onSuccess: (data) => {
      setMessage({ type: "success", text: data.message || "Successfully purged all dummy users!" });
      setPurgeConfirmText("");
      setIsPurging(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to purge dummy users.",
      });
    },
  });

  const dummyCount = stats?.users?.dummy || 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Dummy Data & Seeder Tools</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor synthetic load test profiles and execute safe bulk database operations.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Overview Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Synthetic Dummy Profiles
          </span>
          <div className="text-3xl font-black text-amber-400">{dummyCount.toLocaleString()}</div>
          <p className="text-xs text-slate-400">Marked with `is_dummy_user = true`</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Real Community Members
          </span>
          <div className="text-3xl font-black text-white">
            {stats?.users?.real?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-slate-400">Authentic user registrations</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Cascade Integrity
          </span>
          <div className="text-3xl font-black text-emerald-400">ON</div>
          <p className="text-xs text-slate-400">PostgreSQL cascades all conversations & photos</p>
        </div>
      </div>

      {/* Danger Zone: Purge Dummy Users */}
      <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Purge All Dummy Users</h2>
            <p className="text-xs text-slate-400">
              Bulk-deletes all generated test accounts while safeguarding real member accounts.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 mb-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Safety Guard Active</span>
          </div>
          <p>
            This action will run: <code className="text-amber-300">DELETE FROM users WHERE is_dummy_user = true</code>.
            Real accounts (including verified and seeded test users without the dummy flag) will remain untouched.
          </p>
        </div>

        {!isPurging ? (
          <button
            type="button"
            disabled={dummyCount === 0}
            onClick={() => setIsPurging(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            Initiate Dummy Purge ({dummyCount.toLocaleString()} records)
          </button>
        ) : (
          <div className="space-y-4 max-w-md bg-slate-950 p-5 rounded-2xl border border-rose-500/30">
            <p className="text-xs text-slate-300 font-medium">
              Please type <strong className="text-rose-400 font-mono">PURGE DUMMY</strong> to confirm:
            </p>
            <input
              type="text"
              placeholder="Type PURGE DUMMY"
              value={purgeConfirmText}
              onChange={(e) => setPurgeConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={purgeConfirmText !== "PURGE DUMMY" || purgeMutation.isPending}
                onClick={() => purgeMutation.mutate()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-40"
              >
                {purgeMutation.isPending ? "Purging Records..." : "Confirm & Delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPurging(false);
                  setPurgeConfirmText("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLI Seed Instruction Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Generate More Synthetic Dummy Profiles</h2>
            <p className="text-xs text-slate-400">
              Run the high-speed multi-row raw SQL seeder from your terminal workspace.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
          <code>pnpm --filter @everpride/database db:seed:dummy</code>
          <span className="text-[11px] text-slate-500">100k records / 2.5 min</span>
        </div>
      </div>
    </div>
  );
};

