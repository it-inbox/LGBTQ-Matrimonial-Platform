import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { allCountries } from "../../data/countries";
import { Phone, AlertCircle, ArrowRight, X, Lock } from "lucide-react";

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, sendOtp } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!isLoginModalOpen) return null;

  const getFullPhoneNumber = () => {
    const raw = phoneNumber.trim().replace(/\s+/g, "").replace(/^0+/, "");
    if (!raw) return "";
    if (raw.startsWith("+")) return raw;
    if (!selectedCountryCode) return "";
    return `${selectedCountryCode}${raw}`;
  };

  const handleSendOtp = async () => {
    if (!selectedCountryCode && !phoneNumber.trim().startsWith("+")) {
      setError("Please select your country code.");
      return;
    }
    const fullPhone = getFullPhoneNumber();
    if (!phoneNumber.trim() || fullPhone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      setOtpSent(true);
      setCooldown(30); // 30s cooldown before allow resend
      setOtpCode(""); // User enters real OTP
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = getFullPhoneNumber();
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!otpCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(fullPhone, otpCode.trim());
      closeLoginModal();
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        navigate("/matches");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={closeLoginModal} />

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Verify Your Phone Number</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in or create your account using instant phone OTP verification
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              {/* Country Code Dropdown: exact same dropdown from /onboarding */}
              <div className="relative shrink-0">
                <select
                  disabled={loading}
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
                  title="Select Country Code"
                >
                  <option value="">Select Code</option>
                  {allCountries.map((c) => (
                    <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <div className="h-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 select-none transition-colors">
                  {selectedCountryCode ? (
                    <>
                      <span className="bg-brand-100 text-brand-700 font-extrabold px-1.5 py-0.5 rounded text-[11px] tracking-wide">
                        {allCountries.find((c) => c.dialCode === selectedCountryCode)?.code || ""}
                      </span>
                      <span className="text-slate-600 font-mono text-xs">{selectedCountryCode}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-normal text-xs">Code</span>
                  )}
                  <span className="text-[10px] text-slate-400">▼</span>
                </div>
              </div>

              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all font-mono"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || cooldown > 0}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer shrink-0 min-w-[90px]"
              >
                {cooldown > 0 ? `${cooldown}s` : otpSent ? "Resend" : "Send OTP"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              We'll send a 6-digit verification code to confirm your number.
            </p>
          </div>

          {otpSent && (
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900">Enter Verification Code</span>
                <span className="text-[11px] text-brand-600 font-medium">Valid for 5 mins</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full px-4 py-2.5 bg-white border border-brand-300 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:border-brand-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Verifying..." : "Continue"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, your phone number will be verified securely. New users are seamlessly redirected to set up their private profile.
        </p>
      </div>
    </div>
  );
};
