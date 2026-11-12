import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import {
  Briefcase,
  GraduationCap,
  Heart,
  Check,
  X,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";

export interface MobileProfileCardProps {
  item: any;
  isReceived: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  isResponding?: boolean;
}

export const MobileProfileCard: React.FC<MobileProfileCardProps> = ({
  item,
  isReceived,
  onAccept,
  onDecline,
  isResponding = false,
}) => {
  const partnerUser = (isReceived ? item.sender : item.receiver) || {};
  const profile = partnerUser.profile || partnerUser || {};

  const calculateAge = (dobString?: string | Date | null) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const age = calculateAge(profile.dateOfBirth) || profile.age;

  const primaryPhoto =
    profile.photos?.find((p: any) => p.isPrimary) || profile.photos?.[0];
  const photoUrl =
    primaryPhoto?.thumbnailUrl ||
    primaryPhoto?.url ||
    primaryPhoto?.originalUrl ||
    profile.photoUrl;
  const isBlurred = primaryPhoto?.isBlurred ?? false;

  const isPending = item.status === "PENDING";
  const isAccepted = item.status === "ACCEPTED";
  const isDeclined = item.status === "DECLINED";

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-GB")
    : null;

  // Format height into ft in
  const formatHeight = (heightCm?: number | null) => {
    if (!heightCm) return null;
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}ft ${inches}in`;
  };

  const vitalsText = [
    formatHeight(profile.heightCm),
    [profile.city, profile.state].filter(Boolean).join(", "),
    profile.religion,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <View className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs mb-3.5">
      <View className="flex-row min-h-[170px]">
        {/* Left Photo / Fallback Avatar */}
        <View className="w-32 bg-slate-100 relative items-center justify-center overflow-hidden">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className={`w-full h-full ${isBlurred ? "blur-md" : ""}`}
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-full bg-rose-50/80 items-center justify-center">
              <Text className="text-rose-600 font-extrabold text-3xl">
                {(profile.displayName || profile.name || "?")[0]?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Photo Count badge */}
          {profile.photos && profile.photos.length > 1 && (
            <View className="absolute top-2 left-2 bg-slate-900/80 px-1.5 py-0.5 rounded-md flex-row items-center">
              <Text className="text-white text-[9px] font-bold">
                📷 {profile.photos.length}
              </Text>
            </View>
          )}

          {/* Frosted Privacy Shield if Blurred */}
          {isBlurred && (
            <View className="absolute inset-0 bg-slate-900/40 items-center justify-center p-2">
              <Lock size={16} color="#ffffff" />
              <Text className="text-[10px] font-bold text-white mt-1">
                Protected
              </Text>
            </View>
          )}
        </View>

        {/* Right Details Container */}
        <View className="flex-1 p-3.5 justify-between">
          <View>
            {/* Header: Date + Status Badge */}
            <View className="flex-row items-center justify-between mb-1 gap-1">
              <Text className="text-[11px] font-medium text-slate-500 flex-1" numberOfLines={1}>
                {isReceived ? "Received on " : "Sent on "}
                {formattedDate}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${
                  isAccepted
                    ? "bg-emerald-50 border border-emerald-200"
                    : isDeclined
                    ? "bg-rose-50 border border-rose-200"
                    : "bg-amber-50 border border-amber-200"
                }`}
              >
                {isAccepted ? (
                  <CheckCircle2 size={10} color="#059669" />
                ) : isDeclined ? (
                  <XCircle size={10} color="#e11d48" />
                ) : (
                  <Clock size={10} color="#d97706" />
                )}
                <Text
                  className={`text-[10px] font-bold ${
                    isAccepted
                      ? "text-emerald-700"
                      : isDeclined
                      ? "text-rose-600"
                      : "text-amber-700"
                  }`}
                >
                  {isAccepted ? "Accepted" : isDeclined ? "Declined" : "Pending"}
                </Text>
              </View>
            </View>

            {/* Name & Age */}
            <Text className="text-base font-extrabold text-slate-900" numberOfLines={1}>
              {profile.displayName || profile.name || "Member"}
              {age ? `, ${age}` : ""}
            </Text>

            {/* Gender • Orientation */}
            {(profile.gender || profile.orientation) && (
              <Text className="text-[11px] font-bold text-rose-600 tracking-wide mt-0.5 uppercase" numberOfLines={1}>
                {[profile.gender?.replace(/_/g, " "), profile.orientation]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            )}

            {/* Vitals row */}
            {vitalsText ? (
              <Text className="text-[11px] text-slate-600 font-medium mt-1" numberOfLines={1}>
                {vitalsText}
              </Text>
            ) : null}

            {/* Profession */}
            {profile.profession && (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Briefcase size={12} color="#94a3b8" />
                <Text className="text-[11px] text-slate-600 flex-1" numberOfLines={1}>
                  {profile.profession}
                </Text>
              </View>
            )}

            {/* Education & Marital Status */}
            <View className="flex-row items-center gap-3 mt-1 flex-wrap">
              {profile.education && (
                <View className="flex-row items-center gap-1">
                  <GraduationCap size={12} color="#94a3b8" />
                  <Text className="text-[11px] text-slate-600" numberOfLines={1}>
                    {profile.education}
                  </Text>
                </View>
              )}
              {profile.maritalStatus && (
                <View className="flex-row items-center gap-1">
                  <Heart size={12} color="#94a3b8" />
                  <Text className="text-[11px] text-slate-600" numberOfLines={1}>
                    {profile.maritalStatus.replace(/_/g, " ")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Full-width Actions (for Received & Pending items) */}
      {isReceived && isPending && onAccept && onDecline && (
        <View className="border-t border-rose-100 flex-row items-center bg-rose-50/40 divide-x divide-rose-100">
          <TouchableOpacity
            onPress={onAccept}
            disabled={isResponding}
            className="flex-1 py-2.5 flex-row items-center justify-center gap-1.5"
            activeOpacity={0.7}
          >
            <Check size={14} color="#059669" />
            <Text className="text-xs font-bold text-emerald-700">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDecline}
            disabled={isResponding}
            className="flex-1 py-2.5 flex-row items-center justify-center gap-1.5"
            activeOpacity={0.7}
          >
            <X size={14} color="#e11d48" />
            <Text className="text-xs font-bold text-rose-600">Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
