import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import {
  Smile,
  Heart,
  Sparkles,
  Flag,
  Search,
  X,
} from "lucide-react-native";

export const EMOJI_CATEGORIES = [
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
      "🫀", "🌹", "💐", "🌺", "🌸", "🌷", "🌻", "🌼", "✨", "💍",
      "🕊️", "🥂", "🍾", "🎂", "🧁", "🕯️",
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
      "👆", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜",
      "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳",
      "💪", "🦵", "🦶", "👂", "👃", "👀", "👁️", "👅", "👄", "🫦",
      "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👱", "🧔", "👵",
      "🧓", "👴", "🤴", "👸", "👳", "🧕", "👰", "🤵", "💃", "🕺",
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

  const activeCategory = useMemo(() => {
    return (
      EMOJI_CATEGORIES.find((c) => c.id === activeCategoryId) ||
      EMOJI_CATEGORIES[0]
    );
  }, [activeCategoryId]);

  const displayedEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory.emojis;
    }
    const q = searchQuery.toLowerCase().trim();
    // Search across all categories
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    return Array.from(new Set(all)).filter((e) => e.includes(q));
  }, [searchQuery, activeCategory]);

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
        <View className="bg-white rounded-t-3xl p-4 max-h-[420px] shadow-2xl border-t border-slate-200">
          {/* Header & Search */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-3 py-2 border border-slate-200">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search all emojis..."
                placeholderTextColor="#94a3b8"
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

          {/* Category Chips (hidden while searching) */}
          {!searchQuery && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-3"
              contentContainerStyle={{ gap: 6 }}
            >
              {EMOJI_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveCategoryId(cat.id)}
                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                      isSelected ? "bg-rose-600" : "bg-slate-100"
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
          )}

          {/* Category Title */}
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {searchQuery ? `Results (${displayedEmojis.length})` : activeCategory.name}
          </Text>

          {/* Emojis Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingBottom: 20,
            }}
          >
            {displayedEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={`${emoji}-${index}`}
                onPress={() => {
                  onSelectEmoji(emoji);
                }}
                className="w-[12.5%] h-11 items-center justify-center rounded-xl active:bg-slate-100"
                activeOpacity={0.6}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
