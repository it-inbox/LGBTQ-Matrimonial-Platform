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
  Sliders,
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
  const totalSteps = 10;

  // Single Source of Truth defaults matching Web exactly
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: "",
    dateOfBirth: "2000-01-01",
    heightCm: 170,
    nationality: "",
    country: "",
    state: "",
    city: "",
    religion: "",
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
    minAge: 22,
    maxAge: 32,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Searchable modal pickers
  const [activeModal, setActiveModal] = useState<"nationality" | "state" | "city" | "religion" | "language" | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const stepTitles = [
    "Looking For",
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

  const ageOptions = [
    ...Array.from({ length: 23 }, (_, i) => ({ value: 18 + i, label: `${18 + i}` })),
    { value: 41, label: "40+" },
  ];

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

  const togglePreferenceGender = (gVal: string) => {
    setErrorMsg(null);
    setFormData((prev) => {
      const current = prev.preferredGenders;
      if (current.includes(gVal)) {
        if (current.length === 1) return prev; // Keep at least one selected
        return { ...prev, preferredGenders: current.filter((x) => x !== gVal) };
      } else {
        return { ...prev, preferredGenders: [...current, gVal] };
      }
    });
  };

  const togglePreferenceOrientation = (oVal: string) => {
    setErrorMsg(null);
    setFormData((prev) => {
      const current = prev.preferredOrientations;
      if (current.includes(oVal)) {
        if (current.length === 1) return prev; // Keep at least one selected
        return { ...prev, preferredOrientations: current.filter((x) => x !== oVal) };
      } else {
        return { ...prev, preferredOrientations: [...current, oVal] };
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

    // Step 1: Looking For (Partner Preferences)
    if (step === 1) {
      if (!formData.preferredGenders || formData.preferredGenders.length === 0) {
        setErrorMsg("Please select at least one gender preference.");
        return false;
      }
      if (!formData.preferredOrientations || formData.preferredOrientations.length === 0) {
        setErrorMsg("Please select at least one orientation preference.");
        return false;
      }
      if (formData.minAge > formData.maxAge) {
        setErrorMsg("Minimum age cannot be greater than maximum age.");
        return false;
      }
    }

    // Step 2: About You
    if (step === 2) {
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

    // Step 3: Identity
    if (step === 3) {
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

    // Step 5: Education (optional / skippable - only validate non-empty rows)
    if (step === 5) {
      for (let i = 0; i < formData.educations.length; i++) {
        const edu = formData.educations[i];
        if (formData.educations.length > 1 && !edu.institution.trim()) {
          setErrorMsg(`Please enter the institution for qualification #${i + 1} or remove it.`);
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50 p-4">
      {/* ── HEADER PROGRESS TRACKER ── */}
      <View className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5 flex-1 pr-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              STEP {step} OF {totalSteps}
            </Text>
            <Text className="text-slate-300">•</Text>
            <Text className="text-xs font-bold text-rose-600 truncate flex-1">
              {stepTitles[step - 1]}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs font-bold text-slate-800 mr-1">{progressPercent}%</Text>
            <Text className="text-[10px] text-slate-400">Done</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-rose-600 rounded-full"
          />
        </View>
      </View>

      {/* ── ERROR NOTICE ── */}
      {errorMsg && (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex-row items-center">
          <Text className="text-rose-700 text-xs font-medium flex-1">{errorMsg}</Text>
        </View>
      )}

      {/* ── MAIN CARD STEP VIEW ── */}
      <View className="bg-white border border-slate-200/90 rounded-2xl p-5 mb-4 shadow-sm">
        {/* ── STEP 1: LOOKING FOR (PARTNER PREFERENCES) ── */}
        {step === 1 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center border border-rose-200">
                <Sliders size={20} color="#e11d48" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Looking For</Text>
                <Text className="text-slate-500 text-xs">Tell us about your ideal match.</Text>
              </View>
            </View>

            {/* I'm looking for a (Genders) */}
            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                I'M LOOKING FOR A <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const sel = formData.preferredGenders.includes(g.value);
                  return (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => togglePreferenceGender(g.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
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

            {/* Orientation */}
            <View className="mt-3">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                ORIENTATION <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((o) => {
                  const sel = formData.preferredOrientations.includes(o.value);
                  return (
                    <TouchableOpacity
                      key={o.value}
                      onPress={() => togglePreferenceOrientation(o.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
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

            {/* Aged (Min Age & Max Age) */}
            <View className="mt-3">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                AGED
              </Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text className="text-slate-500 text-[10px] mb-1 font-bold uppercase tracking-wider">MINIMUM AGE</Text>
                  <TextInput
                    value={String(formData.minAge)}
                    onChangeText={(val) => handleChange("minAge", parseInt(val, 10) || 18)}
                    keyboardType="numeric"
                    className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm font-semibold text-center"
                    placeholder="18"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <Text className="text-slate-400 font-bold mt-4">to</Text>

                <View className="flex-1">
                  <Text className="text-slate-500 text-[10px] mb-1 font-bold uppercase tracking-wider">MAXIMUM AGE</Text>
                  <TextInput
                    value={String(formData.maxAge)}
                    onChangeText={(val) => handleChange("maxAge", parseInt(val, 10) || 40)}
                    keyboardType="numeric"
                    className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm font-semibold text-center"
                    placeholder="40"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 2: ABOUT YOU ── */}
        {step === 2 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center border border-rose-200">
                <User size={20} color="#e11d48" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">About You</Text>
                <Text className="text-slate-500 text-xs">Basic details to establish your profile.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                NAME <Text className="text-rose-500">*</Text>
              </Text>
              <TextInput
                value={formData.displayName}
                onChangeText={(val) => handleChange("displayName", val)}
                className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm"
                placeholder="e.g. Steve or your chosen alias"
                placeholderTextColor="#94a3b8"
              />
              <Text className="text-[10px] text-slate-400 mt-1">
                You can use a chosen name or alias to protect your privacy.
              </Text>
            </View>

            {/* Date of Birth */}
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  DATE OF BIRTH <Text className="text-rose-500">*</Text>
                </Text>
                {Platform.OS === "web" ? (
                  // @ts-ignore
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e: any) => handleChange("dateOfBirth", e.target.value)}
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#0f172a",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                ) : (
                  <TextInput
                    value={formData.dateOfBirth}
                    onChangeText={(val) => handleChange("dateOfBirth", val)}
                    className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">HEIGHT (CM)</Text>
                <TextInput
                  value={String(formData.heightCm || 170)}
                  onChangeText={(val) => handleChange("heightCm", parseInt(val, 10) || 170)}
                  keyboardType="numeric"
                  className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm"
                  placeholder="170"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* 2x2 Layout: Nationality & State, City & Religion */}
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  NATIONALITY <Text className="text-rose-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchFilter("");
                    setActiveModal("nationality");
                  }}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
                >
                  <Text className="text-slate-900 text-xs font-medium truncate flex-1 pr-1">
                    {formData.nationality || "Select"}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  STATE / PROVINCE <Text className="text-rose-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!formData.nationality) {
                      setErrorMsg("Please select Nationality first.");
                      return;
                    }
                    setSearchFilter("");
                    setActiveModal("state");
                  }}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
                >
                  <Text className="text-slate-900 text-xs font-medium truncate flex-1 pr-1">
                    {formData.state || "Select"}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  CITY <Text className="text-rose-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!formData.state) {
                      setErrorMsg("Please select State first.");
                      return;
                    }
                    setSearchFilter("");
                    setActiveModal("city");
                  }}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
                >
                  <Text className="text-slate-900 text-xs font-medium truncate flex-1 pr-1">
                    {formData.city || "Select"}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  RELIGION / BELIEF
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchFilter("");
                    setActiveModal("religion");
                  }}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
                >
                  <Text className="text-slate-900 text-xs font-medium truncate flex-1 pr-1">
                    {formData.religion || "Select"}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Languages Spoken (Can select multiple) Dropdown */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                  LANGUAGES SPOKEN (CAN SELECT MULTIPLE)
                </Text>
                {formData.languagesSpoken.length > 0 && (
                  <Text className="text-rose-600 text-[10px] font-bold">
                    {formData.languagesSpoken.length} selected
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchFilter("");
                  setActiveModal("language");
                }}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-row items-center justify-between"
              >
                <Text className="text-slate-900 text-xs font-medium truncate flex-1 pr-1">
                  {formData.languagesSpoken.length > 0
                    ? formData.languagesSpoken.join(", ")
                    : "Select languages"}
                </Text>
                <ChevronDown size={14} color="#64748b" />
              </TouchableOpacity>
              {/* Selected Pills under the dropdown for quick removal without scrolling */}
              {formData.languagesSpoken.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mt-2">
                  {formData.languagesSpoken.map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => toggleArrayItem("languagesSpoken", lang)}
                      className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex-row items-center"
                    >
                      <Text className="text-rose-700 text-[11px] font-semibold mr-1">{lang}</Text>
                      <X size={12} color="#e11d48" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── STEP 3: IDENTITY ── */}
        {step === 3 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-pink-50 items-center justify-center border border-pink-200">
                <Sparkles size={20} color="#ec4899" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Identity & Affirmation</Text>
                <Text className="text-slate-500 text-xs">Affirm your authentic gender and orientation.</Text>
              </View>
            </View>

            {/* Gender Identity */}
            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                GENDER IDENTITY <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const sel = formData.gender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => handleChange("gender", g.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sexual Orientation */}
            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                SEXUAL ORIENTATION <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((o) => {
                  const sel = formData.orientation === o.value;
                  return (
                    <TouchableOpacity
                      key={o.value}
                      onPress={() => handleChange("orientation", o.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
                        {o.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Pronouns */}
            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">PRONOUNS</Text>
              <TextInput
                value={formData.pronouns}
                onChangeText={(val) => handleChange("pronouns", val)}
                className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm"
                placeholder="e.g. he/him, she/her, they/them"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Outness Status */}
            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                OUTNESS STATUS <Text className="text-rose-500">*</Text>
              </Text>
              <View className="space-y-2">
                {OUTNESS_OPTIONS.map((out) => {
                  const sel = formData.outnessStatus === out.id;
                  return (
                    <TouchableOpacity
                      key={out.id}
                      onPress={() => handleChange("outnessStatus", out.id)}
                      className={`p-3 rounded-xl border flex-row items-center justify-between ${
                        sel ? "bg-rose-50 border-rose-500" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-rose-700 font-bold" : "text-slate-700"}`}>
                        {out.label}
                      </Text>
                      {sel && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 4: MARITAL STATUS ── */}
        {step === 4 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center border border-purple-200">
                <Heart size={20} color="#a855f7" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Marital Status</Text>
                <Text className="text-slate-500 text-xs">Your current relationship legal/ritual status.</Text>
              </View>
            </View>

            <View className="space-y-2 mt-2">
              {MARITAL_STATUS_OPTIONS.map((ms) => {
                const sel = formData.maritalStatus === ms.id;
                return (
                  <TouchableOpacity
                    key={ms.id}
                    onPress={() => handleChange("maritalStatus", ms.id)}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                      sel ? "bg-rose-50 border-rose-500" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className={`text-sm font-bold ${sel ? "text-rose-700" : "text-slate-900"}`}>
                        {ms.id}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">{ms.desc}</Text>
                    </View>
                    {sel && <Check size={18} color="#e11d48" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 5: EDUCATION ── */}
        {step === 5 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center border border-blue-200">
                <GraduationCap size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Education Details</Text>
                <Text className="text-slate-500 text-xs">Add your academic background.</Text>
              </View>
            </View>

            {formData.educations?.map((edu, idx) => (
              <View key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-slate-800 text-xs font-bold">Qualification #{idx + 1}</Text>
                  {formData.educations.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Qualification Level */}
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  QUALIFICATION LEVEL <Text className="text-rose-500">*</Text>
                </Text>
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {QUALIFICATION_OPTIONS.map((q) => {
                    const sel = edu.degree === q;
                    return (
                      <TouchableOpacity
                        key={q}
                        onPress={() => handleUpdateEducation(idx, "degree", q)}
                        className={`px-2.5 py-1.5 rounded-lg border ${
                          sel ? "bg-rose-600 border-rose-600" : "bg-white border-slate-200"
                        }`}
                      >
                        <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
                          {q}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {edu.degree !== "High School" && (
                  <>
                    <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                      DEGREE NAME <Text className="text-rose-500">*</Text>
                    </Text>
                    <TextInput
                      value={edu.degreeName || ""}
                      onChangeText={(val) => handleUpdateEducation(idx, "degreeName", val)}
                      className="bg-white text-slate-900 p-2.5 rounded-lg border border-slate-200 text-xs mb-2.5"
                      placeholder="e.g. B.Tech, MBA, MBBS"
                      placeholderTextColor="#94a3b8"
                    />

                    <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                      MAJOR / FIELD OF STUDY (OPTIONAL)
                    </Text>
                    <TextInput
                      value={edu.major || ""}
                      onChangeText={(val) => handleUpdateEducation(idx, "major", val)}
                      className="bg-white text-slate-900 p-2.5 rounded-lg border border-slate-200 text-xs mb-2.5"
                      placeholder="e.g. Computer Science, Finance"
                      placeholderTextColor="#94a3b8"
                    />
                  </>
                )}

                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  INSTITUTION / SCHOOL <Text className="text-rose-500">*</Text>
                </Text>
                <TextInput
                  value={edu.institution}
                  onChangeText={(val) => handleUpdateEducation(idx, "institution", val)}
                  className="bg-white text-slate-900 p-2.5 rounded-lg border border-slate-200 text-xs"
                  placeholder="e.g. University of Mumbai"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddEducation}
              className="py-2.5 border border-dashed border-rose-300 rounded-xl items-center flex-row justify-center bg-rose-50/50"
            >
              <Plus size={16} color="#e11d48" />
              <Text className="text-rose-600 text-xs font-bold ml-1.5">Add Another Qualification</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 6: WORK & CAREER ── */}
        {step === 6 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center border border-amber-200">
                <Briefcase size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Work & Profession</Text>
                <Text className="text-slate-500 text-xs">Your career and employment sector.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                SECTOR OF WORK
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {SECTOR_OPTIONS.map((sec) => {
                  const sel = formData.sector === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      onPress={() => handleChange("sector", sec)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
                        {sec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                JOB TITLE / PROFESSION
              </Text>
              <TextInput
                value={formData.profession}
                onChangeText={(val) => handleChange("profession", val)}
                className="bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 text-sm"
                placeholder="e.g. Software Engineer, Doctor, Designer"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        )}

        {/* ── STEP 7: PHOTO PRIVACY SHIELD ── */}
        {step === 7 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200">
                <Shield size={20} color="#10b981" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Photo Privacy Shield</Text>
                <Text className="text-slate-500 text-xs">Choose who can view your clear photos.</Text>
              </View>
            </View>

            <View className="space-y-2.5 mt-2">
              {PHOTO_VISIBILITY_OPTIONS.map((opt) => {
                const sel = formData.photoVisibility === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => handleChange("photoVisibility", opt.id)}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                      sel ? "bg-rose-50 border-rose-500" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text className={`text-sm font-bold ${sel ? "text-rose-700" : "text-slate-900"}`}>
                        {opt.title}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">{opt.desc}</Text>
                    </View>
                    {sel && <Check size={18} color="#e11d48" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 8: UPLOAD PHOTOS ── */}
        {step === 8 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center border border-rose-200">
                <Camera size={20} color="#e11d48" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Upload Photos</Text>
                <Text className="text-slate-500 text-xs">Add photos to your profile ({formData.photos.length}/6).</Text>
              </View>
            </View>

            {/* Photo Grid */}
            <View className="flex-row flex-wrap gap-2.5 mt-2">
              {formData.photos.map((p, idx) => (
                <View key={idx} className="w-24 h-32 rounded-xl overflow-hidden relative border border-slate-200 shadow-xs">
                  <Image source={{ uri: p }} className="w-full h-full" contentFit="cover" />
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 p-1 rounded-full"
                  >
                    <X size={12} color="#ffffff" />
                  </TouchableOpacity>
                  {idx === 0 && (
                    <View className="absolute bottom-1 left-1 bg-rose-600 px-1.5 py-0.5 rounded">
                      <Text className="text-white text-[9px] font-bold">Primary</Text>
                    </View>
                  )}
                </View>
              ))}

              {formData.photos.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="w-24 h-32 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 items-center justify-center p-2"
                >
                  <UploadCloud size={24} color="#e11d48" />
                  <Text className="text-rose-700 text-[10px] font-bold mt-1.5 text-center">
                    + Upload Photo
                  </Text>
                  <Text className="text-slate-400 text-[8px] mt-0.5">Device Gallery</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-[11px] text-slate-500 mt-1">
              Upload up to 6 pictures. Your photos will be protected according to your Privacy Shield.
            </Text>
          </View>
        )}

        {/* ── STEP 9: BIO ── */}
        {step === 9 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center border border-indigo-200">
                <BookOpen size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Your Bio / About You</Text>
                <Text className="text-slate-500 text-xs">Introduce yourself to prospective partners.</Text>
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">ABOUT ME</Text>
              <TextInput
                value={formData.bio}
                onChangeText={(val) => handleChange("bio", val)}
                multiline
                numberOfLines={5}
                className="bg-slate-50 text-slate-900 p-3.5 rounded-xl border border-slate-200 text-sm h-32 leading-5"
                placeholder="Share your values, personality, passions, and what kind of life partner you hope to build a future with..."
                placeholderTextColor="#94a3b8"
              />
              <Text className="text-[10px] text-slate-400 mt-1">
                Tip: Profiles with thoughtful bios receive 3x more meaningful mutual matches.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 10: LIFESTYLE & HABITS ── */}
        {step === 10 && (
          <View className="space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center border border-orange-200">
                <Coffee size={20} color="#f97316" />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-bold">Lifestyle & Habits</Text>
                <Text className="text-slate-500 text-xs">Dietary preferences, hobbies, and interests.</Text>
              </View>
            </View>

            {/* Diet */}
            <View className="mt-2">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                DIETARY PREFERENCE
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DIET_OPTIONS.map((d) => {
                  const sel = formData.diet === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => handleChange("diet", d)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Drinking Habits */}
            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                DRINKING
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DRINKING_OPTIONS.map((dr) => {
                  const sel = formData.drinking === dr.id;
                  return (
                    <TouchableOpacity
                      key={dr.id}
                      onPress={() => handleChange("drinking", dr.id)}
                      className={`px-3.5 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          sel ? "text-white font-bold" : "text-slate-700 font-medium"
                        }`}
                      >
                        {dr.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Smoking Habits */}
            <View className="mt-4">
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                SMOKING
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SMOKING_OPTIONS.map((sm) => {
                  const sel = formData.smoking === sm.id;
                  return (
                    <TouchableOpacity
                      key={sm.id}
                      onPress={() => handleChange("smoking", sm.id)}
                      className={`px-3.5 py-2 rounded-xl border ${
                        sel ? "bg-rose-600 border-rose-600" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          sel ? "text-white font-bold" : "text-slate-700 font-medium"
                        }`}
                      >
                        {sm.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Hobbies (Scrollable Container with No Clipping) */}
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                  HOBBIES & INTERESTS
                </Text>
                <Text className="text-rose-600 text-[10px] font-bold">
                  {formData.hobbies.length} selected
                </Text>
              </View>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: 240 }}
                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              >
                <View className="flex-row flex-wrap gap-1.5">
                  {HOBBY_OPTIONS.map((hobby) => {
                    const sel = formData.hobbies.includes(hobby);
                    return (
                      <TouchableOpacity
                        key={hobby}
                        onPress={() => toggleArrayItem("hobbies", hobby)}
                        className={`px-3 py-1.5 rounded-full border ${
                          sel ? "bg-rose-600 border-rose-600" : "bg-white border-slate-200"
                        }`}
                      >
                        <Text className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700"}`}>
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
            className="bg-white border border-slate-200 px-5 py-3.5 rounded-xl flex-row items-center shadow-xs"
          >
            <ArrowLeft size={16} color="#475569" />
            <Text className="text-slate-700 text-xs font-bold ml-2">Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={createProfileMutation.isPending}
          className="bg-rose-600 px-6 py-3.5 rounded-xl flex-row items-center justify-center flex-1 ml-auto max-w-[240px] shadow-xs active:bg-rose-700"
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
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white border-t border-slate-200 rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base capitalize">
                Select {activeModal}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Search Filter */}
            <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2 my-3 border border-slate-200">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchFilter}
                onChangeText={setSearchFilter}
                placeholder={`Search ${activeModal}...`}
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-800 text-xs ml-2 py-0"
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
                          ? "bg-rose-50 border border-rose-200"
                          : "active:bg-slate-50"
                      }`}
                    >
                      <Text className="text-slate-800 text-xs font-medium">{c.name}</Text>
                      {formData.nationality === c.name && <Check size={16} color="#e11d48" />}
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
                          ? "bg-rose-50 border border-rose-200"
                          : "active:bg-slate-50"
                      }`}
                    >
                      <Text className="text-slate-800 text-xs font-medium">{st}</Text>
                      {formData.state === st && <Check size={16} color="#e11d48" />}
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
                          ? "bg-rose-50 border border-rose-200"
                          : "active:bg-slate-50"
                      }`}
                    >
                      <Text className="text-slate-800 text-xs font-medium">{ct}</Text>
                      {formData.city === ct && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  ))}

              {activeModal === "religion" &&
                RELIGION_OPTIONS
                  .filter((r) => r.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => {
                        handleChange("religion", r);
                        setActiveModal(null);
                      }}
                      className={`p-3 rounded-xl flex-row items-center justify-between ${
                        formData.religion === r
                          ? "bg-rose-50 border border-rose-200"
                          : "active:bg-slate-50"
                      }`}
                    >
                      <Text className="text-slate-800 text-xs font-medium">{r}</Text>
                      {formData.religion === r && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  ))}

              {activeModal === "language" &&
                LANGUAGE_OPTIONS
                  .filter((l) => l.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((l) => {
                    const sel = formData.languagesSpoken.includes(l);
                    return (
                      <TouchableOpacity
                        key={l}
                        onPress={() => toggleArrayItem("languagesSpoken", l)}
                        className={`p-3 rounded-xl flex-row items-center justify-between ${
                          sel ? "bg-rose-50 border border-rose-200" : "active:bg-slate-50"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            sel ? "text-rose-700 font-bold" : "text-slate-800 font-medium"
                          }`}
                        >
                          {l}
                        </Text>
                        {sel && <Check size={16} color="#e11d48" />}
                      </TouchableOpacity>
                    );
                  })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
