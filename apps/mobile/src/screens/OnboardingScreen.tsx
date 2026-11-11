import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import {
  Heart,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Shield,
  Camera,
  BookOpen,
  Coffee,
  Check,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Plus,
  Trash2,
  Lock,
  X,
  ChevronDown,
  Search,
  UploadCloud,
} from "lucide-react-native";
import {
  ALL_COUNTRIES,
  CountryData,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  OUTNESS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  QUALIFICATION_OPTIONS,
  SECTOR_OPTIONS,
  RELIGION_OPTIONS,
  LANGUAGE_OPTIONS,
  HOBBY_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  PHOTO_VISIBILITY_OPTIONS,
} from "@everpride/shared";
import { getStatesForCountry, getCitiesForState } from "../data/locations";

export interface EducationEntry {
  qualification?: string;
  degree: string;
  degreeName?: string;
  major?: string;
  institution: string;
  year?: number;
}

export interface OnboardingFormData {
  displayName: string;
  dateOfBirth: string;
  heightCm: number;
  nationality: string;
  country: string;
  state: string;
  city: string;
  religion: string;
  languagesSpoken: string[];
  gender: string;
  orientation: string;
  pronouns: string;
  outnessStatus: string;
  maritalStatus: string;
  education: string;
  degree: string;
  educations: EducationEntry[];
  sector: string;
  profession: string;
  photos: string[];
  photoVisibility: "MUTUAL_MATCHES_ONLY" | "REQUEST_REQUIRED" | "ALL_MEMBERS";
  bio: string;
  diet: string;
  drinking: string;
  smoking: string;
  hobbies: string[];
  ghostModeEnabled: boolean;
  preferredGenders: string[];
  preferredOrientations: string[];
  minAge: number;
  maxAge: number;
}

interface OnboardingScreenProps {
  onSuccess: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const { setProfile, fetchProfile, user } = useAuthStore();

  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Single Source of Truth defaults matching Web exactly
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: "",
    dateOfBirth: "1998-05-15",
    heightCm: 170,
    nationality: "India",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    religion: "Hinduism",
    languagesSpoken: ["English"],
    gender: "MAN",
    orientation: "GAY",
    pronouns: "",
    outnessStatus: "OUT_TO_ALL",
    maritalStatus: "Never Married",
    education: "Bachelor's Degree",
    degree: "",
    educations: [
      {
        degree: "Bachelor's Degree",
        degreeName: "",
        major: "",
        institution: "",
      },
    ],
    sector: "Private / IT",
    profession: "",
    photos: [],
    photoVisibility: "MUTUAL_MATCHES_ONLY",
    bio: "",
    diet: "Vegetarian",
    drinking: "Non-drinker",
    smoking: "Non-smoker",
    hobbies: [],
    ghostModeEnabled: false,
    preferredGenders: ["MAN"],
    preferredOrientations: ["GAY"],
    minAge: 21,
    maxAge: 40,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Searchable modal pickers
  const [activeModal, setActiveModal] = useState<"nationality" | "state" | "city" | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const stepTitles = [
    "About You",
    "Identity",
    "Marital Status",
    "Education",
    "Work & Career",
    "Photo Privacy Shield",
    "Upload Photos",
    "Bio / About You",
    "Lifestyle & Habits",
  ];

  const progressPercent = Math.round((step / totalSteps) * 100);

  const availableStates = formData.nationality ? getStatesForCountry(formData.nationality) : [];
  const availableCities =
    formData.nationality && formData.state
      ? getCitiesForState(formData.nationality, formData.state)
      : [];

