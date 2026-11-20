import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Heart,
  Sparkles,
  GraduationCap,
  Briefcase,
  AlignLeft,
  Coffee,
  Camera,
  Lock,
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  Search,
  UploadCloud,
  Save,
  Star,
} from "lucide-react-native";
import {
  ALL_COUNTRIES,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  OUTNESS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  QUALIFICATION_OPTIONS,
  DEGREE_OPTIONS_BY_QUALIFICATION,
  SECTOR_OPTIONS,
  LANGUAGE_OPTIONS,
  HOBBY_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  ANNUAL_INCOME_OPTIONS,
  PET_OPTIONS,
  CHILDREN_OPTIONS,
} from "@everpride/shared";
import { getStatesForCountry, getCitiesForState, getCitiesForCountry } from "../data/locations";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth.store";

export interface EditProfileScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  visible,
  onClose,
}) => {
  const { profile, fetchProfile } = useAuthStore();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state initialized from profile
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [nationality, setNationality] = useState(profile?.nationality || "India");
  const [originCountry, setOriginCountry] = useState((profile as any)?.originCountry || "");
  const [originCity, setOriginCity] = useState((profile as any)?.originCity || "");
  const [country, setCountry] = useState(profile?.country || "India");
  const [state, setState] = useState(profile?.state || "");
  const [city, setCity] = useState(profile?.city || "");
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    profile?.languagesSpoken || ["English"]
  );

  const [gender, setGender] = useState(profile?.gender || "MAN");
  const [orientation, setOrientation] = useState(profile?.orientation || "GAY");
  const [pronouns, setPronouns] = useState(profile?.pronouns || "");
  const [outnessStatus, setOutnessStatus] = useState(
    profile?.outnessStatus || "OUT_TO_SELECT_FEW"
  );

  const [maritalStatus, setMaritalStatus] = useState(
    profile?.maritalStatus || "Never Married"
  );

  const [educations, setEducations] = useState<any[]>(
    profile?.educations && profile.educations.length > 0
      ? profile.educations.map((e: any) => ({
        degree: e.qualification || e.degree || "Bachelor's Degree",
        degreeName: e.degreeName || e.degree || "",
        major: e.major || "",
        institution: e.institution || "",
        year: e.year || undefined,
      }))
      : [
        {
          degree: "Bachelor's Degree",
          degreeName: "",
          major: "",
          institution: "",
        },
      ]
  );

  const [sector, setSector] = useState(profile?.sector || "Private / IT");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [annualIncome, setAnnualIncome] = useState((profile as any)?.annualIncome || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const [diet, setDiet] = useState(profile?.diet || "Vegetarian");
  const [drinking, setDrinking] = useState(profile?.drinking || "Non-drinker");
  const [smoking, setSmoking] = useState(profile?.smoking || "Non-smoker");
  const [pets, setPets] = useState((profile as any)?.pets || "");
  const [children, setChildren] = useState((profile as any)?.children || "");
  const [hobbies, setHobbies] = useState<string[]>(profile?.hobbies || []);

  // Photos
  const [photos, setPhotos] = useState<any[]>(
    profile?.photos && profile.photos.length > 0 ? profile.photos : []
  );

  // Search & Selector Modals
  const [activePicker, setActivePicker] = useState<
    "country" | "nationality" | "originCountry" | "originCity" | "state" | "city" | "languages" | null
  >(null);
  const [pickerSearch, setPickerSearch] = useState("");

  // Sync state whenever profile updates or modal opens
  useEffect(() => {
    if (visible && profile) {
      setDisplayName(profile.displayName || "");
      setNationality(profile.nationality || "India");
      setOriginCountry((profile as any)?.originCountry || "");
      setOriginCity((profile as any)?.originCity || "");
      setCountry(profile.country || "India");
      setState(profile.state || "");
      setCity(profile.city || "");
      setLanguagesSpoken(profile.languagesSpoken || ["English"]);
      setGender(profile.gender || "MAN");
      setOrientation(profile.orientation || "GAY");
      setPronouns(profile.pronouns || "");
      setOutnessStatus(profile.outnessStatus || "OUT_TO_SELECT_FEW");
      setMaritalStatus(profile.maritalStatus || "Never Married");
      setEducations(
        profile.educations && profile.educations.length > 0
          ? profile.educations.map((e: any) => ({
            degree: e.qualification || e.degree || "Bachelor's Degree",
            degreeName: e.degreeName || e.degree || "",
            major: e.major || "",
            institution: e.institution || "",
            year: e.year || undefined,
          }))
          : [
            {
              degree: "Bachelor's Degree",
              degreeName: "",
              major: "",
              institution: "",
            },
          ]
      );
      setSector(profile.sector || "Private / IT");
      setProfession(profile.profession || "");
      setAnnualIncome((profile as any)?.annualIncome || "");
      setBio(profile.bio || "");
      setDiet(profile.diet || "Vegetarian");
      setDrinking(profile.drinking || "Non-drinker");
      setSmoking(profile.smoking || "Non-smoker");
      setPets((profile as any)?.pets || "");
      setChildren((profile as any)?.children || "");
      setHobbies(profile.hobbies || []);
      setPhotos(profile.photos || []);
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

  const handlePickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert("Limit Reached", "You can upload a maximum of 6 photos.");
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
        setPhotos((prev) => [
          ...prev,
          {
            url: photoUri,
            originalUrl: photoUri,
            isPrimary: prev.length === 0,
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to pick image");
    }
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [{ ...selected, isPrimary: true }, ...remaining.map(p => ({ ...p, isPrimary: false }))];
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSave = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      Alert.alert("Required", "Display Name must be at least 2 characters.");
      return;
    }
    if (!state.trim() || !city.trim()) {
      Alert.alert("Required", "State and City are required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        displayName: displayName.trim(),
        gender,
        orientation,
        pronouns: pronouns.trim() || undefined,
        outnessStatus,
        nationality: nationality.trim() || "India",
        originCountry: originCountry.trim() || undefined,
        originCity: originCity.trim() || undefined,
        country: country.trim() || "India",
        state: state.trim(),
        city: city.trim(),
        languagesSpoken,
        maritalStatus,
        educations: educations
          .filter((e) => e.degree && e.institution.trim())
          .map((e) => ({
            qualification: e.degree.trim(),
            degree: (e.degreeName || e.degree).trim(),
            degreeName: e.degreeName?.trim() || null,
            major: e.major?.trim() || null,
            institution: e.institution.trim(),
            year: e.year ? Number(e.year) : null,
          })),
        education: (educations?.[0]?.degree || "").trim() || undefined,
        degree: (educations?.[0]?.degreeName || "").trim() || undefined,
        sector: sector.trim() || undefined,
        profession: profession.trim() || undefined,
        annualIncome: annualIncome ? annualIncome.trim() : undefined,
        bio: bio.trim() || undefined,
        diet: diet.trim() || undefined,
        drinking: drinking || undefined,
        smoking: smoking || undefined,
        pets: pets ? pets.trim() : undefined,
        children: children ? children.trim() : undefined,
        hobbies,
        photos: photos.map((p) => (typeof p === "string" ? p : p.url || p.originalUrl)),
      };

      await api.patch("/profiles/me", payload);
      await fetchProfile();
      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile";
      setErrorMsg(msg);
      Alert.alert("Update Failed", msg);
    } finally {
      setSaving(false);
    }
  };

  const availableStates = country ? getStatesForCountry(country) : [];
  const availableCities = country && state ? getCitiesForState(country, state) : [];
  const availableOriginCities =
    originCountry || nationality
      ? getCitiesForCountry(originCountry || nationality)
      : [];

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
                Edit Your Profile
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium">
                Keep your details authentic & updated
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm active:scale-95 ${saving ? "bg-rose-400" : "bg-rose-600"
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

        {/* Scrollable Form Content */}
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {errorMsg && (
            <View className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center justify-between">
              <Text className="text-xs text-rose-700 flex-1 font-medium">{errorMsg}</Text>
              <TouchableOpacity onPress={() => setErrorMsg(null)}>
                <X size={16} color="#e11d48" />
              </TouchableOpacity>
            </View>
          )}

          {/* UNIFIED PROFILE EDIT FORM */}
          <View className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6 space-y-6">
            {/* SECTION 1: ABOUT YOU */}
            <View>
              <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                About You
              </Text>

              <View className="space-y-4">
                {/* Chosen Name */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Name *
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    placeholder="Your chosen name or alias"
                    placeholderTextColor="#94a3b8"
                  />
                  <Text className="text-[10px] text-slate-400 mt-1">
                    You may use your chosen name or alias.
                  </Text>
                </View>

                {/* Non-updatable Demographics: DOB, Height, Religion */}
                <View className="space-y-2">
                  {/* DOB */}
                  <View className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-2">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Lock size={10} color="#94a3b8" />
                      <Text className="text-[9px] font-bold text-slate-500 uppercase">DOB</Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-slate-800" numberOfLines={1}>
                      {profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "Set on signup"}
                    </Text>
                  </View>

                  {/* Height */}
                  <View className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-2">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Lock size={10} color="#94a3b8" />
                      <Text className="text-[9px] font-bold text-slate-500 uppercase">Height</Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-slate-800" numberOfLines={1}>
                      {profile?.heightCm
                        ? `${profile.heightCm} cm`
                        : "Not set"}
                    </Text>
                  </View>

                  {/* Religion */}
                  <View className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-2">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Lock size={10} color="#94a3b8" />
                      <Text className="text-[9px] font-bold text-slate-500 uppercase">Religion</Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-slate-800" numberOfLines={1}>
                      {profile?.religion || "Not set"}
                    </Text>
                  </View>
                </View>

                {/* Location Selectors: Current Residence */}
                <View className="space-y-2.5 mt-2">
                  <Text className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Current Residence
                  </Text>

                  {/* Country of Residence */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setPickerSearch("");
                        setActivePicker("country");
                      }}
                      className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {country || "Select Country"}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* State */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!country) return;
                        setPickerSearch("");
                        setActivePicker("state");
                      }}
                      className={`bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between ${!country ? "opacity-50" : ""
                        }`}
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {state || (country ? "Select State" : "Select Country First")}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* City */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!state) return;
                        setPickerSearch("");
                        setActivePicker("city");
                      }}
                      className={`bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between ${!state ? "opacity-50" : ""
                        }`}
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {city || (state ? "Select City" : "Select State First")}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Origin & Citizenship */}
                <View className="space-y-2.5 mt-3 pt-3 border-t border-slate-100">
                  <Text className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Origin & Citizenship
                  </Text>

                  {/* Nationality */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      NATIONALITY / CITIZENSHIP *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setPickerSearch("");
                        setActivePicker("nationality");
                      }}
                      className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {nationality || "Select Nationality"}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* Country of Origin */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country of Origin
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setPickerSearch("");
                        setActivePicker("originCountry");
                      }}
                      className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {originCountry || "Select Country of Origin"}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* Hometown / Origin City */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hometown
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!originCountry && !nationality) {
                          Alert.alert("Required", "Please select Nationality or Country of Origin first.");
                          return;
                        }
                        setPickerSearch("");
                        setActivePicker("originCity");
                      }}
                      className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-900">
                        {originCity || "Select Hometown"}
                      </Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Languages Spoken Multi-select */}
                <View className="mt-1">
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Languages
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setPickerSearch("");
                      setActivePicker("languages");
                    }}
                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-row items-center justify-between"
                  >
                    <View className="flex-row flex-wrap gap-1.5 flex-1 pr-2">
                      {languagesSpoken.map((lang) => (
                        <View
                          key={lang}
                          className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex-row items-center gap-1"
                        >
                          <Text className="text-[11px] font-bold text-rose-700">{lang}</Text>
                        </View>
                      ))}
                    </View>
                    <ChevronDown size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="h-px bg-slate-100 my-6" />

            {/* SECTION 2: IDENTITY */}
            <View>
              <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                Identity
              </Text>

              <View className="space-y-4">
                {/* Gender Identity */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gender Identity *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {GENDER_OPTIONS.map((g) => {
                      const sel = gender === g.value;
                      return (
                        <TouchableOpacity
                          key={g.value}
                          onPress={() => setGender(g.value)}
                          className={`px-3 py-1.5 rounded-xl border ${sel
                            ? "bg-rose-600 border-rose-600"
                            : "bg-slate-50 border-slate-200"
                            }`}
                        >
                          <Text
                            className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                              }`}
                          >
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Sexual Orientation */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sexual Orientation *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ORIENTATION_OPTIONS.map((o) => {
                      const sel = orientation === o.value;
                      return (
                        <TouchableOpacity
                          key={o.value}
                          onPress={() => setOrientation(o.value)}
                          className={`px-3 py-1.5 rounded-xl border ${sel
                            ? "bg-rose-600 border-rose-600"
                            : "bg-slate-50 border-slate-200"
                            }`}
                        >
                          <Text
                            className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                              }`}
                          >
                            {o.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Pronouns */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pronouns
                  </Text>
                  <TextInput
                    value={pronouns}
                    onChangeText={setPronouns}
                    className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    placeholder="e.g. they/them, she/her, he/him"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Outness Status */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Are you out of the closet? *
                  </Text>
                  <View className="space-y-2">
                    {OUTNESS_OPTIONS.map((st) => {
                      const sel = outnessStatus === st.id;
                      return (
                        <TouchableOpacity
                          key={st.id}
                          onPress={() => setOutnessStatus(st.id)}
                          className={`p-2.5 rounded-xl border flex-row items-center justify-between ${sel
                            ? "bg-rose-600 border-rose-600 shadow-xs"
                            : "bg-slate-50 border-slate-200"
                            }`}
                        >
                          <Text
                            className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                              }`}
                          >
                            {st.label}
                          </Text>
                          {sel && <Check size={14} color="#ffffff" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View className="h-px bg-slate-100 my-6" />

              {/* SECTION 3: MARITAL STATUS */}
              <View>
                <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                  Marital Status
                </Text>

                <View className="space-y-2.5">
                  {MARITAL_STATUS_OPTIONS.map((ms) => {
                    const sel = maritalStatus === ms.id;
                    return (
                      <TouchableOpacity
                        key={ms.id}
                        onPress={() => setMaritalStatus(ms.id)}
                        className={`p-3 rounded-xl border ${sel
                          ? "bg-rose-50/50 border-rose-500 shadow-xs"
                          : "bg-slate-50 border-slate-200"
                          }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`text-xs font-bold ${sel ? "text-rose-950" : "text-slate-900"
                              }`}
                          >
                            {ms.id}
                          </Text>
                          {sel && (
                            <View className="w-4 h-4 rounded-full bg-rose-600 items-center justify-center">
                              <Check size={10} color="#ffffff" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="h-px bg-slate-100 my-6" />

              {/* SECTION 4: EDUCATION DETAILS */}
              <View>
                <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                  Education Details
                </Text>

                <View className="space-y-4">
                  {educations.map((edu, idx) => {
                    const degreeList =
                      DEGREE_OPTIONS_BY_QUALIFICATION[edu.degree] || [];

                    return (
                      <View
                        key={idx}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                      >
                        {educations.length > 1 && (
                          <View className="flex-row items-center justify-end">
                            <TouchableOpacity
                              onPress={() =>
                                setEducations(educations.filter((_, i) => i !== idx))
                              }
                              className="p-1 rounded-md bg-rose-50"
                            >
                              <Trash2 size={14} color="#e11d48" />
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Level Chips */}
                        <View className="flex-row flex-wrap gap-1.5">
                          {QUALIFICATION_OPTIONS.map((q) => {
                            const sel = edu.degree === q;
                            return (
                              <TouchableOpacity
                                key={q}
                                onPress={() => {
                                  const updated = [...educations];
                                  updated[idx].degree = q;
                                  setEducations(updated);
                                }}
                                className={`px-2.5 py-1 rounded-lg border ${sel
                                  ? "bg-rose-600 border-rose-600"
                                  : "bg-white border-slate-200"
                                  }`}
                              >
                                <Text
                                  className={`text-[11px] ${sel ? "text-white font-bold" : "text-slate-700"
                                    }`}
                                >
                                  {q}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Degree Name */}
                        {edu.degree !== "High School" && (
                          <>
                            <View>
                              <Text className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                                Degree *
                              </Text>
                              <TextInput
                                value={edu.degreeName}
                                onChangeText={(val) => {
                                  const updated = [...educations];
                                  updated[idx].degreeName = val;
                                  setEducations(updated);
                                }}
                                className="bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                                placeholder={
                                  degreeList[0] || "e.g. Bachelor of Science (B.S.)"
                                }
                                placeholderTextColor="#94a3b8"
                              />
                            </View>

                            <View>
                              <Text className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                                field of study
                              </Text>
                              <TextInput
                                value={edu.major || ""}
                                onChangeText={(val) => {
                                  const updated = [...educations];
                                  updated[idx].major = val;
                                  setEducations(updated);
                                }}
                                className="bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                                placeholder="e.g. Computer Science, Finance"
                                placeholderTextColor="#94a3b8"
                              />
                            </View>
                          </>
                        )}

                        {/* Institution */}
                        <View>
                          <Text className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                            {edu.degree === "High School"
                              ? "School"
                              : edu.degree === "Diploma" || edu.degree === "Other"
                                ? "INSTITUTION"
                                : "University"} *
                          </Text>
                          <TextInput
                            value={edu.institution}
                            onChangeText={(val) => {
                              const updated = [...educations];
                              updated[idx].institution = val;
                              setEducations(updated);
                            }}
                            className="bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                            placeholder={
                              edu.degree === "High School"
                                ? "e.g. DPS, St. Xavier's, City High School"
                                : edu.degree === "Diploma" || edu.degree === "Other"
                                  ? "e.g. National Institute of Design, Tech Academy"
                                  : "e.g. Oxford University, Delhi University"
                            }
                            placeholderTextColor="#94a3b8"
                          />
                        </View>
                      </View>
                    );
                  })}

                  {/* Add Qualification Button */}
                  <TouchableOpacity
                    onPress={() =>
                      setEducations([
                        ...educations,
                        {
                          degree: "Bachelor's Degree",
                          degreeName: "",
                          major: "",
                          institution: "",
                        },
                      ])
                    }
                    className="py-2.5 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 flex-row items-center justify-center gap-1.5 active:bg-rose-100/50"
                  >
                    <Plus size={15} color="#e11d48" />
                    <Text className="text-xs font-bold text-rose-600">
                      Add Qualification
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="h-px bg-slate-100 my-6" />

              {/* SECTION 5: CAREER */}
              <View>
                <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                  Career
                </Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Sector of Work
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {SECTOR_OPTIONS.map((sec) => {
                        const sel = sector === sec;
                        return (
                          <TouchableOpacity
                            key={sec}
                            onPress={() => setSector(sec)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {sec}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Job Title
                    </Text>
                    <TextInput
                      value={profession}
                      onChangeText={setProfession}
                      className="bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                      placeholder="e.g. Senior Software Engineer, Architect"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Annual Income
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {ANNUAL_INCOME_OPTIONS.map((incomeOpt) => {
                        const sel = annualIncome === incomeOpt;
                        return (
                          <TouchableOpacity
                            key={incomeOpt}
                            onPress={() => setAnnualIncome(sel ? "" : incomeOpt)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {incomeOpt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              <View className="h-px bg-slate-100 my-6" />

              {/* SECTION 6: BIO */}
              <View>
                <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                  Bio
                </Text>

                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-slate-50 text-slate-900 p-3.5 rounded-xl border border-slate-200 text-xs font-medium leading-relaxed min-h-[90px]"
                  placeholder="Share your values, personality, passions, and what kind of partner you hope to build a future with..."
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View className="h-px bg-slate-100 my-6" />

              {/* SECTION 7: LIFESTYLE & INTERESTS */}
              <View>
                <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">
                  Lifestyle & Interests
                </Text>

                <View className="space-y-4">
                  {/* Diet */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Dietary Preference
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {DIET_OPTIONS.map((d) => {
                        const sel = diet === d;
                        return (
                          <TouchableOpacity
                            key={d}
                            onPress={() => setDiet(d)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {d}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Drinking */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Drinking
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {DRINKING_OPTIONS.map((dr) => {
                        const sel = drinking === dr.id;
                        return (
                          <TouchableOpacity
                            key={dr.id}
                            onPress={() => setDrinking(dr.id)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {dr.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Smoking */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Smoking
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {SMOKING_OPTIONS.map((sm) => {
                        const sel = smoking === sm.id;
                        return (
                          <TouchableOpacity
                            key={sm.id}
                            onPress={() => setSmoking(sm.id)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {sm.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Pet Preferences */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pet Preferences
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {PET_OPTIONS.map((petOpt) => {
                        const sel = pets === petOpt;
                        return (
                          <TouchableOpacity
                            key={petOpt}
                            onPress={() => setPets(sel ? "" : petOpt)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {petOpt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Children Preferences */}
                  <View>
                    <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Children Preferences
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {CHILDREN_OPTIONS.map((childOpt) => {
                        const sel = children === childOpt;
                        return (
                          <TouchableOpacity
                            key={childOpt}
                            onPress={() => setChildren(sel ? "" : childOpt)}
                            className={`px-3 py-1.5 rounded-xl border ${sel
                              ? "bg-rose-600 border-rose-600"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-xs ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {childOpt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Hobbies */}
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Hobbies & Interests
                      </Text>
                      <Text className="text-[10px] text-slate-400">
                        {hobbies.length} selected
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap gap-1.5">
                      {HOBBY_OPTIONS.map((hb) => {
                        const sel = hobbies.includes(hb);
                        return (
                          <TouchableOpacity
                            key={hb}
                            onPress={() => toggleArrayItem(hobbies, setHobbies, hb)}
                            className={`px-2.5 py-1 rounded-full border ${sel
                              ? "bg-rose-600 border-rose-600 shadow-xs"
                              : "bg-slate-50 border-slate-200"
                              }`}
                          >
                            <Text
                              className={`text-[11px] ${sel ? "text-white font-bold" : "text-slate-700 font-medium"
                                }`}
                            >
                              {hb}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View className="h-px bg-slate-100 my-6" />

                {/* SECTION 8: YOUR PICTURES */}
                <View>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm font-bold text-rose-600 uppercase tracking-wider">
                      Your Pictures
                    </Text>
                    <View className="px-2 py-0.5 rounded-full bg-slate-100">
                      <Text className="text-[10px] font-bold text-slate-600">
                        {photos.length} / 6 Photos
                      </Text>
                    </View>
                  </View>

                  {/* Photo Thumbnails */}
                  <View className="flex-row flex-wrap gap-2.5">
                    {photos.map((p, idx) => {
                      const photoUri = typeof p === "string" ? p : p.url || p.originalUrl;
                      const isPrimary = idx === 0 || p.isPrimary;

                      return (
                        <View
                          key={idx}
                          className="w-24 h-32 rounded-xl overflow-hidden relative border border-slate-200 shadow-xs"
                        >
                          <Image
                            source={{ uri: photoUri }}
                            className="w-full h-full"
                            contentFit="cover"
                          />

                          {/* Primary Star Indicator */}
                          {isPrimary ? (
                            <View className="absolute top-1.5 left-1.5 bg-amber-500 px-1.5 py-0.5 rounded-md flex-row items-center gap-0.5 shadow-sm">
                              <Star size={9} color="#ffffff" fill="#ffffff" />
                              <Text className="text-[8px] font-bold text-white uppercase">
                                Main
                              </Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleSetPrimaryPhoto(idx)}
                              className="absolute top-1.5 left-1.5 bg-black/50 px-1.5 py-0.5 rounded-md"
                            >
                              <Text className="text-[8px] font-bold text-white">Set Main</Text>
                            </TouchableOpacity>
                          )}

                          {/* Remove Button */}
                          <TouchableOpacity
                            onPress={() => handleRemovePhoto(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/60 p-1 rounded-full"
                          >
                            <X size={12} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    {/* Upload Tile */}
                    {photos.length < 6 && (
                      <TouchableOpacity
                        onPress={handlePickImage}
                        className="w-24 h-32 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 items-center justify-center p-2"
                      >
                        <UploadCloud size={22} color="#e11d48" />
                        <Text className="text-rose-700 text-[10px] font-bold mt-1 text-center">
                          + Upload Photo
                        </Text>
                        <Text className="text-slate-400 text-[8px] mt-0.5 text-center">
                          Device Gallery
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-[10px] text-slate-400 mt-2">
                    The first photo appears as your main display avatar across discovery feeds.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Searchable Picker Modal for Nationality, State, City, Languages */}
        <Modal
          visible={activePicker !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActivePicker(null)}
        >
          <View className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select {activePicker}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)} className="p-1">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="p-3 border-b border-slate-100">
              <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                <Search size={16} color="#94a3b8" />
                <TextInput
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  placeholder="Search options..."
                  className="flex-1 ml-2 text-xs text-slate-900"
                  autoFocus
                />
              </View>
            </View>

            <ScrollView className="flex-1 px-3 py-2">
              {(activePicker === "country" || activePicker === "nationality" || activePicker === "originCountry") &&
                ALL_COUNTRIES.filter((c) =>
                  c.name.toLowerCase().includes(pickerSearch.toLowerCase())
                ).map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      if (activePicker === "country") {
                        setCountry(c.name);
                        setState("");
                        setCity("");
                      } else if (activePicker === "nationality") {
                        setNationality(c.name);
                      } else if (activePicker === "originCountry") {
                        setOriginCountry(c.name);
                      }
                      setActivePicker(null);
                    }}
                    className="p-3 border-b border-slate-100 flex-row items-center justify-between"
                  >
                    <Text className="text-xs font-medium text-slate-800">{c.name}</Text>
                    {((activePicker === "country" && country === c.name) ||
                      (activePicker === "nationality" && nationality === c.name) ||
                      (activePicker === "originCountry" && originCountry === c.name)) && (
                        <Check size={16} color="#e11d48" />
                      )}
                  </TouchableOpacity>
                ))}

              {activePicker === "state" &&
                availableStates
                  .filter((st) => st.toLowerCase().includes(pickerSearch.toLowerCase()))
                  .map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        setState(st);
                        setCity("");
                        setActivePicker(null);
                      }}
                      className="p-3 border-b border-slate-100 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-800">{st}</Text>
                      {state === st && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  ))}

              {activePicker === "city" &&
                availableCities
                  .filter((ct) => ct.toLowerCase().includes(pickerSearch.toLowerCase()))
                  .map((ct) => (
                    <TouchableOpacity
                      key={ct}
                      onPress={() => {
                        setCity(ct);
                        setActivePicker(null);
                      }}
                      className="p-3 border-b border-slate-100 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-800">{ct}</Text>
                      {city === ct && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  ))}

              {activePicker === "originCity" &&
                availableOriginCities
                  .filter((ct) => ct.toLowerCase().includes(pickerSearch.toLowerCase()))
                  .map((ct) => (
                    <TouchableOpacity
                      key={ct}
                      onPress={() => {
                        setOriginCity(ct);
                        setActivePicker(null);
                      }}
                      className="p-3 border-b border-slate-100 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-medium text-slate-800">{ct}</Text>
                      {originCity === ct && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  ))}

              {activePicker === "languages" &&
                LANGUAGE_OPTIONS.filter((lang) =>
                  lang.toLowerCase().includes(pickerSearch.toLowerCase())
                ).map((lang) => {
                  const sel = languagesSpoken.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      onPress={() =>
                        toggleArrayItem(languagesSpoken, setLanguagesSpoken, lang)
                      }
                      className="p-3 border-b border-slate-100 flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-xs ${sel ? "font-bold text-rose-600" : "font-medium text-slate-800"
                          }`}
                      >
                        {lang}
                      </Text>
                      {sel && <Check size={16} color="#e11d48" />}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

