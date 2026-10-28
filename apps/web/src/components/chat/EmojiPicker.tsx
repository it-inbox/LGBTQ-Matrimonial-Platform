import React, { useState, useEffect, useRef } from "react";
import { Smile, Search, X, Heart, Sparkles } from "lucide-react";

export interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys & Emotion",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖",
      "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
      "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
      "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦",
    ],
  },
  {
    id: "romance",
    name: "Hearts & Love",
    icon: Heart,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "💌",
      "👩‍❤️‍👨", "👩‍❤️‍👩", "👨‍❤️‍👨", "👩‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", "👨‍❤️‍💋‍👨",
      "🌹", "💐", "🌺", "🌸", "🌷", "✨", "💍", "🕊️", "🥂", "🎂",
    ],
  },
  {
    id: "gestures",
    name: "People & Gestures",
    icon: Sparkles,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
      "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝",
      "🙏", "💪", "🫂", "🙆", "🙅", "💁", "🙋", "🧏", "🙇", "🤦",
    ],
  },
  {
    id: "celebration",
    name: "Pride & Celebration",
    icon: Sparkles,
    emojis: [
      "🏳️‍🌈", "🏳️‍⚧️", "🌈", "🎉", "🎊", "🎈", "🎁", "🍾", "🥳", "🎇",
      "🎆", "⭐", "🌟", "💫", "🦄", "🦚", "☀️", "🌙", "☕", "🍕",
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = searchQuery.trim()
    ? EMOJI_CATEGORIES.map((cat) => ({
        ...cat,
        emojis: cat.emojis.filter((emoji) => emoji.includes(searchQuery.trim())),
      })).filter((cat) => cat.emojis.length > 0)
    : EMOJI_CATEGORIES;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-2 sm:left-4 mb-2 z-50 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      style={{ maxHeight: "360px" }}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 placeholder:text-slate-400"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          title="Close emoji picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Icons Tabs (if not searching) */}
      {!searchQuery && (
        <div className="flex items-center px-2 py-1.5 border-b border-slate-100 bg-white/60 gap-1 overflow-x-auto scrollbar-none">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`emoji-cat-${cat.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-rose-50 text-rose-600 shadow-2xs font-bold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emojis Grid Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No emojis found
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} id={`emoji-cat-${cat.id}`} className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {cat.name}
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {cat.emojis.map((emoji, idx) => (
                  <button
                    key={`${cat.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectEmoji(emoji);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-xl hover:bg-rose-50 hover:scale-125 active:scale-95 transition-transform duration-150 cursor-pointer select-none"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
