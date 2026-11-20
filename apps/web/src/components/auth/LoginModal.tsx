import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { ALL_COUNTRIES } from "@everpride/shared";
import { api } from "../../lib/api";
import { Phone, AlertCircle, ArrowRight, X, Lock, Search, Check, ChevronDown, UserPlus, HelpCircle } from "lucide-react";
import { Button, AlertBanner } from "../ui";

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, authModalMode, closeLoginModal, login, register, sendOtp } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [showNewAccountPrompt, setShowNewAccountPrompt] = useState(false);
  const [showExistingAccountPrompt, setShowExistingAccountPrompt] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countrySearch.trim()
    ? ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.dialCode.includes(countrySearch) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : ALL_COUNTRIES;

  // Whenever modal opens or is opened again, reset inputs if not currently active
  useEffect(() => {
    if (isLoginModalOpen) {
      setPhoneNumber("");
      setOtpCode("");
      setOtpSent(false);
      setIsRegistering(authModalMode === "register");
      setShowNewAccountPrompt(false);
      setShowExistingAccountPrompt(false);
      setCooldown(0);
      setError(null);
      setLoading(false);
    }
  }, [isLoginModalOpen, authModalMode]);

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

  const handleSendOtp = async (overrideMode?: "login" | "register") => {
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
      if (overrideMode) {
        setIsRegistering(overrideMode === "register");
      } else if (authModalMode === "register") {
        // User clicked "Let's Begin" / Register intent:
        // Check if phone number is ALREADY registered
        const checkRes = await api.get("/auth/check-phone", { params: { phoneNumber: fullPhone } });
        if (checkRes.data?.exists) {
          setShowExistingAccountPrompt(true);
          setShowNewAccountPrompt(false);
          setLoading(false);
          return;
        }
        setIsRegistering(true);
      } else {
        // User clicked "Sign In" intent:
        // Check if account exists; if not, show "Account Not Found" prompt
        const checkRes = await api.get("/auth/check-phone", { params: { phoneNumber: fullPhone } });
        if (!checkRes.data?.exists) {
          setShowNewAccountPrompt(true);
          setShowExistingAccountPrompt(false);
          setLoading(false);
          return;
        }
        setIsRegistering(false);
      }

      await sendOtp(fullPhone);
      setShowNewAccountPrompt(false);
      setShowExistingAccountPrompt(false);
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
      if (isRegistering) {
        await register(fullPhone, otpCode.trim());
      } else {
        await login(fullPhone, otpCode.trim());
      }
      closeLoginModal();
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        navigate("/discover");
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
          <h2 className="text-2xl font-black text-slate-900">
            {otpSent
              ? "Verify Mobile Number"
              : authModalMode === "register"
              ? "Create Your Account"
              : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {otpSent
              ? `Enter the verification code sent to ${getFullPhoneNumber()}`
              : authModalMode === "register"
              ? "Enter your mobile number to get started with EverPride"
              : "Sign in with your registered mobile number"}
          </p>
        </div>

        {error && (
          <AlertBanner
            variant="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-5"
          />
        )}

        {/* Already Registered Phone Prompt (when user arrived via Let's Begin / Register) */}
        {showExistingAccountPrompt && !otpSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200/80 text-brand-950">
              <div className="flex items-center gap-2 mb-1.5 text-brand-800 font-bold text-sm">
                <Check className="w-4 h-4 text-brand-600" />
                <span>Account Already Exists</span>
              </div>
              <p className="text-xs text-brand-900/90 leading-relaxed">
                An account with mobile number{" "}
                <span className="font-bold text-slate-900 font-mono">{getFullPhoneNumber()}</span> is already registered with EverPride.
              </p>
              <p className="text-xs text-brand-900 font-semibold mt-2">
                Would you like to sign in to your existing account instead?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                variant="gradient"
                size="md"
                isLoading={loading}
                onClick={() => handleSendOtp("login")}
                className="w-full py-3"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Existing Account
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => setShowExistingAccountPrompt(false)}
                className="w-full text-slate-600 hover:text-slate-900"
              >
                No, Change Phone Number
              </Button>
            </div>
          </div>
        ) : showNewAccountPrompt && !otpSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
              <div className="flex items-center gap-2 mb-1.5 text-amber-800 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Account Not Found</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                We couldn't find an existing account registered with{" "}
                <span className="font-bold text-slate-900 font-mono">{getFullPhoneNumber()}</span>.
              </p>
              <p className="text-xs text-amber-900 font-semibold mt-2">
                Would you like to register and create a new account with this number?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                variant="gradient"
                size="md"
                isLoading={loading}
                onClick={() => handleSendOtp("register")}
                className="w-full py-3"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Yes, Create New Account
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => setShowNewAccountPrompt(false)}
                className="w-full text-slate-600 hover:text-slate-900"
              >
                No, Change Phone Number
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (otpSent) {
                handleLogin(e);
              } else {
                handleSendOtp();
              }
            }}
            className="space-y-4"
          >
          {!otpSent ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                {/* Searchable Country Code Dropdown */}
                <div className="relative shrink-0" ref={countryDropdownRef}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setCountryPickerOpen(!countryPickerOpen);
                      setCountrySearch("");
                    }}
                    className="h-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 select-none transition-colors cursor-pointer"
                  >
                    {selectedCountryCode ? (
                      <>
                        <span className="bg-brand-100 text-brand-700 font-extrabold px-1.5 py-0.5 rounded text-[11px] tracking-wide">
                          {ALL_COUNTRIES.find((c) => c.dialCode === selectedCountryCode)?.code || ""}
                        </span>
                        <span className="text-slate-600 font-mono text-xs">{selectedCountryCode}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs">Code</span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {countryPickerOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country or code..."
                          className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
                        {filteredCountries.map((c) => {
                          const isSelected = selectedCountryCode === c.dialCode;
                          return (
                            <button
                              type="button"
                              key={`${c.code}-${c.dialCode}`}
                              onClick={() => {
                                setSelectedCountryCode(c.dialCode);
                                setCountryPickerOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-brand-50 text-brand-700 font-bold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate pr-2">
                                {c.name} ({c.code})
                              </span>
                              <span className="font-mono text-slate-500 font-bold shrink-0">
                                {c.dialCode}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We'll send a 6-digit verification code to confirm your number.
              </p>

              <Button
                type="submit"
                variant="gradient"
                size="md"
                isLoading={loading}
                className="w-full mt-5 py-3"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Verification Code (OTP)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="md"
                isLoading={loading}
                className="w-full mt-5 py-3"
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setError(null);
                }}
                className="w-full mt-3 py-1.5 text-center text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Change phone number
              </button>
            </div>
          )}
        </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, your phone number will be verified securely. New users are seamlessly redirected to set up their private profile.
        </p>
      </div>
    </div>
  );
};
