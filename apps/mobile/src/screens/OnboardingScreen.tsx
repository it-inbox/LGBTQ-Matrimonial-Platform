import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import { Heart, Sparkles, User, MapPin, Briefcase } from "lucide-react-native";

interface OnboardingScreenProps {
  onSuccess: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const { setProfile, fetchProfile } = useAuthStore();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<"MAN" | "WOMAN" | "NON_BINARY" | "TRANSGENDER_MAN" | "TRANSGENDER_WOMAN">("MAN");
  const [orientation, setOrientation] = useState<"GAY" | "LESBIAN" | "BISEXUAL" | "PANSEXUAL" | "ASEXUAL" | "QUEER" | "OTHER">("GAY");
  const [dob, setDob] = useState("1998-05-15");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [profession, setProfession] = useState("Software Professional");
  const [bio, setBio] = useState("Looking for meaningful connections.");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        displayName: displayName.trim(),
        gender,
        orientation,
        outnessStatus: "OUT_TO_ALL",
        dateOfBirth: new Date(dob).toISOString(),
        city: city.trim(),
        state: stateName.trim(),
        country: "India",
        profession: profession.trim(),
        bio: bio.trim(),
        photoVisibility: "ALL_MEMBERS",
        partnerPreference: {
          preferredGenders: [gender],
          preferredOrientations: [orientation],
          minAge: 21,
          maxAge: 35,
        },
      };
      const res = await api.post("/profiles", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setProfile(data);
      fetchProfile();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesFeed(1) });
      onSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || "Failed to create profile. Please check the details."
      );
    },
  });

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!displayName.trim() || displayName.length < 2) {
        setErrorMsg("Please enter your display name (min 2 characters).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!city.trim() || !stateName.trim()) {
        setErrorMsg("Please enter your city and state.");
        return;
      }
      createProfileMutation.mutate();
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-950 p-6 justify-center">
      {/* Brand Header */}
      <View className="items-center mb-6">
        <View className="w-14 h-14 rounded-full bg-brand-600/20 items-center justify-center border border-brand-500/30 mb-2">
          <Heart size={28} color="#f43f5e" fill="#f43f5e" />
        </View>
        <Text className="text-2xl font-extrabold text-white">Create Your Profile</Text>
        <Text className="text-slate-400 text-xs mt-1 text-center">
          Step {step} of 2 • Let's setup your member card
        </Text>
      </View>

      {errorMsg && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
          <Text className="text-red-400 text-xs text-center">{errorMsg}</Text>
        </View>
      )}

      {/* Form Container */}
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        {step === 1 ? (
          <View>
            {/* Display Name */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Alex"
              placeholderTextColor="#64748b"
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* Gender Selection */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">Gender</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(["MAN", "WOMAN", "NON_BINARY"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`px-3 py-2 rounded-xl border ${
                    gender === g
                      ? "bg-brand-600 border-brand-500"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <Text className={`text-xs font-medium ${gender === g ? "text-white" : "text-slate-300"}`}>
                    {g.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Orientation Selection */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">Orientation</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(["GAY", "LESBIAN", "BISEXUAL", "QUEER", "OTHER"] as const).map((o) => (
                <TouchableOpacity
                  key={o}
                  onPress={() => setOrientation(o)}
                  className={`px-3 py-2 rounded-xl border ${
                    orientation === o
                      ? "bg-brand-600 border-brand-500"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <Text className={`text-xs font-medium ${orientation === o ? "text-white" : "text-slate-300"}`}>
                    {o}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date of Birth */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="1998-05-15"
              placeholderTextColor="#64748b"
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-2"
            />
          </View>
        ) : (
          <View>
            {/* City */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#64748b"
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* State */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">State</Text>
            <TextInput
              value={stateName}
              onChangeText={setStateName}
              placeholder="e.g. Maharashtra"
              placeholderTextColor="#64748b"
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* Profession */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">Profession</Text>
            <TextInput
              value={profession}
              onChangeText={setProfession}
              placeholder="e.g. Graphic Designer"
              placeholderTextColor="#64748b"
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* About / Bio */}
            <Text className="text-slate-300 text-xs font-semibold mb-1.5">About You</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A few words about yourself..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-2 h-20"
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-6">
          {step === 2 && (
            <TouchableOpacity
              onPress={() => setStep(1)}
              className="flex-1 py-3.5 bg-slate-800 rounded-xl items-center"
            >
              <Text className="text-slate-300 font-semibold text-sm">Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={createProfileMutation.isPending}
            className="flex-1 py-3.5 bg-brand-600 rounded-xl items-center flex-row justify-center"
          >
            {createProfileMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-sm">
                {step === 1 ? "Next Step" : "Complete Profile"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