  const handleChange = (field: keyof OnboardingFormData, value: any) => {
    setErrorMsg(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "languagesSpoken" | "hobbies", value: string) => {
    setErrorMsg(null);
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((x) => x !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...(prev.educations || []),
        { degree: "Bachelor's Degree", degreeName: "", major: "", institution: "" },
      ],
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationEntry, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.educations || [])];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        educations: updated,
        education: updated[0]?.degree || prev.education,
        degree: updated[0]?.degreeName || prev.degree,
      };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.educations || []).filter((_, i) => i !== index);
      return {
        ...prev,
        educations: updated,
        education: updated[0]?.degree || "",
        degree: updated[0]?.degreeName || "",
      };
    });
  };

  const handlePickImage = async () => {
    setErrorMsg(null);
    if (formData.photos.length >= 6) {
      setErrorMsg("Maximum of 6 photos allowed.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        let photoUri = asset.uri;
        if (asset.base64) {
          photoUri = `data:image/jpeg;base64,${asset.base64}`;
        }
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, photoUri],
        }));
      }
    } catch (err: any) {
      setErrorMsg("Failed to pick image: " + (err.message || "Unknown error"));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // STEP VALIDATION
  const validateStep = (): boolean => {
    setErrorMsg(null);

    // Step 1: About You
    if (step === 1) {
      if (!formData.displayName.trim() || formData.displayName.trim().length < 2) {
        setErrorMsg("Display Name must be at least 2 characters.");
        return false;
      }
      if (!formData.dateOfBirth) {
        setErrorMsg("Date of birth is required.");
        return false;
      }
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        setErrorMsg("Please select a valid date of birth (YYYY-MM-DD).");
        return false;
      }
      const ageDiff = Date.now() - dob.getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      if (age < 18) {
        setErrorMsg("You must be at least 18 years old to create a profile.");
        return false;
      }
      if (!formData.nationality.trim()) {
        setErrorMsg("Please select your Nationality.");
        return false;
      }
      if (!formData.state.trim() || !formData.city.trim()) {
        setErrorMsg("Please select your State and City.");
        return false;
      }
    }

    // Step 2: Identity
    if (step === 2) {
      if (!formData.gender) {
        setErrorMsg("Please select your Gender Identity.");
        return false;
      }
      if (!formData.orientation) {
        setErrorMsg("Please select your Sexual Orientation.");
        return false;
      }
      if (!formData.outnessStatus) {
        setErrorMsg("Please select your Outness Status.");
        return false;
      }
    }

    // Step 4: Education
    if (step === 4) {
      for (let i = 0; i < formData.educations.length; i++) {
        if (!formData.educations[i].institution.trim()) {
          setErrorMsg(`Please enter the institution for qualification #${i + 1}`);
          return false;
        }
      }
    }

    return true;
  };

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        displayName: formData.displayName.trim(),
        gender: formData.gender,
        orientation: formData.orientation,
        pronouns: formData.pronouns.trim() || undefined,
        outnessStatus: formData.outnessStatus,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        nationality: formData.nationality.trim() || "India",
        religion: formData.religion.trim() || undefined,
        motherTongue: formData.languagesSpoken[0] || "English",
        languagesSpoken: formData.languagesSpoken,
        maritalStatus: formData.maritalStatus,
        phoneNumber: user?.phoneNumber || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        education: (formData.educations?.[0]?.degree || formData.education || "").trim() || undefined,
        degree: (formData.educations?.[0]?.degreeName || formData.degree || "").trim() || undefined,
        educations: formData.educations
          .filter((e) => e.degree && e.institution.trim())
          .map((e) => ({
            qualification: e.degree.trim(),
            degree: (e.degreeName || e.degree).trim(),
            degreeName: e.degreeName?.trim() || null,
            major: e.major?.trim() || null,
            institution: e.institution.trim(),
            year: e.year ? Number(e.year) : null,
          })),
        sector: formData.sector.trim() || undefined,
        profession: formData.profession.trim() || undefined,
        photos: formData.photos,
        bio: formData.bio.trim() || undefined,
        diet: formData.diet.trim() || undefined,
        drinking: formData.drinking || undefined,
        smoking: formData.smoking || undefined,
        hobbies: formData.hobbies,
        photoVisibility: formData.photoVisibility,
        ghostModeEnabled: formData.ghostModeEnabled,
        partnerPreference: {
          preferredGenders: formData.preferredGenders,
          preferredOrientations: formData.preferredOrientations,
          minAge: Number(formData.minAge),
          maxAge: Number(formData.maxAge),
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
        err.response?.data?.message || "Failed to create profile. Please check your inputs."
      );
    },
  });

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        createProfileMutation.mutate();
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-950 p-4">
      {/* ── HEADER PROGRESS TRACKER ── */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5 flex-1 pr-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              STEP {step} OF {totalSteps}
            </Text>
            <Text className="text-slate-600">•</Text>
            <Text className="text-xs font-bold text-brand-400 truncate flex-1">
              {stepTitles[step - 1]}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs font-bold text-white mr-1">{progressPercent}%</Text>
            <Text className="text-[10px] text-slate-500">Done</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-brand-600 to-pink-500 rounded-full"
          />
        </View>
      </View>

      {/* ── ERROR NOTICE ── */}
      {errorMsg && (
        <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4 flex-row items-center">
          <Text className="text-rose-400 text-xs font-medium flex-1">{errorMsg}</Text>
        </View>
      )}

      {/* ── MAIN CARD STEP VIEW ── */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
        {/* ── STEP 1: ABOUT YOU ── */}
        {step === 1 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-brand-500/10 items-center justify-center border border-brand-500/30">
                <User size={20} color="#f43f5e" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">About You</Text>
                <Text className="text-slate-400 text-xs">Basic details to establish your profile.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-300 text-xs font-semibold mb-1">
                Display Name <Text className="text-rose-500">*</Text>
              </Text>
              <TextInput
                value={formData.displayName}
                onChangeText={(val) => handleChange("displayName", val)}
                className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                placeholder="e.g. Steve or your chosen alias"
                placeholderTextColor="#64748b"
              />
              <Text className="text-[10px] text-slate-500 mt-1">
                You can use a chosen name or alias to protect your privacy.
              </Text>
            </View>

            {/* Date of Birth */}
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">
                  Date of Birth <Text className="text-rose-500">*</Text>
                </Text>
                {Platform.OS === "web" ? (
                  // @ts-ignore
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e: any) => handleChange("dateOfBirth", e.target.value)}
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#ffffff",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                      fontSize: "14px",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                ) : (
                  <TextInput
                    value={formData.dateOfBirth}
                    onChangeText={(val) => handleChange("dateOfBirth", val)}
                    className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#64748b"
                  />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">Height (cm)</Text>
                <TextInput
                  value={String(formData.heightCm || 170)}
                  onChangeText={(val) => handleChange("heightCm", parseInt(val, 10) || 170)}
                  keyboardType="numeric"
                  className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                  placeholder="170"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {/* Nationality, State, City Cascading Selectors */}
            <View className="mt-3">
              <Text className="text-slate-300 text-xs font-semibold mb-1">
                Nationality <Text className="text-rose-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchFilter("");
                  setActiveModal("nationality");
                }}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex-row items-center justify-between"
              >
                <Text className="text-white text-sm font-medium">
                  {formData.nationality || "Select Nationality"}
                </Text>
                <ChevronDown size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">
                  State / Province <Text className="text-rose-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchFilter("");
                    setActiveModal("state");
                  }}
                  className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex-row items-center justify-between"
                >
                  <Text className="text-white text-xs font-medium truncate flex-1 pr-1">
                    {formData.state || "Select State"}
                  </Text>
                  <ChevronDown size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">
                  City <Text className="text-rose-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchFilter("");
                    setActiveModal("city");
                  }}
                  className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex-row items-center justify-between"
                >
                  <Text className="text-white text-xs font-medium truncate flex-1 pr-1">
                    {formData.city || "Select City"}
                  </Text>
                  <ChevronDown size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Religion from Shared Single Source */}
            <View className="mt-4">
              <Text className="text-slate-300 text-xs font-semibold mb-1.5">
                Religion / Belief
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {RELIGION_OPTIONS.map((rel) => {
                  const sel = formData.religion === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => handleChange("religion", rel)}
                      className={`px-3 py-1.5 rounded-full border ${
                        sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Languages Spoken (Scrollable Container with No Clipping) */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-slate-300 text-xs font-semibold">Languages Spoken</Text>
                <Text className="text-brand-400 text-[10px] font-bold">
                  {formData.languagesSpoken.length} selected
                </Text>
              </View>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: 220 }}
                className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60"
              >
                <View className="flex-row flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const sel = formData.languagesSpoken.includes(lang);
                    return (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => toggleArrayItem("languagesSpoken", lang)}
                        className={`px-3 py-1.5 rounded-full border ${
                          sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                          {lang}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* ── STEP 2: IDENTITY ── */}
        {step === 2 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-pink-500/10 items-center justify-center border border-pink-500/30">
                <Sparkles size={20} color="#ec4899" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Identity & Affirmation</Text>
                <Text className="text-slate-400 text-xs">Affirm your authentic gender and orientation.</Text>
              </View>
            </View>

            {/* Gender Identity (Includes Agender, Other, etc. from Shared) */}
            <View className="mt-2">
              <Text className="text-slate-300 text-xs font-semibold mb-2">
                Gender Identity <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const sel = formData.gender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => handleChange("gender", g.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sexual Orientation (Includes Demisexual, Other, etc. from Shared) */}
            <View className="mt-4">
              <Text className="text-slate-300 text-xs font-semibold mb-2">
                Sexual / Romantic Orientation <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((o) => {
                  const sel = formData.orientation === o.value;
                  return (
                    <TouchableOpacity
                      key={o.value}
                      onPress={() => handleChange("orientation", o.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                        {o.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Pronouns */}
            <View className="mt-4">
              <Text className="text-slate-300 text-xs font-semibold mb-1">Pronouns</Text>
              <TextInput
                value={formData.pronouns}
                onChangeText={(val) => handleChange("pronouns", val)}
                className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                placeholder="e.g. he/him, they/them, she/her"
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Outness Status */}
            <View className="mt-4">
              <Text className="text-slate-300 text-xs font-semibold mb-2">
                Outness Status <Text className="text-rose-500">*</Text>
              </Text>
              <View className="space-y-2">
                {OUTNESS_OPTIONS.map((out) => {
                  const sel = formData.outnessStatus === out.id;
                  return (
                    <TouchableOpacity
                      key={out.id}
                      onPress={() => handleChange("outnessStatus", out.id)}
                      className={`p-3 rounded-xl border flex-row items-center justify-between ${
                        sel ? "bg-brand-600/20 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-brand-300 font-bold" : "text-slate-300"}`}>
                        {out.label}
                      </Text>
                      {sel && <Check size={16} color="#f43f5e" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 3: MARITAL STATUS ── */}
        {step === 3 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center border border-amber-500/30">
                <Heart size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Marital Status</Text>
                <Text className="text-slate-400 text-xs">Your current legal/marital background.</Text>
              </View>
            </View>

            <View className="space-y-2.5 mt-2">
              {MARITAL_STATUS_OPTIONS.map((ms) => {
                const sel = formData.maritalStatus === ms.id;
                return (
                  <TouchableOpacity
                    key={ms.id}
                    onPress={() => handleChange("maritalStatus", ms.id)}
                    className={`p-4 rounded-xl border ${
                      sel ? "bg-brand-600/20 border-brand-500" : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-sm font-bold ${sel ? "text-brand-300" : "text-white"}`}>
                        {ms.id}
                      </Text>
                      {sel && <Check size={18} color="#f43f5e" />}
                    </View>
                    <Text className="text-slate-400 text-xs mt-1">{ms.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 4: EDUCATION ── */}
        {step === 4 && (
          <View className="space-y-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-indigo-500/10 items-center justify-center border border-indigo-500/30">
                  <GraduationCap size={20} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">Education</Text>
                  <Text className="text-slate-400 text-xs">Degrees and institutions attended.</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAddEducation}
                className="bg-brand-600/20 border border-brand-500/40 px-3 py-1.5 rounded-xl flex-row items-center"
              >
                <Plus size={14} color="#f43f5e" />
                <Text className="text-brand-400 text-xs font-bold ml-1">Add</Text>
              </TouchableOpacity>
            </View>

            {formData.educations.map((edu, idx) => (
              <View
                key={idx}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-3 mt-2"
              >
                <View className="flex-row items-center justify-between pb-1 border-b border-slate-700">
                  <Text className="text-slate-300 text-xs font-bold">
                    Qualification #{idx + 1}
                  </Text>
                  {formData.educations.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                      <Trash2 size={16} color="#f43f5e" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Qualification Options from Shared */}
                <View>
                  <Text className="text-slate-400 text-[11px] mb-1">Qualification Level</Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {QUALIFICATION_OPTIONS.map((deg) => {
                      const sel = edu.degree === deg;
                      return (
                        <TouchableOpacity
                          key={deg}
                          onPress={() => handleUpdateEducation(idx, "degree", deg)}
                          className={`px-2.5 py-1 rounded-lg border ${
                            sel ? "bg-brand-600 border-brand-500" : "bg-slate-700 border-slate-600"
                          }`}
                        >
                          <Text className={`text-[11px] ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                            {deg}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text className="text-slate-400 text-[11px] mb-1">Institution / University *</Text>
                  <TextInput
                    value={edu.institution}
                    onChangeText={(val) => handleUpdateEducation(idx, "institution", val)}
                    className="bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 text-xs"
                    placeholder="e.g. Stanford University, IIT Bombay"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[11px] mb-1">Degree Name</Text>
                    <TextInput
                      value={edu.degreeName || ""}
                      onChangeText={(val) => handleUpdateEducation(idx, "degreeName", val)}
                      className="bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 text-xs"
                      placeholder="e.g. B.Tech, MBA"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[11px] mb-1">Major / Field</Text>
                    <TextInput
                      value={edu.major || ""}
                      onChangeText={(val) => handleUpdateEducation(idx, "major", val)}
                      className="bg-slate-900 text-white p-2.5 rounded-lg border border-slate-700 text-xs"
                      placeholder="e.g. Computer Science"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── STEP 5: WORK & CAREER ── */}
        {step === 5 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center border border-blue-500/30">
                <Briefcase size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Work & Career</Text>
                <Text className="text-slate-400 text-xs">Your professional occupation and sector.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-300 text-xs font-semibold mb-1">Job Title / Profession</Text>
              <TextInput
                value={formData.profession}
                onChangeText={(val) => handleChange("profession", val)}
                className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                placeholder="e.g. Senior Software Engineer, Architect, Doctor"
                placeholderTextColor="#64748b"
              />
            </View>

            <View className="mt-4">
              <Text className="text-slate-300 text-xs font-semibold mb-2">Industry Sector</Text>
              <View className="flex-row flex-wrap gap-2">
                {SECTOR_OPTIONS.map((sec) => {
                  const sel = formData.sector === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      onPress={() => handleChange("sector", sec)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                        {sec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 6: PHOTO PRIVACY SHIELD ── */}
        {step === 6 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-brand-500/10 items-center justify-center border border-brand-500/30">
                <Shield size={20} color="#f43f5e" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Photo Privacy Shield</Text>
                <Text className="text-slate-400 text-xs">Choose who can view your clear photos.</Text>
              </View>
            </View>

            {/* Simulated Live Preview Card */}
            <View className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-row items-center gap-4 mt-2">
              <View className="w-24 h-32 rounded-xl overflow-hidden bg-slate-800 relative justify-center items-center">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                  }}
                  className={`w-full h-full ${
                    formData.photoVisibility !== "ALL_MEMBERS" ? "blur-md opacity-40" : ""
                  }`}
                  contentFit="cover"
                />
                {formData.photoVisibility !== "ALL_MEMBERS" && (
                  <View className="absolute items-center">
                    <Lock size={18} color="#f43f5e" />
                    <Text className="text-white text-[10px] font-bold mt-1">Shielded</Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  Live Preview
                </Text>
                <Text className="text-white text-sm font-bold mt-1">
                  {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" && "Mutual Matches Only"}
                  {formData.photoVisibility === "REQUEST_REQUIRED" && "Require My Approval"}
                  {formData.photoVisibility === "ALL_MEMBERS" && "Visible to All Members"}
                </Text>
                <Text className="text-slate-400 text-xs mt-1 leading-4">
                  {formData.photoVisibility === "MUTUAL_MATCHES_ONLY" &&
                    "Photos stay blurred until both of you send or accept mutual interest."}
                  {formData.photoVisibility === "REQUEST_REQUIRED" &&
                    "Photos stay locked. Members must send an explicit photo unlock request."}
                  {formData.photoVisibility === "ALL_MEMBERS" &&
                    "Photos are visible to all verified community members right away."}
                </Text>
              </View>
            </View>

            {/* Privacy Shield Options */}
            <View className="space-y-2.5 mt-3">
              {PHOTO_VISIBILITY_OPTIONS.map((opt) => {
                const sel = formData.photoVisibility === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => handleChange("photoVisibility", opt.id)}
                    className={`p-3.5 rounded-xl border ${
                      sel ? "bg-brand-600/20 border-brand-500" : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-xs font-bold ${sel ? "text-brand-300" : "text-white"}`}>
                          {opt.title}
                        </Text>
                        <View className="bg-brand-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-brand-400 text-[10px] font-bold">{opt.badge}</Text>
                        </View>
                      </View>
                      {sel && <Check size={16} color="#f43f5e" />}
                    </View>
                    <Text className="text-slate-400 text-xs mt-1">{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 7: UPLOAD PHOTOS ── */}
        {step === 7 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center border border-emerald-500/30">
                <Camera size={20} color="#10b981" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Profile Photos</Text>
                <Text className="text-slate-400 text-xs">Upload photos directly from your device.</Text>
              </View>
            </View>

            {/* Photo Grid */}
            <View className="flex-row flex-wrap gap-2.5 mt-2">
              {formData.photos.map((url, idx) => (
                <View key={idx} className="w-24 h-28 rounded-xl overflow-hidden bg-slate-800 relative border border-slate-700">
                  <Image source={{ uri: url }} className="w-full h-full" contentFit="cover" />
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
                  >
                    <X size={12} color="#ffffff" />
                  </TouchableOpacity>
                  {idx === 0 && (
                    <View className="absolute bottom-1 left-1 bg-brand-600 px-1.5 py-0.5 rounded-full">
                      <Text className="text-white text-[9px] font-bold">Primary</Text>
                    </View>
                  )}
                </View>
              ))}

              {formData.photos.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="w-24 h-28 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 items-center justify-center p-2"
                >
                  <UploadCloud size={24} color="#f43f5e" />
                  <Text className="text-white text-[10px] font-bold mt-1.5 text-center">
                    + Upload Photo
                  </Text>
                  <Text className="text-slate-500 text-[8px] mt-0.5">Device Gallery</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-[11px] text-slate-500 mt-1">
              Upload up to 6 pictures. Your photos will be protected according to your Privacy Shield.
            </Text>
          </View>
        )}

        {/* ── STEP 8: BIO ── */}
        {step === 8 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-indigo-500/10 items-center justify-center border border-indigo-500/30">
                <BookOpen size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Your Bio / About You</Text>
                <Text className="text-slate-400 text-xs">Introduce yourself to prospective partners.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-300 text-xs font-semibold mb-1">About Yourself & Life Goals</Text>
              <TextInput
                value={formData.bio}
                onChangeText={(val) => handleChange("bio", val)}
                multiline
                numberOfLines={5}
                className="bg-slate-800 text-white p-3.5 rounded-xl border border-slate-700 text-sm h-32 leading-5"
                placeholder="Share your values, personality, passions, and what kind of life partner you hope to build a future with..."
                placeholderTextColor="#64748b"
              />
              <Text className="text-[10px] text-slate-500 mt-1">
                Tip: Profiles with thoughtful bios receive 3x more meaningful mutual matches.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 9: LIFESTYLE & HABITS ── */}
        {step === 9 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center border border-orange-500/30">
                <Coffee size={20} color="#f97316" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Lifestyle & Habits</Text>
                <Text className="text-slate-400 text-xs">Dietary preferences, hobbies, and interests.</Text>
              </View>
            </View>

            {/* Diet */}
            <View className="mt-2">
              <Text className="text-slate-300 text-xs font-semibold mb-2">Dietary Preference</Text>
              <View className="flex-row flex-wrap gap-2">
                {DIET_OPTIONS.map((d) => {
                  const sel = formData.diet === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => handleChange("diet", d)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Drinking & Smoking */}
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">Drinking</Text>
                <View className="space-y-1.5">
                  {DRINKING_OPTIONS.map((dr) => {
                    const sel = formData.drinking === dr.id;
                    return (
                      <TouchableOpacity
                        key={dr.id}
                        onPress={() => handleChange("drinking", dr.id)}
                        className={`p-2 rounded-lg border ${
                          sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text className={`text-[11px] ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                          {dr.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-semibold mb-1">Smoking</Text>
                <View className="space-y-1.5">
                  {SMOKING_OPTIONS.map((sm) => {
                    const sel = formData.smoking === sm.id;
                    return (
                      <TouchableOpacity
                        key={sm.id}
                        onPress={() => handleChange("smoking", sm.id)}
                        className={`p-2 rounded-lg border ${
                          sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text className={`text-[11px] ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                          {sm.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Hobbies (Scrollable Container with No Clipping) */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-300 text-xs font-semibold">Hobbies & Interests</Text>
                <Text className="text-[10px] text-brand-400 font-bold">
                  {formData.hobbies.length} selected
                </Text>
              </View>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: 240 }}
                className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60"
              >
                <View className="flex-row flex-wrap gap-1.5">
                  {HOBBY_OPTIONS.map((hobby) => {
                    const sel = formData.hobbies.includes(hobby);
                    return (
                      <TouchableOpacity
                        key={hobby}
                        onPress={() => toggleArrayItem("hobbies", hobby)}
                        className={`px-3 py-1.5 rounded-full border ${
                          sel ? "bg-brand-600 border-brand-500" : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-300"}`}>
                          {hobby}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      {/* ── NAVIGATION BUTTONS ── */}
      <View className="flex-row items-center justify-between gap-3 mb-6">
        {step > 1 ? (
          <TouchableOpacity
            onPress={handleBack}
            className="bg-slate-800 border border-slate-700 px-5 py-3.5 rounded-xl flex-row items-center"
          >
            <ArrowLeft size={16} color="#cbd5e1" />
            <Text className="text-slate-200 text-xs font-bold ml-2">Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={createProfileMutation.isPending}
          className="bg-brand-600 px-6 py-3.5 rounded-xl flex-row items-center justify-center flex-1 ml-auto max-w-[240px]"
        >
          {createProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text className="text-white text-xs font-bold mr-2">
                {step === totalSteps ? "Complete Profile" : "Next Step"}
              </Text>
              {step === totalSteps ? (
                <UserCheck size={16} color="#ffffff" />
              ) : (
                <ArrowRight size={16} color="#ffffff" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Cascading Location Picker Modal (Nationality, State, City) */}
      <Modal visible={activeModal !== null} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
              <Text className="text-white font-bold text-base capitalize">
                Select {activeModal}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Search Filter */}
            <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 my-3 border border-slate-700">
              <Search size={16} color="#64748b" />
              <TextInput
                value={searchFilter}
                onChangeText={setSearchFilter}
                placeholder={`Search ${activeModal}...`}
                placeholderTextColor="#64748b"
                className="flex-1 text-white text-xs ml-2"
              />
            </View>

            <ScrollView className="space-y-1">
              {activeModal === "nationality" &&
                ALL_COUNTRIES
                  .filter((c) =>
                    c.name.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => {
                        handleChange("nationality", c.name);
                        handleChange("country", c.name);
                        handleChange("state", "");
                        handleChange("city", "");
                        setActiveModal(null);
                      }}
                      className={`p-3 rounded-xl flex-row items-center justify-between ${
                        formData.nationality === c.name
                          ? "bg-brand-600/20 border border-brand-500/40"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <Text className="text-white text-xs font-medium">{c.name}</Text>
                      {formData.nationality === c.name && <Check size={16} color="#f43f5e" />}
                    </TouchableOpacity>
                  ))}

              {activeModal === "state" &&
                availableStates
                  .filter((st) => st.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        handleChange("state", st);
                        handleChange("city", "");
                        setActiveModal(null);
                      }}
                      className={`p-3 rounded-xl flex-row items-center justify-between ${
                        formData.state === st
                          ? "bg-brand-600/20 border border-brand-500/40"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <Text className="text-white text-xs font-medium">{st}</Text>
                      {formData.state === st && <Check size={16} color="#f43f5e" />}
                    </TouchableOpacity>
                  ))}

              {activeModal === "city" &&
                availableCities
                  .filter((ct) => ct.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((ct) => (
                    <TouchableOpacity
                      key={ct}
                      onPress={() => {
                        handleChange("city", ct);
                        setActiveModal(null);
                      }}
                      className={`p-3 rounded-xl flex-row items-center justify-between ${
                        formData.city === ct
                          ? "bg-brand-600/20 border border-brand-500/40"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <Text className="text-white text-xs font-medium">{ct}</Text>
                      {formData.city === ct && <Check size={16} color="#f43f5e" />}
                    </TouchableOpacity>
                  ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
