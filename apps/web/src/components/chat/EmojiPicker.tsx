import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Smile,
  Heart,
  Sparkles,
  Search,
  X,
  Coffee,
  Plane,
  Activity,
  Lightbulb,
  Flag,
} from "lucide-react";

export interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface EmojiCategory {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    name: "Smileys & Emotion",
    shortName: "Smileys",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹",
      "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗",
      "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓",
      "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕",
      "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤",
      "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰",
      "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🫡", "🤫", "🤥",
      "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😦",
      "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🤐",
      "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈",
      "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾",
      "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿",
    ],
  },
  {
    id: "romance",
    name: "Hearts & Romance",
    shortName: "Hearts",
    icon: Heart,
    emojis: [
      "❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🖤", "🩶",
      "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗",
      "💖", "💘", "💝", "💟", "💌", "💋", "🫂", "👩‍❤️‍👨", "👩‍❤️‍👩", "👨‍❤️‍👨",
      "👩‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", "👨‍❤️‍💋‍👨", "🫀", "🌹", "💐", "🌺", "🌸", "🌷",
      "🌻", "🌼", "✨", "💍", "🕊️", "🥂", "🍾", "🎂", "🧁", "🕯️",
    ],
  },
  {
    id: "people",
    name: "People & Gestures",
    shortName: "People",
    icon: Sparkles,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛",
      "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅",
      "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "👀",
      "👁️", "👅", "👄", "🫦", "👶", "👧", "🧒", "👦", "👩", "🧑",
      "👨", "🧑‍🦱", "🧑‍🦰", "🧑‍🦳", "🧑‍🦲", "👱", "🧔", "👵", "🧓", "👴",
      "🤴", "👸", "👳", "🧕", "👰", "🤵", "🙇", "💁", "🙅", "🙆",
      "🙋", "🧏", "🤦", "🤷", "💆", "💇", "💃", "🕺", "👯", "🧑‍🤝‍🧑",
    ],
  },
  {
    id: "pride",
    name: "Pride & Community",
    shortName: "Pride",
    icon: Flag,
    emojis: [
      "🏳️‍🌈", "🏳️‍⚧️", "🌈", "🦄", "🦚", "🌸", "✨", "💫", "⭐", "🌟",
      "🎉", "🎊", "🪩", "👑", "💖", "🫶", "🧑‍🤝‍🧑", "👭", "👬", "👫",
      "👩‍👩‍👦", "👨‍👨‍👦", "👩‍👩‍👧", "👨‍👨‍👧", "🥂", "🍷", "🍸", "🍹", "💄", "👠",
      "🪞", "🎭", "🎨", "🎤", "🎷", "🎸", "🔮", "🪄", "🪅", "🎈",
    ],
  },
  {
    id: "nature",
    name: "Animals & Nature",
    shortName: "Nature",
    icon: Sparkles,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔",
      "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺",
      "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜",
      "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎",
      "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳",
      "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘",
      "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄",
      "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮",
      "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝",
      "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾",
      "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀",
      "🍁", "🍂", "🍃", "🍄", "🪨", "🪵", "🌺", "🌸", "🌼", "🌻",
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    shortName: "Food",
    icon: Coffee,
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
      "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅",
      "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
      "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔",
      "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗",
      "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟",
      "🦪", "🍤", "🍙", "🍚", "🍘", "🍢", "🥠", "🥮", "🍧", "🍨",
      "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿",
      "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🫖", "🍵",
      "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸",
      "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽️", "🥣", "🥡", "🥢",
    ],
  },
  {
    id: "activities",
    name: "Activities & Sports",
    shortName: "Activity",
    icon: Activity,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
      "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺",
      "⛹️", "🤾", "🧗", "🧘", "🏌️", "🏇", "🏄", "🏊", "🤽", "🚣",
      "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️",
      "🎫", "🎟️", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧",
      "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻",
      "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩", "🎳", "🪀", "🪄",
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    shortName: "Travel",
    icon: Plane,
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨",
      "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞",
      "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️",
      "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵",
      "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🛟", "⛽", "🚧", "🚦",
      "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡",
      "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️",
      "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭",
      "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩",
    ],
  },
  {
    id: "objects",
    name: "Objects & Symbols",
    shortName: "Objects",
    icon: Lightbulb,
    emojis: [
      "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️",
      "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
      "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️",
      "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋",
      "🪫", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵",
      "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰",
      "🪛", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪚", "🔩", "⚙️", "🪤",
      "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️",
      "🛡️", "🚬", "⚰️", "🪦", "⚱️", "🏺", "🔮", "📿", "🧿", "🪬",
      "💈", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "🩻", "🩼", "💊",
      "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🪠", "🧺",
      "🧻", "🚽", "🚰", "🚿", "🛁", "🧼", "🪥", "🪒", "🧽", "🪣",
      "🔑", "🗝️", "🚪", "🪑", "🛋️", "🛏️", "🛌", "🖼️", "🛍️", "🛒",
      "🎁", "🎈", "🎏", "🎀", "🪄", "🪅", "🎊", "🎉", "🎎", "🏮",
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isClickScrollingRef = useRef<boolean>(false);

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

  // Track active section as the user scrolls
  const handleScroll = () => {
    if (isClickScrollingRef.current) return;
    if (searchQuery.trim()) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const containerTop = container.scrollTop;
    const offsetThreshold = 40; // pixel buffer to activate before section top hits 0

    let currentSectionId = EMOJI_CATEGORIES[0].id;

    for (let i = 0; i < EMOJI_CATEGORIES.length; i++) {
      const cat = EMOJI_CATEGORIES[i];
      const el = document.getElementById(`emoji-cat-${cat.id}`);
      if (el) {
        const elTop = el.offsetTop - container.offsetTop;
        if (containerTop + offsetThreshold >= elTop) {
          currentSectionId = cat.id;
        } else {
          break;
        }
      }
    }

    setActiveCategory(currentSectionId);
  };

  const handleTabClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    isClickScrollingRef.current = true;

    const container = scrollContainerRef.current;
    const targetEl = document.getElementById(`emoji-cat-${categoryId}`);

    if (container && targetEl) {
      const topOffset = targetEl.offsetTop - container.offsetTop;
      container.scrollTo({ top: topOffset, behavior: "smooth" });
    }

    setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 450);
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return EMOJI_CATEGORIES;

    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((emoji) => emoji.includes(q)),
    })).filter((cat) => cat.emojis.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-2 sm:left-4 mb-2 z-50 w-72 sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      style={{ maxHeight: "390px" }}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all emojis..."
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

      {/* Category Icons Tabs: Highlights active section dynamically */}
      {!searchQuery && (
        <div className="flex items-center px-2 py-1.5 border-b border-slate-100 bg-white/60 gap-1 overflow-x-auto scrollbar-none">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTabClick(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs font-bold scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
                title={cat.name}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{cat.shortName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emojis Grid Area with scroll listener */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2.5 space-y-4 scrollbar-thin relative"
      >
        {filteredCategories.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No emojis found for "{searchQuery}"
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} id={`emoji-cat-${cat.id}`} className="space-y-1.5 scroll-mt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 sticky top-0 bg-white/95 backdrop-blur-xs py-0.5 z-10">
                {cat.name} ({cat.emojis.length})
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-9 gap-1">
                {cat.emojis.map((emoji, idx) => (
                  <button
                    key={`${cat.id}-${idx}`}
                    type="button"
                    onClick={() => onSelectEmoji(emoji)}
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
