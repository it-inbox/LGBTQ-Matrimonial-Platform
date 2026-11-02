import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { useAuthStore } from "../../stores/auth.store";
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileQuestion,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Send,
  UserCheck,
  CreditCard,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "privacy" | "membership" | "matching" | "safety";
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "privacy",
    question: "How does EverPride protect my privacy if I am not out to everyone?",
    answer:
      "EverPride was built from the ground up for discreet usage. By default, your photos are blurred to all visitors until you explicitly grant unblur access or accept a mutual interest. You can also enable Ghost Mode to browse profiles without leaving visitor traces, and use a preferred display name / alias instead of your legal identity.",
  },
  {
    id: "faq-2",
    category: "privacy",
    question: "Who can see my phone number and contact details?",
    answer:
      "Your phone number is never shown publicly. Only verified members with whom you have mutually accepted an interest and who hold an active Premium membership can view your contact information.",
  },
  {
    id: "faq-3",
    category: "membership",
    question: "How does the 30-day money-back guarantee work?",
    answer:
      "If you upgrade to any Pro or Pro Max plan and do not receive verified profile engagement within 30 days, you can contact our 24/7 support team to request a full refund according to our transparent terms.",
  },
  {
    id: "faq-4",
    category: "membership",
    question: "What is the difference between Self-Service and Assisted (Premier Lite)?",
    answer:
      "Self-service plans give you full direct control to search, send interests, and unlock contacts independently. Premier Lite pairs you with a dedicated relationship manager who hand-picks verified prospects, schedules meetings, and conducts discreet background verification.",
  },
  {
    id: "faq-5",
    category: "matching",
    question: "How does reciprocal auto-matching work?",
    answer:
      "If User A sends an interest to User B, and User B has also sent an interest to User A, our matchmaking engine automatically upgrades both interests to Accepted. Both members instantly receive a mutual match notification and can begin chatting immediately.",
  },
  {
    id: "faq-6",
    category: "safety",
    question: "How do I report or block a suspicious profile?",
    answer:
      "On any member's profile, click the three-dot action menu and select 'Block & Report'. Once blocked, the user is permanently hidden from your discovery feed and cannot send interests, messages, or unblur requests.",
  },
  {
    id: "faq-7",
    category: "safety",
    question: "Are profile photos watermarked against screenshots?",
    answer:
      "Yes. All photos are rendered with encrypted server-side watermarking ('EverPride Verified') and the web client applies protective CSS shields to safeguard community members from unauthorized downloads or leaks.",
  },
];

export const HelpSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "privacy" | "membership" | "matching" | "safety">("all");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-1");

  // Contact form state
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubmitted(true);
      setContactSubject("");
      setContactMessage("");
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Navigation Sidebar if authenticated */}
        {isAuthenticated && <ActivitySidebar />}

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pr-1">
          <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
            {/* Top Breadcrumb & Back */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                EverPride Care & Safety
              </span>
            </div>

            {/* Hero Banner with Search */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-brand-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  <span>24/7 LGBTQ+ Member Support</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  How can we help you today?
                </h1>
                <p className="text-xs sm:text-sm text-rose-100 font-medium">
                  Find answers regarding discreet verification, private photos, membership perks, and safe matrimonial connections.
                </p>

                {/* Search Bar */}
                <div className="pt-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions (e.g. photos, phone number, refund, ghost mode)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>
              </div>

              {/* Decorative Background Circles */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-brand-900/30 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Quick Contact Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Toll-Free Helpline</h3>
                    <p className="text-xs text-slate-500 font-medium">9 AM - 9 PM IST</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href="tel:18004196299"
                    className="text-xs sm:text-sm font-black text-rose-600 hover:text-rose-700"
                  >
                    1-800-419-6299
                  </a>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Email Support</h3>
                    <p className="text-xs text-slate-500 font-medium">Response within 2 hours</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href="mailto:support@everpride.com"
                    className="text-xs sm:text-sm font-black text-purple-600 hover:text-purple-700"
                  >
                    support@everpride.com
                  </a>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Safety Center</h3>
                    <p className="text-xs text-slate-500 font-medium">Privacy & Security</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to="/privacy-settings"
                    className="text-xs sm:text-sm font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Manage Safeguards</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {filteredFaqs.length} articles
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all" as const, label: "All Questions" },
                  { id: "privacy" as const, label: "Privacy & Photos" },
                  { id: "membership" as const, label: "Membership & Billing" },
                  { id: "matching" as const, label: "Matches & Interests" },
                  { id: "safety" as const, label: "Safety & Reporting" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = expandedFaq === faq.id;
                    return (
                      <div key={faq.id} className="transition-colors">
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                          className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70"
                        >
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                            {faq.question}
                          </span>
                          <span className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No matching questions found</p>
                    <p className="text-xs text-slate-400">
                      Try searching with different terms or submit a support ticket below.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Support Ticket Submission Form */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Still have questions? Send our support team a message
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Our member assistance team responds within 2 business hours.
                </p>
              </div>

              {ticketSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold">Ticket Submitted Successfully!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your query reference is #EP-{Date.now().toString().slice(-6)}. A confirmation has been sent to your registered contact.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question about membership billing, profile unblur, or safety inquiry"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe your question or issue in detail..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Sending..." : "Submit Support Request"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
