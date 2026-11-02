import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { useAuthStore } from "../../stores/auth.store";
import {
  Heart,
  Quote,
  Calendar,
  MapPin,
  ArrowLeft,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  UserCheck,
} from "lucide-react";

interface Story {
  id: string;
  coupleNames: string;
  identities: string;
  location: string;
  weddingDate: string;
  matchDuration: string;
  photoUrl: string;
  quote: string;
  fullStory: string;
  tag: "Gay" | "Lesbian" | "Trans / Non-Binary" | "Bisexual / Queer";
}

const stories: Story[] = [
  {
    id: "story-1",
    coupleNames: "Aarav & Siddharth",
    identities: "Gay Couple • Married",
    location: "Bengaluru, India",
    weddingDate: "October 2025",
    matchDuration: "Matched in 4 months",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    quote: "EverPride's photo unblur safeguards gave us the discretion we needed before we were ready to take the next step.",
    fullStory:
      "Aarav was working in tech in Bangalore while Siddharth was based in Pune. Both wanted a serious life partner but were hesitant about public matrimonial sites. With EverPride's mutual interest requirement and private albums, they connected safely, met in Mumbai for their first anniversary dinner, and tied the knot in Goa with the blessing of both families.",
    tag: "Gay",
  },
  {
    id: "story-2",
    coupleNames: "Priya & Neha",
    identities: "Lesbian Couple • Engaged",
    location: "Mumbai, India",
    weddingDate: "December 2025",
    matchDuration: "Matched in 2 months",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    quote: "Finding someone who shared our values around queer marriage in India felt impossible until we joined EverPride.",
    fullStory:
      "Priya and Neha both value family integration and progressive values. Neha's profile was on Ghost Mode because she was only out to close friends. After Priya sent a Super Interest with a heartfelt note on their shared love for classical art, they talked for three months and are now happily engaged.",
    tag: "Lesbian",
  },
  {
    id: "story-3",
    coupleNames: "Maya & Ananya",
    identities: "Queer & Trans Couple • Partners for Life",
    location: "Delhi NCR, India",
    weddingDate: "March 2026",
    matchDuration: "Matched in 6 months",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    quote: "Having explicit gender and pronoun options made us feel seen and respected from day one.",
    fullStory:
      "Navigating traditional matrimonial networks as a trans woman was exhausting for Maya. On EverPride, every user profile celebrates self-identification and authentic pride. Maya connected with Ananya, a research scholar in Delhi, and the two have built a warm home with their two rescued cats.",
    tag: "Trans / Non-Binary",
  },
  {
    id: "story-4",
    coupleNames: "Rohan & Dev",
    identities: "Gay Couple • Married",
    location: "Toronto & New Delhi",
    weddingDate: "January 2026",
    matchDuration: "Matched in 3 months",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    quote: "The international matchmaking filters helped us bridge 11,000 kilometers with complete peace of mind.",
    fullStory:
      "Rohan was living in Canada and looking for an Indian partner who wanted to relocate. Dev was an architect in Delhi. With EverPride's verified nationality and profession indicators, their families connected over video calls, and they celebrated their wedding in Udaipur.",
    tag: "Gay",
  },
];

export const SuccessStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState<"All" | "Gay" | "Lesbian" | "Trans / Non-Binary" | "Bisexual / Queer">("All");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Community Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [storySummary, setStorySummary] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const filteredStories = stories.filter(
    (story) => activeFilter === "All" || story.tag === activeFilter
  );

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1.trim() || !storySummary.trim()) return;

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowSubmitModal(false);
      setPartner1("");
      setPartner2("");
      setStorySummary("");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Navigation Sidebar if authenticated */}
        {isAuthenticated && <ActivitySidebar />}

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pr-1">
          <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
            {/* Top Breadcrumbs */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-600" />
                <span>Share Your Story</span>
              </button>
            </div>

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Real Couples • Real Pride</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  EverPride Success Stories
                </h1>
                <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
                  Every love story is a milestone for our community. Read how members found their lifelong partners through privacy-first, verified matchmaking.
                </p>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(["All", "Gay", "Lesbian", "Trans / Non-Binary", "Bisexual / Queer"] as const).map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveFilter(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeFilter === tag
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {tag === "All" ? "All Couples" : tag}
                  </button>
                )
              )}
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Photo & Badge */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={story.photoUrl}
                      alt={story.coupleNames}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                    
                    <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-extrabold text-rose-600 uppercase tracking-wider shadow-xs">
                      {story.tag}
                    </span>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                        {story.coupleNames}
                      </h3>
                      <p className="text-xs text-rose-200 font-semibold drop-shadow-xs flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </span>
                        <span>•</span>
                        <span>{story.weddingDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative pl-6 text-xs sm:text-sm font-semibold text-slate-700 italic">
                        <Quote className="w-4 h-4 text-rose-400 absolute left-0 top-0 rotate-180" />
                        "{story.quote}"
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {story.fullStory}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {story.matchDuration}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedStory(story)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Read Full Story</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Motivation CTA */}
            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-rose-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-3">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Ready to begin your own love story?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                Join thousands of verified LGBTQ+ individuals finding meaningful partnerships in a dignified, safe, and supportive matrimonial space.
              </p>
              <div className="pt-2">
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm transition-all shadow-md shadow-rose-600/20"
                >
                  <span>Explore Verified Matches</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FULL STORY READ MODAL */}
      {selectedStory && (
        <div
          onClick={() => setSelectedStory(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95"
          >
            <div className="relative h-56 w-full">
              <img
                src={selectedStory.photoUrl}
                alt={selectedStory.coupleNames}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h3 className="text-xl font-black">{selectedStory.coupleNames}</h3>
                <p className="text-xs text-rose-200 font-semibold">{selectedStory.identities}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-100 text-xs sm:text-sm font-semibold text-rose-950 italic">
                "{selectedStory.quote}"
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>{selectedStory.fullStory}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Location: {selectedStory.location}</span>
                <span>{selectedStory.weddingDate}</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT STORY MODAL */}
      {showSubmitModal && (
        <div
          onClick={() => setShowSubmitModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 relative animate-in zoom-in-95"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                <span>Share Your EverPride Story</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Inspire the community by sharing how you found your life partner on EverPride.
              </p>
            </div>

            {submissionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold">
                  Thank you for submitting! Our team will review your story and contact you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitStory} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name & Partner's Name
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={partner1}
                      onChange={(e) => setPartner1(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Partner's Name"
                      value={partner2}
                      onChange={(e) => setPartner2(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tell us your story
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How did you match? What was your first interaction like?..."
                    value={storySummary}
                    onChange={(e) => setStorySummary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                  >
                    Submit Story
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
