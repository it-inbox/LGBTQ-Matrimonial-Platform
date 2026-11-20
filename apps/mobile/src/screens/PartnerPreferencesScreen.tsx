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
  Heart,
  X,
  Save,
} from "lucide-react-native";
import {
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
} from "@everpride/shared";
import { MobileAgeRangeSlider } from "../components/MobileAgeRangeSlider";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth.store";

export interface PartnerPreferencesScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const PartnerPreferencesScreen: React.FC<PartnerPreferencesScreenProps> = ({
  visible,
  onClose,
}) => {
  const { profile, fetchProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [preferredGenders, setPreferredGenders] = useState<string[]>(
    profile?.partnerPreference?.preferredGenders || ["MAN"]
  );
  const [preferredOrientations, setPreferredOrientations] = useState<string[]>(
    profile?.partnerPreference?.preferredOrientations || ["GAY"]
  );
  const [minAge, setMinAge] = useState(
    profile?.partnerPreference?.minAge ?? 21
  );
  const [maxAge, setMaxAge] = useState(
    profile?.partnerPreference?.maxAge ?? 35
  );

  useEffect(() => {
    if (visible && profile) {
      setPreferredGenders(
        profile.partnerPreference?.preferredGenders || ["MAN"]
      );
      setPreferredOrientations(
        profile.partnerPreference?.preferredOrientations || ["GAY"]
      );
      setMinAge(profile.partnerPreference?.minAge ?? 21);
      setMaxAge(profile.partnerPreference?.maxAge ?? 35);
    }
  }, [visible, profile]);

  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (minAge > maxAge) {
      Alert.alert("Invalid", "Minimum age cannot be greater than maximum age.");
      return;
    }

    setSaving(true);
    try {
      const partnerPreference = {
        preferredGenders,
        preferredOrientations,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
      };

      await api.patch("/profiles/me", { partnerPreference });
      await fetchProfile();
      Alert.alert("Success", "Partner preferences updated!");
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.response?.data?.message || "Failed to update partner preferences"
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
                Looking For (Preferences)
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium">
                Select partner preferences to match with the right members
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
              <View className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 items-center justify-center">
                <Heart size={16} color="#e11d48" fill="#e11d48" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Looking For (Preferences)
                </Text>
                <Text className="text-[10px] text-slate-400">
                  Select partner preferences to match with the right members
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              {/* Preferred Gender(s) */}
              <View>
                <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Gender(s) *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {GENDER_OPTIONS.map((g) => {
                    const sel = preferredGenders.includes(g.value);
                    return (
                      <TouchableOpacity
                        key={g.value}
                        onPress={() =>
                          toggleArrayItem(
                            preferredGenders,
                            setPreferredGenders,
                            g.value
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl border ${
                          sel
                            ? "bg-rose-600 border-rose-600"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            sel ? "text-white font-bold" : "text-slate-700 font-medium"
                          }`}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Preferred Orientation(s) */}
              <View className="mt-2">
                <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Orientation(s) *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ORIENTATION_OPTIONS.map((o) => {
                    const sel = preferredOrientations.includes(o.value);
                    return (
                      <TouchableOpacity
                        key={o.value}
                        onPress={() =>
                          toggleArrayItem(
                            preferredOrientations,
                            setPreferredOrientations,
                            o.value
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl border ${
                          sel
                            ? "bg-rose-600 border-rose-600"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            sel ? "text-white font-bold" : "text-slate-700 font-medium"
                          }`}
                        >
                          {o.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Partner Age Range Slider */}
              <View className="pt-3 border-t border-slate-100 mt-2">
                <MobileAgeRangeSlider
                  minAge={minAge}
                  maxAge={maxAge}
                  onChange={(min, max) => {
                    setMinAge(min);
                    setMaxAge(max);
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

