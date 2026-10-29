import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  EyeOff,
  Lock,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Eye,
  ChevronDown,
  UserCheck,
  Heart,
  MessageCircle,
  HelpCircle,
  Award,
} from "lucide-react";
import { useAuthStore } from "../stores/auth.store";

import heroCoupleImg from "/hero-couple.jpg";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, openLoginModal } = useAuthStore();

  // "Looking For" Hero Matchmaker Card State
  const [lookingFor, setLookingFor] = useState({
    gender: "MAN",
    orientation: "GAY",
    minAge: 22,
    maxAge: 32,
  });

  // Interactive Privacy Simulator State
  const [simulatorUnblurred, setSimulatorUnblurred] = useState(false);

  // FAQ Accordion Active Index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("everpride_hero_preferences", JSON.stringify(lookingFor));
    } catch { }

    if (!isAuthenticated) {
      openLoginModal();
    } else if (profile) {
      navigate("/matches");
    } else {
      navigate("/onboarding");
    }
  };

  const handleCtaClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else if (profile) {
      navigate("/matches");
    } else {
      navigate("/onboarding");
    }
  };

  // Ages from 18 to 40, plus 40+
  const ageOptions = [
    ...Array.from({ length: 23 }, (_, i) => ({ value: 18 + i, label: `${18 + i}` })),
    { value: 41, label: "40+" },
  ];

  const faqs = [
    {
      q: "Can anyone on the internet see my profile and photos?",
      a: "No. EverPride is a closed, member-only platform. You have granular control: choose between 'All Verified Members', 'Only Mutual Matches', or keep your photos blurred until you explicitly approve an unblur request from someone you feel comfortable with.",
    },
    {
      q: "Is my legal name exposed to other members?",
      a: "Never. You choose your own display name and pronouns for your dating and matrimonial profile. Legal verification data (KYC) is strictly encrypted and stored separately to protect your privacy and discretion.",
    },
    {
      q: "What is Ghost Mode and how does it protect me?",
      a: "Ghost Mode allows you to browse prospective partner profiles completely anonymously without leaving visitor footprints. If you ever need to close the app quickly, our one-click Quick Exit instantly redirects to a neutral search engine.",
    },
    {
      q: "How does mutual matching work?",
      a: "When you send an interest to someone who has also expressed interest in you, EverPride automatically connects you both as a match. Both users receive an instant notification and can begin chatting immediately.",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Preserved as requested)
         ───────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full h-[calc(100vh-4rem)] min-h-[600px] flex flex-col justify-end pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-slate-200/40 bg-cover bg-top"
        style={{
          backgroundImage: `url(${heroCoupleImg})`,
        }}
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
            Find{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-rose-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              the one
            </span>{" "}
            for you
          </h1>

          <p className="mt-3 text-base sm:text-xl text-white max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Find your life partner with genuine respect, zero judgment, and the strongest privacy safeguards built into every interaction.
          </p>

          {/* HERO "LOOKING FOR" CARD */}
          <div className="mt-6 max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl shadow-brand-500/15 p-5 sm:p-6 text-left">
              <form onSubmit={handleHeroSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Gender */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    I'm looking for a
                  </label>
                  <select
                    value={lookingFor.gender}
                    onChange={(e) => setLookingFor({ ...lookingFor, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="MAN">Man</option>
                    <option value="WOMAN">Woman</option>
                    <option value="NON_BINARY">Non-Binary</option>
                    <option value="TRANS_MAN">Trans Man</option>
                    <option value="TRANS_WOMAN">Trans Woman</option>
                    <option value="GENDERQUEER">Genderqueer</option>
                    <option value="AGENDER">Agender</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Sexual Orientation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Orientation
                  </label>
                  <select
                    value={lookingFor.orientation}
                    onChange={(e) => setLookingFor({ ...lookingFor, orientation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="GAY">Gay</option>
                    <option value="LESBIAN">Lesbian</option>
                    <option value="BISEXUAL">Bisexual</option>
                    <option value="PANSEXUAL">Pansexual</option>
                    <option value="QUEER">Queer</option>
                    <option value="ASEXUAL">Asexual</option>
                    <option value="DEMISEXUAL">Demisexual</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Age Range (18 to 40, plus 40+) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Aged
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={lookingFor.minAge}
                      onChange={(e) => setLookingFor({ ...lookingFor, minAge: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      {ageOptions.map((opt) => (
                        <option key={`min-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400 font-semibold">to</span>
                    <select
                      value={lookingFor.maxAge}
                      onChange={(e) => setLookingFor({ ...lookingFor, maxAge: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      {ageOptions.map((opt) => (
                        <option key={`max-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit / Continue CTA */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-pink-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-md shadow-brand-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
                  >
                    <span>Let's Begin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE TRUST & VERIFICATION METRICS TICKER
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 py-6 border-b border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                100%
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center justify-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Phone Profiles
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-400">
                Zero
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                Zero Public Browsing
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                End-to-End
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-pink-400" />
                Private Photo Shields
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-rose-400">
                Mutual
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Consent-First Connections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE PRIVACY SHOWCASE & SIMULATOR
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50 relative overflow-hidden">
        {/* Ambient background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/10 via-pink-400/10 to-amber-300/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Groundbreaking Discretion
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
              Total control over your image & identity
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Experience how your profile appears to the outside world versus someone you trust. Test the interactive simulator below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: 3 Core Pillars */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-brand-400 transition-all hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      Granular Photo Access Controls
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Choose to blur your photos by default. Only users whose interest you accept, or who explicitly request and receive your one-on-one permission, can unblur your pictures.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Alias Browsing & Encrypted KYC
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Protect your legal identity and workplace discretion. Connect with prospective partners using your chosen display name and pronouns while verification records stay encrypted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-400 transition-all hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Stealth Ghost Mode & Quick Exit
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Explore prospects without leaving footprints on their profile visitor feeds. Need immediate privacy? Quick Exit is always accessible in one tap.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Photo Blur Simulator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 relative overflow-hidden animate-float-slow">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700">Live Privacy Demo</span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    Try Toggling Below
                  </span>
                </div>

                {/* Simulated Profile Card */}
                <div className="mt-5 relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-md">
                  <img
                    src={heroCoupleImg}
                    alt="Privacy Demo"
                    className={`w-full h-full object-cover transition-all duration-700 ${simulatorUnblurred ? "blur-0 scale-100" : "blur-xl scale-105 opacity-80"
                      }`}
                  />

                  {/* Privacy Overlay Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all ${simulatorUnblurred
                        ? "bg-emerald-600/90 text-white backdrop-blur-sm"
                        : "bg-slate-950/80 text-amber-300 backdrop-blur-md border border-amber-300/30"
                        }`}
                    >
                      {simulatorUnblurred ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mutual Match: Photos Unblurred</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Protected: Photo Blurred</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Simulated Profile Info */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent text-white z-10">
                    <p className="text-base font-bold flex items-center gap-1.5">
                      <span>Rohan, 28</span>
                      <span className="text-xs font-normal text-slate-300">(he/him)</span>
                    </p>
                    <p className="text-xs text-slate-300">Product Designer • Mumbai</p>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700">Simulate View:</span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setSimulatorUnblurred(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!simulatorUnblurred
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Visitor View
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatorUnblurred(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${simulatorUnblurred
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Accepted Match
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW EVERPRIDE WORKS (3-Step Animated Timeline)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Simple & Respectful
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
              Your path to a lasting commitment
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600">
              Three transparent steps engineered for authentic long-term partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 relative hover:border-brand-300 hover:shadow-lg transition-all group">
              <span className="text-5xl font-black text-slate-200 group-hover:text-brand-200 transition-colors absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-6 shadow-md shadow-brand-500/25">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Build Your Identity</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Define your gender identity, orientation, lifestyle values, and privacy preferences with total autonomy. No intrusive public searches.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 relative hover:border-brand-300 hover:shadow-lg transition-all group">
              <span className="text-5xl font-black text-slate-200 group-hover:text-brand-200 transition-colors absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center mb-6 shadow-md shadow-pink-500/25">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Discover & Match</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Send interests to compatible prospective partners. When interest is mutual, EverPride instantly matches you both with zero friction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 relative hover:border-brand-300 hover:shadow-lg transition-all group">
              <span className="text-5xl font-black text-slate-200 group-hover:text-brand-200 transition-colors absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/25">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Safely</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Initiate real-time messages and encrypted communications in the Connect suite with online indicators and instant delivery notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. COMMUNITY STORIES & TRUST TESTIMONIALS
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">
              Genuine connections, authentic partners
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Hear from couples who found their life partner in an environment built specifically for their safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-md flex flex-col justify-between hover:border-slate-500 transition-colors">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "Finding a serious partner as a gay professional in India was daunting until EverPride. The photo unblur permission gave me the peace of mind I needed to open up on my own terms."
              </p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-rose-400 flex items-center justify-center font-bold text-sm text-white">
                  AM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Anand & Madhav</h4>
                  <p className="text-xs text-slate-400">Committed in 2025 • Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-md flex flex-col justify-between hover:border-slate-500 transition-colors">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "Most platforms either treat queer matrimony as an afterthought or an informal hookup space. EverPride treats our marriages with the cultural depth, dignity, and respect they deserve."
              </p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center font-bold text-sm text-white">
                  PT
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pooja & Tanya</h4>
                  <p className="text-xs text-slate-400">Married in 2026 • Pune</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-md flex flex-col justify-between hover:border-slate-500 transition-colors">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "As a trans woman, safety was non-negotiable. Knowing that every member is phone verified and that ghost mode keeps unwanted curiosity away made all the difference."
              </p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-sm text-white">
                  SK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Simran & Kabir</h4>
                  <p className="text-xs text-slate-400">Matched in 2025 • Delhi NCR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FREQUENTLY ASKED QUESTIONS (Accordion)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Clear & Transparent
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600">
              Everything you need to know about our privacy architecture and verification.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-base font-bold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-600" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 sm:p-6 bg-white border-t border-slate-100 text-sm text-slate-600 leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HIGH-CONVERSION CELEBRATORY BOTTOM CTA & FOOTER
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 text-center bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Ready to meet someone who understands your journey?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join hundreds of verified individuals discovering meaningful partnerships, marriages, and lifelong commitments.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 via-brand-600 to-pink-500 hover:from-rose-600 hover:to-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Begin with Confidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} EverPride Matrimonial. All rights reserved.</span>
            <span>•</span>
            <span>Zero Commercial Data Sharing</span>
            <span>•</span>
            <span>Encrypted Verification</span>
          </div>
        </div>
      </section>
    </div>
  );
};
