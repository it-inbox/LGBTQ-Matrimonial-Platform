import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Smile,
  Heart,
  Sparkles,
  Flag,
  Search,
  X,
  Coffee,
  Activity,
  Plane,
  Lightbulb,
} from "lucide-react-native";
import { EMOJI_KEYWORDS } from "../data/emojiKeywords";

export interface EmojiCategory {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
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

interface MobileEmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const MobileEmojiPicker: React.FC<MobileEmojiPickerProps> = ({
  visible,
  onClose,
  onSelectEmoji,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollViewRef = useRef<any>(null);
  const tabsScrollViewRef = useRef<any>(null);
  const sectionPositions = useRef<{ [key: string]: number }>({});
  const tabPositions = useRef<{ [key: string]: number }>({});
  const isClickScrolling = useRef(false);

  // Flattened all emojis
  const allEmojis = useMemo(() => {
    return Array.from(new Set(EMOJI_CATEGORIES.flatMap((c) => c.emojis)));
  }, []);

  // Keyword-based search
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return allEmojis.filter((emoji) => {
      if (emoji.includes(q)) return true;
      const keywords = EMOJI_KEYWORDS[emoji];
      if (keywords && keywords.some((k) => k.toLowerCase().includes(q))) {
        return true;
      }
      return false;
    });
  }, [searchQuery, allEmojis]);

  // Keep active category tab in view when activeCategoryId changes
  useEffect(() => {
    const tabX = tabPositions.current[activeCategoryId];
    if (tabX !== undefined && tabsScrollViewRef.current) {
      tabsScrollViewRef.current.scrollTo({
        x: Math.max(0, tabX - 40),
        animated: true,
      });
    }
  }, [activeCategoryId]);

  const scrollToCategory = (catId: string) => {
    isClickScrolling.current = true;
    setActiveCategoryId(catId);
    const posY = sectionPositions.current[catId];
    if (posY !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(0, posY - 8), animated: true });
    }
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 450);
  };

  // Scroll spy: Update active category badge as user scrolls
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isClickScrolling.current || searchQuery.trim()) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    let currentId = EMOJI_CATEGORIES[0].id;

    for (const cat of EMOJI_CATEGORIES) {
      const pos = sectionPositions.current[cat.id];
      if (pos !== undefined && scrollY >= pos - 35) {
        currentId = cat.id;
      }
    }

    if (currentId !== activeCategoryId) {
      setActiveCategoryId(currentId);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900/50 justify-end">
        {/* Backdrop touch to close */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />

        {/* Bottom Sheet Card */}
        <View className="bg-white rounded-t-3xl p-4 h-[440px] shadow-2xl border-t border-slate-200 flex-col">
          {/* Header & Search Bar */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-3 py-2 border border-slate-200">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search all emojis..."
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 ml-2 text-xs text-slate-800 p-0"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={14} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-slate-100"
              activeOpacity={0.7}
            >
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Category Chips (All 9 Categories with Horizontal Auto-Scroll) */}
          {!searchQuery && (
            <View className="h-9 mb-3">
              <ScrollView
                ref={tabsScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center", gap: 8 }}
              >
                {EMOJI_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => scrollToCategory(cat.id)}
                      onLayout={(e) => {
                        tabPositions.current[cat.id] = e.nativeEvent.layout.x;
                      }}
                      style={{
                        height: 32,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                      }}
                      className={`flex-row items-center gap-1.5 ${
                        isSelected ? "bg-rose-600 shadow-xs" : "bg-slate-100"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Icon size={14} color={isSelected ? "#ffffff" : "#64748b"} />
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-white" : "text-slate-700"
                        }`}
                      >
                        {cat.shortName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Main Emoji List: Search Results or Continuous All-Category Scroll with Scroll-Spy */}
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {searchQuery.trim() ? (
              /* Search View */
              <View>
                <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Results ({searchResults.length})
                </Text>
                {searchResults.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Text className="text-sm font-semibold text-slate-500">
                      No emojis found for "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap">
                    {searchResults.map((emoji, idx) => (
                      <TouchableOpacity
                        key={`search-${emoji}-${idx}`}
                        onPress={() => onSelectEmoji(emoji)}
                        className="w-[12.5%] h-11 items-center justify-center rounded-xl active:bg-slate-100"
                        activeOpacity={0.6}
                      >
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* Continuous All Categories View */
              EMOJI_CATEGORIES.map((cat) => (
                <View
                  key={cat.id}
                  onLayout={(event) => {
                    sectionPositions.current[cat.id] = event.nativeEvent.layout.y;
                  }}
                  className="mb-4"
                >
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {cat.name} ({cat.emojis.length})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {cat.emojis.map((emoji, idx) => (
                      <TouchableOpacity
                        key={`${cat.id}-${emoji}-${idx}`}
                        onPress={() => onSelectEmoji(emoji)}
                        className="w-[12.5%] h-11 items-center justify-center rounded-xl active:bg-slate-100"
                        activeOpacity={0.6}
                      >
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
