import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import {
  Shield,
  X,
  Save,
  Check,
} from "lucide-react-native";
import { PHOTO_VISIBILITY_OPTIONS } from "@everpride/shared";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth.store";

export interface PrivacySafeguardsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacySafeguardsScreen: React.FC<PrivacySafeguardsScreenProps> = ({
  visible,
  onClose,
}) => {
  const { profile, fetchProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [photoVisibility, setPhotoVisibility] = useState<string>(
    profile?.photoVisibility || "MUTUAL_MATCHES_ONLY"
  );
  const [ghostModeEnabled, setGhostModeEnabled] = useState<boolean>(
    Boolean(profile?.ghostModeEnabled)
  );

  useEffect(() => {
    if (visible && profile) {
      setPhotoVisibility(profile.photoVisibility || "MUTUAL_MATCHES_ONLY");
      setGhostModeEnabled(Boolean(profile.ghostModeEnabled));
    }
  }, [visible, profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/profiles/me", {
        photoVisibility,
        ghostModeEnabled,
      });
      await fetchProfile();
      Alert.alert("Success", "Privacy safeguards updated!");
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.response?.data?.message || "Failed to update privacy safeguards"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-50">
        {/* Sticky Header */}
        <View className="h-16 px-4 bg-white border-b border-slate-200 flex-row items-center justify-between z-20">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-xl text-slate-600 active:bg-slate-100"
            >
              <X size={22} color="#475569" />
            </TouchableOpacity>
            <View>
              <Text className="text-base font-black text-slate-900 tracking-tight">
                Privacy Safeguards
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium">
                Controls and visibility of your photos and identity
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm active:scale-95 ${
              saving ? "bg-rose-400" : "bg-rose-600"
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Save size={15} color="#ffffff" />
                <Text className="text-white text-xs font-bold">Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-4">
            <View className="flex-row items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
              <View className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 items-center justify-center">
                <Shield size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Privacy Safeguards
                </Text>
                <Text className="text-[10px] text-slate-400">
                  Controls and visibility of your photos and identity
                </Text>
              </View>
            </View>

            <View className="space-y-2.5">
              {PHOTO_VISIBILITY_OPTIONS.map((tier) => {
                const sel = photoVisibility === tier.id;
                return (
                  <TouchableOpacity
                    key={tier.id}
                    onPress={() => setPhotoVisibility(tier.id)}
                    className={`p-3.5 rounded-xl border ${
                      sel
                        ? "bg-rose-50/50 border-rose-500 shadow-xs"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-xs font-bold ${
                          sel ? "text-rose-950" : "text-slate-900"
                        }`}
                      >
                        {tier.title}
                      </Text>
                      {sel && (
                        <View className="w-4 h-4 rounded-full bg-rose-600 items-center justify-center">
                          <Check size={10} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {tier.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

