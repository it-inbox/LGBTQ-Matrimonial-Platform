import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import {
  X,
  Heart,
  Quote,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react-native";

interface SuccessStoriesScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface Story {
  id: string;
  coupleNames: string;
  identities: string;
  location: string;
  weddingDate: string;
  photoUrl: string;
  quote: string;
  fullStory: string;
  tag: "Gay" | "Lesbian" | "Trans / Non-Binary";
}

const STORIES: Story[] = [
  {
    id: "story-1",
    coupleNames: "Aarav & Siddharth",
    identities: "Gay Couple • Married",
    location: "Bengaluru, India",
    weddingDate: "October 2025",
    photoUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    quote:
      "EverPride's photo unblur safeguards gave us the discretion we needed before we were ready to take the next step.",
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
    photoUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    quote:
      "Finding someone who shared our values around queer marriage in India felt impossible until we joined EverPride.",
    fullStory:
      "Priya and Neha both value family integration and progressive values. Neha's profile was discreet because she was only out to close friends. After Priya sent a Super Interest with a heartfelt note on their shared love for classical art, they talked for three months and are now happily engaged.",
    tag: "Lesbian",
  },
  {
    id: "story-3",
    coupleNames: "Maya & Ananya",
    identities: "Queer & Trans Couple • Partners for Life",
    location: "Delhi NCR, India",
    weddingDate: "March 2026",
    photoUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    quote:
      "Having explicit gender and pronoun options made us feel seen and respected from day one.",
    fullStory:
      "Navigating traditional matrimonial networks as a trans woman was exhausting for Maya. On EverPride, every user profile celebrates self-identification and authentic pride. Maya connected with Ananya, a research scholar in Delhi, and the two have built a warm home with their two rescued cats.",
    tag: "Trans / Non-Binary",
  },
];

export const SuccessStoriesScreen: React.FC<SuccessStoriesScreenProps> = ({
  visible,
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredStories =
    activeFilter === "All"
      ? STORIES
      : STORIES.filter((s) => s.tag === activeFilter);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="px-5 py-4 bg-white border-b border-slate-200 flex-row items-center justify-between shadow-xs">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center">
              <Heart size={16} color="#e11d48" fill="#e11d48" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900">
                Success Stories
              </Text>
              <Text className="text-[11px] text-slate-500 font-medium">
                Celebrating love, authenticity & unions
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View className="bg-white px-4 py-2.5 border-b border-slate-100 flex-row gap-2">
          {["All", "Gay", "Lesbian", "Trans / Non-Binary"].map((pill) => {
            const isSelected = activeFilter === pill;
            return (
              <TouchableOpacity
                key={pill}
                onPress={() => setActiveFilter(pill)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-rose-600 border-rose-600 shadow-xs"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? "text-white font-bold" : "text-slate-600 font-medium"
                  }`}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Story List */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
          {filteredStories.map((story) => (
            <View
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-4"
            >
              <Image
                source={{ uri: story.photoUrl }}
                style={{ width: "100%", height: 220 }}
                contentFit="cover"
              />
              <View className="p-5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-lg font-bold text-slate-900">
                    {story.coupleNames}
                  </Text>
                  <View className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                    <Text className="text-[10px] font-bold text-rose-700">
                      {story.tag}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 text-slate-500 mb-3">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color="#64748b" />
                    <Text className="text-xs text-slate-500 font-medium">
                      {story.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Calendar size={12} color="#64748b" />
                    <Text className="text-xs text-slate-500 font-medium">
                      {story.weddingDate}
                    </Text>
                  </View>
                </View>

                {/* Quote Callout */}
                <View className="p-3 bg-rose-50/60 border-l-4 border-rose-500 rounded-r-xl mb-3">
                  <Text className="text-xs text-rose-950 italic font-medium leading-relaxed">
                    "{story.quote}"
                  </Text>
                </View>

                <Text className="text-xs text-slate-600 leading-relaxed font-normal">
                  {story.fullStory}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
