import React, { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import { Shield, EyeOff, Check, Lock, AlertCircle } from "lucide-react";

export const PrivacySettingsPage: React.FC = () => {
  const { profile, fetchProfile } = useAuthStore();
  const [photoVisibility, setPhotoVisibility] = useState(
    profile?.photoVisibility || "MUTUAL_MATCHES_ONLY"
  );
  const [ghostModeEnabled, setGhostModeEnabled] = useState(
    profile?.ghostModeEnabled || false
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/profiles/me/privacy", {
        photoVisibility,
        ghostModeEnabled,
      });
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy & Safety Center</h1>
          <p className="text-xs text-slate-500">Fine-tune who can view your identity and photos</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Privacy preferences updated successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Photo Visibility Controls
          </h2>
          <div className="space-y-3">
            {[
              {
                id: "ALL_MEMBERS",
                title: "Visible to Verified Members",
                desc: "Any signed-in member can view your photos without requesting permission.",
              },
              {
                id: "MUTUAL_MATCHES_ONLY",
                title: "Mutual Matches Only (Recommended)",
                desc: "Photos automatically unblur only after you and another member mutually accept interest.",
              },
              {
                id: "REQUEST_REQUIRED",
                title: "Require My Approval",
                desc: "Photos are blurred for everyone by default. You receive an unblur request when someone wants to see your photos.",
              },
            ].map((tier) => (
              <label
                key={tier.id}
                onClick={() => setPhotoVisibility(tier.id)}
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  photoVisibility === tier.id
                    ? "border-brand-500 bg-brand-50/40"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{tier.title}</span>
                  {photoVisibility === tier.id && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Browsing Discretion
          </h2>
          <label
            onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
            className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={ghostModeEnabled}
              onChange={() => {}}
              className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-bold text-slate-900">Ghost Mode (Incognito Browsing)</span>
              <p className="text-xs text-slate-500 mt-0.5">
                When active, other members will not be notified that you viewed their profile or appeared in their visitor logs.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? "Saving Changes..." : "Save Privacy Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};
