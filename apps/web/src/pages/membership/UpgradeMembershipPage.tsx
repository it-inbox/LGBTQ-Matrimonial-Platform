import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import {
  Check,
  Info,
  Phone,
  PhoneCall,
  MessageCircle,
  X,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const UpgradeMembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { membership, setMembership, isAuthenticated, openLoginModal } = useAuthStore();

  // Tab: "self-service" or "assisted"
  const [tab, setTab] = useState<"self-service" | "assisted">("self-service");

  // Self-Service Plan Selection: "pro", "pro-max", "pro-supreme"
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "pro-max" | "pro-supreme">("pro-max");

  // Self-Service Duration: "1-month", "3-months", "till-marriage"
  const [selfDuration, setSelfDuration] = useState<"1-month" | "3-months" | "till-marriage">("1-month");

  // Assisted Duration: "3-months", "6-months", "12-months"
  const [assistedDuration, setAssistedDuration] = useState<"3-months" | "6-months" | "12-months">("3-months");

  // Help modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [requestCallbackSent, setRequestCallbackSent] = useState(false);

  // Payment simulator modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [currentCheckoutInfo, setCurrentCheckoutInfo] = useState<{
    planTier: string;
    duration: string;
    amount: number;
    planName: string;
    sessionId?: string;
  } | null>(null);

  // Self-service pricing based on plan and duration (in USD)
  const selfPrices: Record<
    "pro" | "pro-max" | "pro-supreme",
    Record<"1-month" | "3-months" | "till-marriage", { price: string; orig: string }>
  > = {
    pro: {
      "1-month": { price: "$9.99", orig: "$29.99" },
      "3-months": { price: "$24.99", orig: "$69.99" },
      "till-marriage": { price: "$79.99", orig: "$229.99" },
    },
    "pro-max": {
      "1-month": { price: "$14.99", orig: "$44.99" },
      "3-months": { price: "$37.99", orig: "$109.99" },
      "till-marriage": { price: "$119.99", orig: "$339.99" },
    },
    "pro-supreme": {
      "1-month": { price: "$21.99", orig: "$59.99" },
      "3-months": { price: "$54.99", orig: "$154.99" },
      "till-marriage": { price: "$169.99", orig: "$489.99" },
    },
  };

  const currentSelfPrice = selfPrices[selectedPlan][selfDuration];

  const assistedPrices: Record<"3-months" | "6-months" | "12-months", { price: string; orig: string }> = {
    "3-months": { price: "$149.99", orig: "$429.99" },
    "6-months": { price: "$249.99", orig: "$699.99" },
    "12-months": { price: "$399.99", orig: "$1,149.99" },
  };

  const planTitles = {
    pro: "Pro",
    "pro-max": "Pro Max",
    "pro-supreme": "Pro Supreme",
  };

  const handleInitiatePayment = async (
    planTier: string,
    duration: string,
    rawPriceString: string,
    planName: string
  ) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const cleanNum = parseFloat(rawPriceString.replace(/[^0-9.]/g, "")) || 14.99;

    try {
      const res = await api.post("/payments/create-checkout-session", {
        planTier,
        duration,
        amount: cleanNum,
      });

      const { sessionId } = res.data;
      setCurrentCheckoutInfo({
        planTier,
        duration,
        amount: cleanNum,
        planName,
        sessionId,
      });
      setPaymentResult({ status: "idle", message: "" });
      setIsPaymentModalOpen(true);
    } catch {
      // Fallback directly to simulator
      setCurrentCheckoutInfo({
        planTier,
        duration,
        amount: cleanNum,
        planName,
        sessionId: `sim_sess_${Date.now()}`,
      });
      setPaymentResult({ status: "idle", message: "" });
      setIsPaymentModalOpen(true);
    }
  };

  const handleExecutePaymentSimulation = async (simulateSuccess: boolean) => {
    if (!currentCheckoutInfo) return;
    setIsProcessingPayment(true);
    setPaymentResult({ status: "idle", message: "" });

    try {
      const res = await api.post("/payments/complete-simulation", {
        sessionId: currentCheckoutInfo.sessionId,
        planTier: currentCheckoutInfo.planTier,
        duration: currentCheckoutInfo.duration,
        amount: currentCheckoutInfo.amount,
        simulateSuccess,
      });

      if (res.data.success) {
        setMembership(res.data.membership);
        setPaymentResult({
          status: "success",
          message: res.data.message || "Payment processed! Membership upgraded successfully.",
        });
      } else {
        setPaymentResult({
          status: "error",
          message: res.data.message || "Payment was declined by card issuer.",
        });
      }
    } catch {
      if (simulateSuccess) {
        setPaymentResult({
          status: "success",
          message: "Payment processed successfully! Your account perks are now active.",
        });
      } else {
        setPaymentResult({
          status: "error",
          message: "Simulated payment failure: card was declined.",
        });
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Navigation Sidebar */}
        <ActivitySidebar />

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pr-1">
          <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col">
            {/* Header Bar */}
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 flex items-center justify-between border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="p-1.5 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Upgrade Membership
                </h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequestCallbackSent(false);
                  setIsHelpModalOpen(true);
                }}
                className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Need help?
              </button>
            </div>

            {/* Tab Toggle: Self-Service vs Assisted */}
            <div className="p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setTab("self-service")}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    tab === "self-service"
                      ? "bg-white text-slate-900 shadow-xs border border-rose-200/70 text-rose-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Self-Service
                </button>
                <button
                  type="button"
                  onClick={() => setTab("assisted")}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    tab === "assisted"
                      ? "bg-white text-slate-900 shadow-xs border border-rose-200/70 text-rose-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Assisted
                </button>
              </div>

              {/* TAB 1: SELF SERVICE */}
              {tab === "self-service" && (
                <div className="space-y-5 animate-fade-in">
                  {/* 30-Day Money Back Banner */}
                  <div className="flex items-center justify-between p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center font-black text-[8px] leading-tight shrink-0 shadow-xs">
                        <span>30-DAY</span>
                        <span className="font-extrabold text-[9px]">MONEY</span>
                        <span>BACK</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-emerald-900 leading-snug">
                          30-day full refund guarantee*
                        </h4>
                        <p className="text-[11px] font-medium text-emerald-700">
                          *Conditions apply
                        </p>
                      </div>
                    </div>
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mr-1" />
                  </div>

                  {/* Plans Comparison Table */}
                  <div className="relative pt-3 pb-1">
                    <div className="grid grid-cols-12 gap-2 sm:gap-3 text-xs items-stretch">
                      {/* Left Label column */}
                      <div className="col-span-3 sm:col-span-3 flex flex-col justify-between pt-14 pb-2 text-slate-700 font-semibold text-[11px] sm:text-xs">
                        <div className="h-8 flex items-center truncate">Contact Sharing</div>
                        <div className="h-8 flex items-center gap-1">
                          Engage+ <Info className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                        <div className="h-8 flex items-center truncate">Contact Details</div>
                        <div className="h-8 flex items-center gap-1">
                          Super Interest <Info className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                        <div className="h-8 flex items-center gap-1">
                          Spotlights <Info className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                        <div className="h-8 flex items-center truncate">Gold Badge</div>
                      </div>

                      {/* Plan: Pro */}
                      <div
                        onClick={() => setSelectedPlan("pro")}
                        className={`col-span-3 sm:col-span-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center ${
                          selectedPlan === "pro"
                            ? "bg-rose-50/60 border-rose-500 shadow-sm"
                            : "bg-white border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-center w-full space-y-1.5 pt-1 h-13 flex flex-col items-center justify-start">
                          <div className="font-black text-slate-900 text-xs sm:text-sm">Pro</div>
                          <div className="flex justify-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPlan === "pro"
                                  ? "border-rose-600 bg-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {selectedPlan === "pro" && (
                                <div className="w-2 h-2 rounded-full bg-rose-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col items-center text-slate-800 font-bold text-xs sm:text-sm pb-2">
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center">25</div>
                          <div className="h-8 flex items-center justify-center">0</div>
                          <div className="h-8 flex items-center justify-center">0</div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                        </div>
                      </div>

                      {/* Plan: Pro Max (Recommended / Selected by default) */}
                      <div
                        onClick={() => setSelectedPlan("pro-max")}
                        className={`col-span-3 sm:col-span-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center relative ${
                          selectedPlan === "pro-max"
                            ? "bg-rose-50/70 border-rose-500 shadow-md ring-2 ring-rose-500/20"
                            : "bg-white border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-center w-full space-y-1.5 pt-1 h-13 flex flex-col items-center justify-start">
                          <div className="font-black text-slate-900 text-xs sm:text-sm">Pro Max</div>
                          <div className="flex justify-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPlan === "pro-max"
                                  ? "border-rose-600 bg-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {selectedPlan === "pro-max" && (
                                <div className="w-2 h-2 rounded-full bg-rose-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col items-center text-slate-800 font-bold text-xs sm:text-sm pb-2">
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center">50</div>
                          <div className="h-8 flex items-center justify-center">50</div>
                          <div className="h-8 flex items-center justify-center">1</div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                        </div>
                      </div>

                      {/* Plan: Pro Supreme (Top Seller) */}
                      <div
                        onClick={() => setSelectedPlan("pro-supreme")}
                        className={`col-span-3 sm:col-span-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center relative ${
                          selectedPlan === "pro-supreme"
                            ? "bg-rose-50/60 border-rose-500 shadow-sm"
                            : "bg-white border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        {/* Top Seller Badge */}
                        <span className="absolute -top-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-2xs whitespace-nowrap">
                          Top Seller
                        </span>
                        <div className="text-center w-full space-y-1.5 pt-1 h-13 flex flex-col items-center justify-start">
                          <div className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                            Pro Supreme
                          </div>
                          <div className="flex justify-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPlan === "pro-supreme"
                                  ? "border-rose-600 bg-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {selectedPlan === "pro-supreme" && (
                                <div className="w-2 h-2 rounded-full bg-rose-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col items-center text-slate-800 font-bold text-xs sm:text-sm pb-2">
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                          <div className="h-8 flex items-center justify-center">80</div>
                          <div className="h-8 flex items-center justify-center">80</div>
                          <div className="h-8 flex items-center justify-center">3</div>
                          <div className="h-8 flex items-center justify-center"><Check className="w-4 h-4 text-slate-700" /></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offer divider */}
                  <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/90" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-black text-rose-600 tracking-wider uppercase">
                  FLAT 65% Off <span className="text-slate-700">ON ALL PLANS</span>
                </span>
              </div>

              {/* Duration Options */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "1-month" as const, label: "1 month" },
                  { id: "3-months" as const, label: "3 months" },
                  { id: "till-marriage" as const, label: "Till Marriage" },
                ].map((item) => {
                  const isSelected = selfDuration === item.id;
                  const priceInfo = selfPrices[selectedPlan][item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelfDuration(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-white ring-1 ring-rose-500 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600">
                          {item.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-rose-600 bg-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-rose-600" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900">
                          {priceInfo.price}
                        </div>
                        <div className="text-[11px] text-slate-400 line-through">
                          {priceInfo.orig}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleInitiatePayment(
                      selectedPlan,
                      selfDuration,
                      currentSelfPrice.price,
                      planTitles[selectedPlan]
                    )
                  }
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#e12a4c] hover:bg-[#c9203e] text-white font-extrabold text-sm sm:text-base shadow-md shadow-rose-600/20 transition-all cursor-pointer text-center block"
                >
                  Get {planTitles[selectedPlan]} now
                </button>
                <p className="text-center text-xs font-semibold text-slate-500">
                  Recurring payment, cancel anytime
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ASSISTED (Premier Lite) */}
          {tab === "assisted" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center pt-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Premier Lite
                </h2>
              </div>

              {/* Assisted Features Bullet List */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    Benefits of Top Seller + unlimited matches daily
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      Dedicated relationship manager to help you:
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                      <li>Enhance your profile</li>
                      <li>Find most relevant & serious matches</li>
                      <li>Get additional info of the match & background</li>
                      <li>With 3 times faster matching</li>
                      <li>Set up unlimited meetings with profiles</li>
                    </ul>
                  </div>
                </div>

                {/* Actions row: Request Call Back & Know more */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestCallbackSent(false);
                      setIsHelpModalOpen(true);
                    }}
                    className="py-2 px-4 rounded-xl border border-rose-500 text-rose-600 font-extrabold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Request Call Back
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("A dedicated relationship consultant will be assigned to guide your matrimony journey with verified inquiries.")}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Know more</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Offer divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/90" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-black text-rose-600 tracking-wider uppercase">
                  FLAT 65% Off <span className="text-slate-700">ON ALL PLANS</span>
                </span>
              </div>

              {/* Assisted Duration options */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "3-months" as const, label: "3 months" },
                  { id: "6-months" as const, label: "6 months" },
                  { id: "12-months" as const, label: "12 months" },
                ].map((item) => {
                  const isSelected = assistedDuration === item.id;
                  const priceInfo = assistedPrices[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAssistedDuration(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-white ring-1 ring-rose-500 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600">
                          {item.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-rose-600 bg-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-rose-600" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900">
                          {priceInfo.price}
                        </div>
                        <div className="text-[11px] text-slate-400 line-through">
                          {priceInfo.orig}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleInitiatePayment(
                      "premier-lite",
                      assistedDuration,
                      assistedPrices[assistedDuration].price,
                      "Premier Lite (Assisted)"
                    )
                  }
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#e12a4c] hover:bg-[#c9203e] text-white font-extrabold text-sm sm:text-base shadow-md shadow-rose-600/20 transition-all cursor-pointer text-center block"
                >
                  Get Premier Lite now
                </button>
                <p className="text-center text-xs font-semibold text-slate-500">
                  Recurring payment, cancel anytime
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>

      {/* HELP / CONTACT SALES MODAL */}
      {isHelpModalOpen && (
        <div
          onClick={() => setIsHelpModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-6 relative animate-in zoom-in-95"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-1.5 pr-8">
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Need help deciding membership plans?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Our sales team is here to pick the best plan for you
              </p>
            </div>

            {/* Actions list */}
            <div className="space-y-3.5">
              {/* Option 1: Call Us */}
              <a
                href="tel:18004196299"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Call us (Toll free) | 9 AM - 9 PM IST
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    1-800-419-6299
                  </p>
                </div>
              </a>

              {/* Option 2: Request Call Back */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Request call back
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Our sales team representative will get in touch with you
                    </p>
                  </div>
                </div>

                {requestCallbackSent ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Call back request submitted! We will call you shortly.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRequestCallbackSent(true)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Submit Call Back Request
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Support Callout Box */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
              <span>Need help with something other than membership plans? </span>
              <a
                href="mailto:support@everpride.com"
                className="font-bold text-rose-600 hover:underline inline-block"
              >
                Contact Customer Support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY SIMULATOR MODAL (DEV & SANDBOX MODE) */}
      {isPaymentModalOpen && currentCheckoutInfo && (
        <div
          onClick={() => {
            if (!isProcessingPayment) setIsPaymentModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-6 relative animate-in zoom-in-95"
          >
            {/* Header / Mode Indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
                    <span>EverPride Secure Checkout</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md mt-0.5">
                    <Lock className="w-3 h-3" />
                    <span>Gateway Simulator (Ready for Razorpay / Stripe)</span>
                  </span>
                </div>
              </div>

              {!isProcessingPayment && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
                <span>Selected Plan:</span>
                <span className="font-extrabold text-slate-900">{currentCheckoutInfo.planName}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
                <span>Billing Period:</span>
                <span className="font-medium text-slate-900 capitalize">
                  {currentCheckoutInfo.duration.replace("-", " ")}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">Total Due Today:</span>
                <span className="text-xl font-black text-rose-600">
                  ${currentCheckoutInfo.amount.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Simulated Payment Card Form Preview */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Card Information</span>
                <span className="text-[11px] text-slate-400 font-medium">Test Mode Card</span>
              </label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-800 tracking-wider">
                    •••• •••• •••• 4242
                  </span>
                  <span className="text-slate-400 font-semibold">12/28</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Cardholder: EverPride Member</span>
                  <span>CVC: •••</span>
                </div>
              </div>
            </div>

            {/* Payment Outcome Notification */}
            {paymentResult.status === "success" && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{paymentResult.message}</p>
                  <p className="text-[11px] text-emerald-700">
                    Your Gold Badge, direct contact viewing, and enhanced match quotas have been activated.
                  </p>
                </div>
              </div>
            )}

            {paymentResult.status === "error" && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-900 flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{paymentResult.message}</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    You can retry with the success action below.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {paymentResult.status === "success" ? (
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  navigate("/discover");
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Start Exploring Verified Matches
              </button>
            ) : (
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleExecutePaymentSimulation(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-60"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Simulated Payment...</span>
                    </>
                  ) : (
                    <span>Simulate Successful Payment (${currentCheckoutInfo.amount.toFixed(2)})</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleExecutePaymentSimulation(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 text-center"
                >
                  Simulate Declined / Failed Payment
                </button>
              </div>
            )}

            <p className="text-[11px] text-center text-slate-400 font-medium">
              🔒 Encrypted 256-bit connection. When live keys are supplied, this switches seamlessly to Stripe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
