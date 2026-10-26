import React from "react";
import { Link } from "react-router-dom";
import { Heart, Search, UserX, Inbox, Send, ArrowRight } from "lucide-react";

interface EmptyActivityStateProps {
  type: "received" | "sent" | "declined" | "iDeclined" | "theyDeclined" | "matches" | "unblur-received" | "unblur-sent";
}

export const EmptyActivityState: React.FC<EmptyActivityStateProps> = ({ type }) => {
  const content = {
    received: {
      title: "Respond to profiles that show interest!",
      desc: "Show other profiles whether you're interested or not by responding to their interests.",
      actionText: "View Matches",
      actionLink: "/discover",
      badgeColor: "bg-pink-500",
    },
    sent: {
      title: "Reach out to profiles you like!",
      desc: "Let profiles know that you're interested in them by sending an interest request.",
      actionText: "View Matches",
      actionLink: "/discover",
      badgeColor: "bg-brand-600",
    },
    "unblur-received": {
      title: "No photo access requests yet!",
      desc: "When other verified members request permission to unblur your private photos, they will appear here.",
      actionText: "Browse Discovery Feed",
      actionLink: "/discover",
      badgeColor: "bg-purple-500",
    },
    "unblur-sent": {
      title: "You haven't requested photo access yet!",
      desc: "Request unblur permissions on profiles with private photos to get to know them better.",
      actionText: "Discover Profiles",
      actionLink: "/discover",
      badgeColor: "bg-purple-600",
    },
    declined: {
      title: "Reach out to profiles you like!",
      desc: "Declined interests help you keep your feed clean and move ahead with your search for the right life partner.",
      actionText: "View Matches",
      actionLink: "/discover",
      badgeColor: "bg-slate-500",
    },
    iDeclined: {
      title: "No declined interests yet!",
      desc: "Interests you decline will be kept here so you can review or reconsider them anytime.",
      actionText: "View Matches",
      actionLink: "/discover",
      badgeColor: "bg-slate-500",
    },
    theyDeclined: {
      title: "No declined requests here!",
      desc: "Whenever an interest you sent is declined by the recipient, it will be organized here.",
      actionText: "Discover Matches",
      actionLink: "/discover",
      badgeColor: "bg-rose-500",
    },
    matches: {
      title: "Discover & connect with your mutual acceptances here!",
      desc: "Reach out & respond to profiles by sending or accepting interests to grow your mutual matches.",
      actionText: "Start Sending Interests",
      actionLink: "/discover",
      badgeColor: "bg-emerald-500",
    },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Decorative overlapping card illustration matching screenshot aesthetics */}
      <div className="relative w-48 h-36 mb-6 flex items-center justify-center">
        {/* Left card */}
        <div className="absolute -left-2 w-24 h-32 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs rotate-[-8deg] flex flex-col items-center p-3 opacity-90">
          <div className="w-10 h-10 rounded-full bg-amber-200/70 mb-2 flex items-center justify-center text-amber-700">
            <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="w-12 h-2 bg-amber-200/60 rounded-full mb-1" />
          <div className="w-8 h-1.5 bg-amber-200/40 rounded-full" />
        </div>

        {/* Right card */}
        <div className="absolute -right-2 w-24 h-32 rounded-2xl bg-teal-50 border border-teal-200/80 shadow-xs rotate-[8deg] flex flex-col items-center p-3 opacity-90">
          <div className="w-10 h-10 rounded-full bg-teal-200/70 mb-2 flex items-center justify-center text-teal-700">
            <Heart className="w-4 h-4 fill-teal-500 text-teal-500" />
          </div>
          <div className="w-12 h-2 bg-teal-200/60 rounded-full mb-1" />
          <div className="w-8 h-1.5 bg-teal-200/40 rounded-full" />
        </div>

        {/* Center card */}
        <div className="relative z-10 w-28 h-36 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center p-3.5">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 mb-2.5 flex items-center justify-center text-rose-500">
            {type === "declined" ? (
              <UserX className="w-6 h-6 text-rose-400" />
            ) : type === "matches" ? (
              <Heart className="w-6 h-6 fill-emerald-500 text-emerald-500" />
            ) : type === "sent" ? (
              <Send className="w-5 h-5 text-brand-600 ml-0.5" />
            ) : (
              <Inbox className="w-6 h-6 text-pink-500" />
            )}
          </div>
          <div className="w-14 h-2.5 bg-slate-200 rounded-full mb-1.5" />
          <div className="w-10 h-2 bg-slate-100 rounded-full" />

          <div className="mt-auto flex gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200" />
            <span className="w-3.5 h-3.5 rounded-full bg-brand-100 border border-brand-200" />
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 max-w-sm mb-1.5">
        {content.title}
      </h3>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        {content.desc}
      </p>

      <Link
        to={content.actionLink}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
      >
        <span>{content.actionText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
