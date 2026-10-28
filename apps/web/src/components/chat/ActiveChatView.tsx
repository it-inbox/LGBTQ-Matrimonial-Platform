import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  Shield,
  Check,
  CheckCheck,
  User,
  Sparkles,
  Smile,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Ban,
  UserCheck,
} from "lucide-react";
import { ConversationItem, MessageItem, useChatStore } from "../../stores/chat.store";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth.store";
import { EmojiPicker } from "./EmojiPicker";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

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
  const editMessage = useChatStore((s) => s.editMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const emitTyping = useChatStore((s) => s.emitTyping);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Deleting confirmation state
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  // Active message actions menu on mobile/hover
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);

  // Chat options dropdown menu (for Block Member)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const profile = useAuthStore((s) => s.profile);
  const currentUserId = user?.id || profile?.userId;

  const isPartnerOnline =
    conversation.partner.isOnline ||
    onlineUserIds.has(conversation.partner.id);

  const isPartnerTyping = !!typingUsers[conversation.partner.id];

  // Check initial block status
  useEffect(() => {
    let isMounted = true;
    api.get(`/profiles/user/${conversation.partner.id}`)
      .then((res) => {
        if (isMounted) {
          setIsBlockedByMe(!!res.data?.interaction?.isBlockedByMe);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [conversation.partner.id]);

  const handleBlockUser = async () => {
    setIsBlocking(true);
    try {
      await api.post(`/matches/block/${conversation.partner.id}`);
      setIsBlockedByMe(true);
      setShowBlockModal(false);
      setShowOptionsMenu(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    setIsBlocking(true);
    try {
      await api.post(`/matches/unblock/${conversation.partner.id}`);
      setIsBlockedByMe(false);
      setShowOptionsMenu(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to unblock user");
    } finally {
      setIsBlocking(false);
    }
  };

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

    const handleMessageEdited = (editedMsg: MessageItem) => {
      if (editedMsg.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === editedMsg.id ? { ...m, ...editedMsg } : m))
        );
      }
    };

    const handleMessageDeleted = (payload: { messageId: string; conversationId: string; message?: MessageItem }) => {
      if (payload.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? payload.message || { ...m, isDeleted: true, content: "This message was deleted" }
              : m
          )
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
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

  const handleStartEdit = (msg: MessageItem) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
    setActiveMenuMessageId(null);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (msgId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed || isEditingSaving) return;

    setIsEditingSaving(true);
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: trimmed, isEdited: true } : m
        )
      );
      setEditingMessageId(null);
      await editMessage(msgId, trimmed);
    } catch (err) {
      console.error("Failed to edit message:", err);
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMessageId || isDeletingLoading) return;

    setIsDeletingLoading(true);
    const targetId = deletingMessageId;
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetId
            ? { ...m, isDeleted: true, content: "This message was deleted" }
            : m
        )
      );
      setDeletingMessageId(null);
      setActiveMenuMessageId(null);
      await deleteMessage(targetId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setIsDeletingLoading(false);
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

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptionsMenu((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Chat Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptionsMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                  <a
                    href={`/profile/${conversation.partner.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>View Profile</span>
                  </a>

                  {isBlockedByMe ? (
                    <button
                      type="button"
                      onClick={handleUnblockUser}
                      disabled={isBlocking}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isBlocking ? "Unblocking..." : "Unblock Member"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowBlockModal(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Block Member</span>
                    </button>
                  )}
                </div>
              </>
            )}
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

            const isEditing = editingMessageId === msg.id;
            const isDeleted = !!msg.isDeleted;
            const isEdited = !isDeleted && !!msg.isEdited;

            return (
              <div
                key={msg.id}
                className={`group relative flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                onMouseLeave={() => {
                  if (activeMenuMessageId === msg.id) setActiveMenuMessageId(null);
                }}
              >
                {/* Editing Inline Form */}
                {isEditing ? (
                  <div className="w-full max-w-sm sm:max-w-md p-2.5 rounded-2xl bg-white border-2 border-brand-500 shadow-md flex flex-col gap-2">
                    <div className="text-[11px] font-semibold text-brand-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Edit message
                      </span>
                      <span className="text-slate-400 font-normal text-[10px]">Esc to cancel • Enter to save</span>
                    </div>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveEdit(msg.id);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          handleCancelEdit();
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 text-slate-900"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isEditingSaving}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(msg.id)}
                        disabled={!editContent.trim() || isEditingSaving}
                        className="px-3 py-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/bubble flex items-center gap-1.5">
                    {/* Action buttons for sender's own message (visible on hover or when action menu active) */}
                    {isOwn && !isDeleted && (
                      <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs rounded-lg p-0.5 order-first">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors cursor-pointer"
                          title="Edit message"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMessageId(msg.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[78%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all ${
                        isDeleted
                          ? "bg-slate-100/90 text-slate-400 italic border border-slate-200/60 rounded-2xl"
                          : isOwn
                          ? "bg-gradient-to-r from-rose-500 to-brand-600 text-white rounded-br-xs shadow-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}

                {/* Timestamp and Edited/Read Badges */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                  {isEdited && (
                    <span className="text-[10px] text-slate-400 font-medium italic">
                      (edited)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{timeStr}</span>
                  {isOwn && !isDeleted && (
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingMessageId}
        onClose={() => setDeletingMessageId(null)}
        title="Delete Message?"
        description="Are you sure you want to delete this message? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5" />}
        iconVariant="danger"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingMessageId(null)}
              disabled={isDeletingLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeletingLoading}
            >
              Delete
            </Button>
          </>
        }
      />

      {/* Block Confirmation Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={`Block ${conversation.partner?.displayName || "Member"}?`}
        description="You will not be able to send or receive messages in this conversation while blocked. You can unblock anytime from options or privacy settings."
        icon={<Ban className="w-5 h-5" />}
        iconVariant="danger"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBlockModal(false)}
              disabled={isBlocking}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBlockUser}
              isLoading={isBlocking}
            >
              Block Member
            </Button>
          </>
        }
      />

      {/* Input Bar or Blocked Banner */}
      {isBlockedByMe ? (
        <div className="p-4 bg-rose-50 border-t border-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-rose-900">
              You have blocked this member
            </span>
          </div>
          <button
            type="button"
            onClick={handleUnblockUser}
            disabled={isBlocking}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isBlocking ? "Unblocking..." : "Unblock"}</span>
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};
