import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Eye,
  Crown,
  Heart,
} from "lucide-react-native";
import { useAuthStore } from "../stores/auth.store";

interface UpgradeMembershipScreenProps {
  visible: boolean;
  onClose: () => void;
}

type PlanTier = "pro" | "pro-max" | "pro-supreme";
type Duration = "1-month" | "3-months" | "till-marriage";

const PLANS: Record<
  PlanTier,
  {
    name: string;
    tagline: string;
    isPopular?: boolean;
    features: string[];
    pricing: Record<Duration, { price: string; orig: string }>;
  }
> = {
  pro: {
    name: "Pro",
    tagline: "Essential tools for connecting with verified matches",
    features: [
      "Send up to 50 Direct Interests/mo",
      "Instant Photo Unblur Approvals",
      "Unlock 10 Contact Phone Numbers",
      "Verified Member Badge",
    ],
    pricing: {
      "1-month": { price: "$9.99", orig: "$29.99" },
      "3-months": { price: "$24.99", orig: "$69.99" },
      "till-marriage": { price: "$79.99", orig: "$229.99" },
    },
  },
  "pro-max": {
    name: "Pro Max",
    tagline: "Most popular: complete privacy, direct chats & profile spotlight",
    isPopular: true,
    features: [
      "Unlimited Direct Interests",
      "Direct Real-Time Messaging & Chat",
      "Unlock 35 Contact Phone Numbers",
      "Ghost Mode & Private Album Controls",
      "Priority Profile Spotlight in Discovery",
      "Dedicated Relationship Advisor Call",
    ],
    pricing: {
      "1-month": { price: "$14.99", orig: "$44.99" },
      "3-months": { price: "$37.99", orig: "$109.99" },
      "till-marriage": { price: "$119.99", orig: "$339.99" },
    },
  },
  "pro-supreme": {
    name: "Pro Supreme (VIP)",
    tagline: "Exclusive white-glove matrimonial matchmaking & concierge",
    features: [
      "Everything in Pro Max included",
      "Unlimited Contact Phone Numbers",
      "Personal Matrimonial Concierge Manager",
      "Curated Handpicked Matches Every Week",
      "Top #1 Search Ranking Spotlight",
      "Confidential Family Background Check",
    ],
    pricing: {
      "1-month": { price: "$21.99", orig: "$59.99" },
      "3-months": { price: "$54.99", orig: "$154.99" },
      "till-marriage": { price: "$169.99", orig: "$489.99" },
    },
  },
};

export const UpgradeMembershipScreen: React.FC<UpgradeMembershipScreenProps> = ({
  visible,
  onClose,
}) => {
  const { membership } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro-max");
  const [duration, setDuration] = useState<Duration>("3-months");

  const currentPlan = PLANS[selectedPlan];
  const currentPricing = currentPlan.pricing[duration];

  const handleCheckout = () => {
    Alert.alert(
      "Upgrade Membership",
      `Simulated checkout for ${currentPlan.name} (${duration}) at ${currentPricing.price}. In production, this launches the Razorpay/Stripe native gateway sheet.`,
      [
        {
          text: "OK",
          onPress: onClose,
        },
      ]
    );
  };

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
              <Crown size={16} color="#e11d48" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900">
                Upgrade Membership
              </Text>
              <Text className="text-[11px] text-slate-500 font-medium">
                Choose the plan that suits your matrimony journey
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
          {/* Duration Selector Tabs */}
          <View className="bg-slate-200/80 p-1 rounded-2xl flex-row mb-4">
            {(
              [
                { id: "1-month", label: "1 Month" },
                { id: "3-months", label: "3 Months (Save 45%)" },
                { id: "till-marriage", label: "Till Marriage" },
              ] as const
            ).map((d) => {
              const sel = duration === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDuration(d.id)}
                  className={`flex-1 py-2 rounded-xl items-center justify-center ${
                    sel ? "bg-white shadow-xs" : ""
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      sel ? "font-bold text-slate-900" : "font-medium text-slate-600"
                    }`}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tier Cards */}
          {(Object.keys(PLANS) as PlanTier[]).map((tierKey) => {
            const plan = PLANS[tierKey];
            const isSelected = selectedPlan === tierKey;
            const priceInfo = plan.pricing[duration];

            return (
              <TouchableOpacity
                key={tierKey}
                onPress={() => setSelectedPlan(tierKey)}
                activeOpacity={0.9}
                className={`p-4 rounded-2xl mb-3.5 border-2 ${
                  isSelected
                    ? "bg-white border-rose-600 shadow-md"
                    : "bg-white border-slate-200"
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <View className="self-start mb-2 px-2.5 py-0.5 rounded-full bg-rose-600">
                    <Text className="text-[10px] font-black uppercase text-white tracking-wider">
                      ★ MOST POPULAR
                    </Text>
                  </View>
                )}

                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-bold text-slate-900">
                      {plan.name}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5 leading-4">
                      {plan.tagline}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-lg font-black text-slate-900">
                      {priceInfo.price}
                    </Text>
                    <Text className="text-[11px] text-slate-400 line-through">
                      {priceInfo.orig}
                    </Text>
                  </View>
                </View>

                {/* Features list */}
                <View className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {plan.features.map((feat, fIdx) => (
                    <View key={fIdx} className="flex-row items-center gap-2">
                      <View className="w-4 h-4 rounded-full bg-emerald-100 items-center justify-center">
                        <Check size={10} color="#059669" />
                      </View>
                      <Text className="text-xs text-slate-700 flex-1 leading-4">
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Bottom Sticky Checkout Bar */}
        <View className="p-4 bg-white border-t border-slate-200/90 shadow-lg flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] uppercase font-bold text-slate-400">
              Selected: {currentPlan.name}
            </Text>
            <Text className="text-lg font-black text-rose-600">
              {currentPricing.price}{" "}
              <Text className="text-xs font-normal text-slate-500">
                / {duration === "till-marriage" ? "lifetime" : duration.replace("-", " ")}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            className="px-6 py-3.5 rounded-xl bg-rose-600 items-center justify-center shadow-xs"
          >
            <Text className="text-white font-bold text-sm">
              Upgrade Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
