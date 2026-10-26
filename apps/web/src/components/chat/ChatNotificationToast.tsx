import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Send, Sparkles, Heart, X } from "lucide-react";
import { useChatStore } from "../../stores/chat.store";

export const ChatNotificationToast: React.FC = () => {
  const activeNotification = useChatStore((s) => s.activeNotification);
  const clearNotification = useChatStore((s) => s.clearNotification);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!activeNotification) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 6000);

    return () => clearTimeout(timer);
  }, [activeNotification, clearNotification]);

  if (!activeNotification) return null;

  const handleClick = () => {
    if (activeNotification.conversationId) {
      setActiveConversationId(activeNotification.conversationId);
    }
    const target = activeNotification.targetUrl || "/messages";
    clearNotification();
    if (location.pathname !== target) {
      navigate(target);
    }
  };

  const getBadgeIcon = () => {
    switch (activeNotification.type) {
      case "interest":
        return <Send className="w-2 h-2 text-white" />;
      case "interest_accepted":
        return <Heart className="w-2 h-2 text-white fill-white" />;
      case "match":
        return <Sparkles className="w-2 h-2 text-white" />;
      default:
        return <MessageSquare className="w-2 h-2 text-white" />;
    }
  };

  const getActionText = () => {
    switch (activeNotification.type) {
      case "interest":
        return "View received interests →";
      case "interest_accepted":
      case "match":
        return "View matches →";
      default:
        return "Click to reply →";
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-3.5 transition-all animate-bounceIn cursor-pointer hover:border-brand-300 group"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Sender Avatar */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-brand-600 to-rose-400 shadow-xs">
            {activeNotification.senderAvatar ? (
              <img
                src={activeNotification.senderAvatar}
                alt={activeNotification.senderName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                {activeNotification.senderName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
            {getBadgeIcon()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
              {activeNotification.title || activeNotification.senderName}
            </h4>
            <span className="text-[10px] text-slate-400 shrink-0">Just now</span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activeNotification.content}
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold text-brand-600 group-hover:underline">
            {getActionText()}
          </span>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearNotification();
          }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
