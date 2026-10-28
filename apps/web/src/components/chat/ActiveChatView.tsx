import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Shield, Check, CheckCheck, User, Sparkles, Smile } from "lucide-react";
import { ConversationItem, MessageItem, useChatStore } from "../../stores/chat.store";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth.store";
import { EmojiPicker } from "./EmojiPicker";

interface ActiveChatViewProps {
  conversation: ConversationItem;
  onBack?: () => void;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({
  conversation,
  onBack,
}) => {
  const user = useAuthStore((s) => s.user);
  const socket = useChatStore((s) => s.socket);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const emitTyping = useChatStore((s) => s.emitTyping);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const profile = useAuthStore((s) => s.profile);
  const currentUserId = user?.id || profile?.userId;

  const isPartnerOnline =
    conversation.partner.isOnline ||
    onlineUserIds.has(conversation.partner.id);

  const isPartnerTyping = !!typingUsers[conversation.partner.id];

  // 1. Fetch initial message history
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get(`/chat/conversations/${conversation.id}/messages?page=1&limit=50`)
      .then((res) => {
        if (isMounted) {
          setMessages(res.data.messages || []);
          setLoading(false);
          scrollToBottom();
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversation.id]);

  // 2. Listen to real-time events on active conversation
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: MessageItem) => {
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => {
          // If message already exists by real ID, don't duplicate
          if (prev.some((m) => m.id === msg.id)) return prev;

          // If this is our own message arriving via socket, replace any pending optimistic temp message
          const tempIdx = prev.findIndex(
            (m) => m.id.startsWith("temp-") && m.senderId === msg.senderId && m.content === msg.content
          );

          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = msg;
            return next;
          }

          return [...prev, msg];
        });
        scrollToBottom();

        // If incoming message from partner, mark as read
        if (msg.senderId === conversation.partner?.id) {
          socket.emit("mark_read", { conversationId: conversation.id });
        }
      }
    };

    const handleMessagesRead = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, conversation.id, conversation.partner.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Emit typing indicator with debounce
    emitTyping(conversation.id, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversation.id, false);
    }, 2000);
  };

  const [sending, setSending] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText("");
    emitTyping(conversation.id, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      conversationId: conversation.id,
      senderId: user?.id || "",
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    setSending(true);
    try {
      const realMessage = await sendMessage(conversation.id, text);
      if (realMessage) {
        setMessages((prev) => {
          // If socket already added this message by real ID, remove the temp message
          if (prev.some((m) => m.id === realMessage.id)) {
            return prev.filter((m) => m.id !== tempId);
          }
          // Otherwise, swap temp with the real server message
          return prev.map((m) => (m.id === tempId ? realMessage : m));
        });
      }
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? inputText.length;
      const end = input.selectionEnd ?? inputText.length;
      const newText = inputText.substring(0, start) + emoji + inputText.substring(end);
      setInputText(newText);

      // Trigger typing indicator
      emitTyping(conversation.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(conversation.id, false);
      }, 2000);

      // Restore cursor position right after the inserted emoji
      setTimeout(() => {
        input.focus();
        const nextPos = start + emoji.length;
        input.setSelectionRange(nextPos, nextPos);
      }, 0);
    } else {
      setInputText((prev) => prev + emoji);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-600 to-rose-400 shadow-2xs">
              {conversation.partner?.avatarUrl ? (
                <img
                  src={conversation.partner.avatarUrl}
                  alt={conversation.partner?.displayName || "Member"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                  {(conversation.partner?.displayName || "Member").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {isPartnerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {conversation.partner?.displayName || "Member"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isPartnerTyping ? (
                <span className="text-brand-600 font-semibold animate-pulse">Typing...</span>
              ) : isPartnerOnline ? (
                <span className="text-emerald-600 font-medium">Online</span>
              ) : (
                <span>{conversation.partner.city || "Verified Member"}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            <span>End-to-end safe</span>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
        {loading ? (
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div className="h-10 w-48 bg-slate-200/70 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              You both liked each other!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Break the ice! Send a respectful message to get to know{" "}
              {conversation.partner?.displayName || "your match"}.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = currentUserId
              ? msg.senderId === currentUserId
              : msg.senderId !== conversation.partner.id;

            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isOwn
                      ? "bg-gradient-to-r from-rose-500 to-brand-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-slate-400">{timeStr}</span>
                  {isOwn && (
                    <span>
                      {msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-brand-600" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Emoji Picker */}
      <div className="relative bg-white border-t border-slate-100">
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={handleSelectEmoji}
        />

        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
              showEmojiPicker
                ? "bg-rose-50 border-rose-200 text-rose-600 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Insert emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${conversation.partner?.displayName || "Member"}...`}
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
