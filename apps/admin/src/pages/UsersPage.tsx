import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShieldAlert,
  UserMinus,
  X,
  User,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dummyFilter, setDummyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Invite Admin Modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", { page, search, roleFilter, statusFilter, dummyFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "15");
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (dummyFilter) params.append("isDummy", dummyFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await api.patch(`/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      await api.patch(`/admin/users/${userId}/verify`, { isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post(`/admin/users/${userId}/revoke`);
      return res.data;
    },
    onSuccess: (data) => {
      setActionMessage({ type: "success", text: data.message || "Admin rights revoked successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setTimeout(() => setActionMessage(null), 5000);
    },
    onError: (err: any) => {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to revoke admin rights.",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/users/invite", {
        email: inviteEmail.trim(),
        displayName: inviteName.trim(),
        password: invitePassword,
        role: inviteRole,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setActionMessage({ type: "success", text: data.message || "New staff member invited successfully!" });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInvitePassword("");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setTimeout(() => setActionMessage(null), 5000);
    },
    onError: (err: any) => {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to invite new staff account.",
      });
    },
  });

  const users = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">User Directory & Staff</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, audit profiles, invite internal team members, and manage access privileges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Admin / Moderator</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-brand-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="MODERATOR">Moderators</option>
            <option value="USER">Members (USER)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned / Suspended</option>
          </select>

          <select
            value={dummyFilter}
            onChange={(e) => {
              setDummyFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-brand-500"
          >
            <option value="">All Account Types</option>
            <option value="false">Real Members & Staff</option>
            <option value="true">Synthetic Dummy</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Member / Staff</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verified</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Loading directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No accounts found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const photo = u.profile?.photos?.[0]?.originalUrl;
                  const isStaff = u.role === "ADMIN" || u.role === "MODERATOR";
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                isStaff
                                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {u.profile?.displayName?.[0] || <User className="w-4 h-4" />}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-200">
                                {u.profile?.displayName || "Incomplete Profile"}
                              </span>
                              {isStaff && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  STAFF
                                </span>
                              )}
                              {u.isDummyUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  DUMMY
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                              {u.email || u.phoneNumber || "No email/phone"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            roleMutation.mutate({ userId: u.id, role: e.target.value })
                          }
                          className={`border rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-hidden ${
                            u.role === "ADMIN"
                              ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                              : u.role === "MODERATOR"
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                              : "bg-slate-950 border-slate-800 text-slate-300"
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            statusMutation.mutate({ userId: u.id, isActive: !u.isActive })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            u.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {u.isActive ? "Active" : "Banned"}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            verifyMutation.mutate({ userId: u.id, isVerified: !u.isVerified })
                          }
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            u.isVerified
                              ? "text-brand-400 bg-brand-500/10 border-brand-500/20 hover:bg-brand-500/20"
                              : "text-slate-500 bg-slate-950 border-slate-800 hover:text-slate-300"
                          }`}
                          title={u.isVerified ? "Mark as unverified" : "Mark as verified"}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {u.profile?.city
                          ? `${u.profile.city}, ${u.profile.state || u.profile.country}`
                          : "Not provided"}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isStaff && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to revoke admin rights for ${
                                      u.email || u.phoneNumber
                                    }? This will immediately terminate all active sessions.`
                                  )
                                ) {
                                  revokeMutation.mutate(u.id);
                                }
                              }}
                              title="Revoke admin privileges & terminate session"
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Revoke</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3.5 px-6 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Showing <strong className="text-slate-200">{users.length}</strong> of{" "}
            <strong className="text-slate-200">{meta.total}</strong> accounts
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invite Admin Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">Invite New Staff Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@everpride.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-hidden focus:border-brand-500"
                >
                  <option value="MODERATOR">Community Moderator (Review & Verify)</option>
                  <option value="ADMIN">Platform Administrator (Full Permissions)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Temporary Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 shadow-md shadow-brand-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {inviteMutation.isPending ? "Creating Account..." : "Provision Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100">Member Profile Inspection</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {selectedUser.profile?.photos?.[0]?.originalUrl ? (
                    <img
                      src={selectedUser.profile.photos[0].originalUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    {selectedUser.profile?.displayName || "No Display Name"}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedUser.id}
                  </p>
                  <p className="text-xs text-brand-400 font-semibold mt-0.5">
                    {selectedUser.email || selectedUser.phoneNumber || "No contact"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Gender</span>
                  <p className="text-slate-200 font-bold mt-0.5">
                    {selectedUser.profile?.gender || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Orientation</span>
                  <p className="text-slate-200 font-bold mt-0.5">
                    {selectedUser.profile?.orientation || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Location</span>
                  <p className="text-slate-200 font-bold mt-0.5">
                    {selectedUser.profile?.city || "Unknown"}, {selectedUser.profile?.country || ""}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Outness</span>
                  <p className="text-slate-200 font-bold mt-0.5">
                    {selectedUser.profile?.outnessStatus || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
