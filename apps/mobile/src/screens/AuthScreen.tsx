import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useAuthStore } from "../stores/auth.store";
import {
  Heart,
  ArrowRight,
  ChevronDown,
  Search,
  X,
  AlertCircle,
  LogIn,
} from "lucide-react-native";
import {
  ALL_COUNTRIES,
  CountryData,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
} from "@everpride/shared";

const heroCoupleImg = require("../../assets/hero-couple.jpg");

export const AuthScreen: React.FC = () => {
  const { sendOtp, login, isLoading } = useAuthStore();

  // "Looking For" Hero Matchmaker Card State
  const [lookingFor, setLookingFor] = useState({
    gender: "MAN",
    orientation: "GAY",
    minAge: 22,
    maxAge: 32,
  });

  // Modal selector pickers for "Looking For" Card
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [orientationPickerVisible, setOrientationPickerVisible] = useState(false);
  const [minAgePickerVisible, setMinAgePickerVisible] = useState(false);
  const [maxAgePickerVisible, setMaxAgePickerVisible] = useState(false);

  // Auth / Login Modal State
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return ALL_COUNTRIES.find((c: CountryData) => c.dialCode === "+91") || ALL_COUNTRIES[0];
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Clear inputs on mount
  useEffect(() => {
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setErrorMsg(null);
    setBusy(false);
  }, []);

  const openAuthModal = () => {
    setErrorMsg(null);
    setLoginModalVisible(true);
  };

  const filteredCountries = searchQuery.trim()
    ? ALL_COUNTRIES.filter(
        (c: CountryData) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.dialCode.includes(searchQuery) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_COUNTRIES;

  const getFullPhoneNumber = () => {
    const raw = phoneNumber.trim().replace(/\s+/g, "").replace(/^0+/, "");
    if (!raw) return "";
    if (raw.startsWith("+")) return raw;
    return `${selectedCountry.dialCode}${raw}`;
  };

  const handleSendOtp = async () => {
    if (busy) return;
    const fullPhone = getFullPhoneNumber();
    if (!phoneNumber.trim() || fullPhone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }
    setErrorMsg(null);
    setBusy(true);
    try {
      await sendOtp(fullPhone);
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Failed to send code. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    if (busy) return;
    if (!otp || otp.length < 4) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    const fullPhone = getFullPhoneNumber();
    setErrorMsg(null);
    setBusy(true);
    try {
      await login(fullPhone, otp.trim());
      setLoginModalVisible(false);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Login failed. Please check the code."
      );
      setBusy(false);
    }
  };

  // Ages from 18 to 40, plus 40+
  const ageOptions = [
    ...Array.from({ length: 23 }, (_, i) => ({ value: 18 + i, label: `${18 + i}` })),
    { value: 41, label: "40+" },
  ];

  return (
    <View className="flex-1 bg-slate-900">
      {/* Background Image matching Web */}
      <Image
        source={heroCoupleImg}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Dark Gradient Overlay for optimal contrast and readability */}
      <View
        style={StyleSheet.absoluteFill}
        className="bg-black/20"
      />

      {/* Scrollable Container with "Looking For" Card positioned towards the bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            paddingHorizontal: 20,
            paddingBottom: 36,
            paddingTop: 48,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero "Looking For" Card matching Web */}
          <View className="bg-white/95 rounded-3xl border border-slate-200/90 p-5 shadow-2xl">
            {/* Field 1: I'm looking for a */}
            <View className="mb-3.5">
              <Text className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                I'm looking for a
              </Text>
              <TouchableOpacity
                onPress={() => setGenderPickerVisible(true)}
                className="flex-row items-center justify-between px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <Text className="text-sm font-medium text-slate-800">
                  {GENDER_OPTIONS.find((g) => g.value === lookingFor.gender)?.label ||
                    lookingFor.gender}
                </Text>
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Field 2: Sexual Orientation */}
            <View className="mb-3.5">
              <Text className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Orientation
              </Text>
              <TouchableOpacity
                onPress={() => setOrientationPickerVisible(true)}
                className="flex-row items-center justify-between px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <Text className="text-sm font-medium text-slate-800">
                  {ORIENTATION_OPTIONS.find((o) => o.value === lookingFor.orientation)
                    ?.label || lookingFor.orientation}
                </Text>
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Field 3: Aged (Min Age to Max Age) */}
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Aged
              </Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => setMinAgePickerVisible(true)}
                  className="flex-1 flex-row items-center justify-between px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <Text className="text-sm font-medium text-slate-800">
                    {ageOptions.find((a) => a.value === lookingFor.minAge)?.label ||
                      lookingFor.minAge}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>

                <Text className="text-xs text-slate-400 font-bold">to</Text>

                <TouchableOpacity
                  onPress={() => setMaxAgePickerVisible(true)}
                  className="flex-1 flex-row items-center justify-between px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <Text className="text-sm font-medium text-slate-800">
                    {ageOptions.find((a) => a.value === lookingFor.maxAge)?.label ||
                      lookingFor.maxAge}
                  </Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* "Let's Begin" CTA Button */}
            <TouchableOpacity
              onPress={openAuthModal}
              className="w-full py-3.5 rounded-xl font-bold bg-rose-600 active:bg-rose-700 shadow-md shadow-rose-500/20 flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-bold text-sm">Let's Begin</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Separate "Sign In" Button Below "Looking for" Card */}
          <TouchableOpacity
            onPress={openAuthModal}
            className="mt-3.5 w-full py-3.5 rounded-2xl bg-white/95 active:bg-white border border-slate-200/90 shadow-lg flex-row items-center justify-center gap-2"
          >
            <LogIn size={16} color="#e11d48" />
            <Text className="text-slate-900 font-bold text-sm">
              Already have an account? <Text className="text-rose-600">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─────────────────────────────────────────────────────────────
          AUTH / LOGIN MODAL SHEET (Matching Web Login Modal)
         ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={loginModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200/90 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center border border-rose-200">
                  <Heart size={16} color="#e11d48" fill="#e11d48" />
                </View>
                <Text className="text-slate-900 text-lg font-bold">
                  {otpSent ? "Verify Mobile Number" : "Sign in / Register"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setLoginModalVisible(false)}
                className="p-1.5 rounded-full active:bg-slate-100"
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-500 text-xs mt-2.5 mb-4">
              {otpSent
                ? `Enter the verification code sent to ${getFullPhoneNumber()}`
                : "We'll send you a fast, passwordless SMS verification code"}
            </Text>

            {errorMsg && (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                <AlertCircle size={15} color="#e11d48" />
                <Text className="text-rose-700 text-xs font-semibold flex-1">{errorMsg}</Text>
              </View>
            )}

            {!otpSent ? (
              <View>
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Mobile Number <Text className="text-rose-500">*</Text>
                </Text>
                <View className="flex-row gap-2">
                  {/* Country Code Picker Button */}
                  <TouchableOpacity
                    onPress={() => setCountryModalVisible(true)}
                    className="bg-slate-50 px-3 py-3 rounded-xl border border-slate-200 flex-row items-center gap-1.5 active:bg-slate-100"
                  >
                    <View className="bg-rose-100 px-1.5 py-0.5 rounded">
                      <Text className="text-rose-700 font-extrabold text-xs">
                        {selectedCountry.code}
                      </Text>
                    </View>
                    <Text className="text-slate-800 text-sm font-semibold font-mono">
                      {selectedCountry.dialCode}
                    </Text>
                    <ChevronDown size={14} color="#64748b" />
                  </TouchableOpacity>

                  {/* Phone Number Input */}
                  <View className="flex-1 relative justify-center">
                    <TextInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      placeholder="98765 43210"
                      placeholderTextColor="#94a3b8"
                      className="bg-slate-50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-medium"
                      autoFocus
                    />
                  </View>
                </View>

                <Text className="text-[11px] text-slate-400 mt-1.5">
                  We'll send a 6-digit verification code to confirm your number.
                </Text>

                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={busy}
                  className="mt-5 bg-rose-600 active:bg-rose-700 py-3.5 rounded-xl items-center flex-row justify-center shadow-xs"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-sm mr-2">
                        Send OTP
                      </Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Verification Code (OTP)
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#94a3b8"
                    className="bg-slate-50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest font-mono text-center font-medium"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={busy}
                  className="mt-5 bg-rose-600 active:bg-rose-700 py-3.5 rounded-xl items-center shadow-xs"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-sm">
                      Verify & Continue
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setOtpSent(false);
                    setOtp("");
                    setErrorMsg(null);
                  }}
                  className="mt-4 items-center py-1"
                >
                  <Text className="text-slate-500 text-xs hover:text-slate-800">
                    Change phone number
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text className="text-slate-400 text-[11px] text-center mt-5">
              🔒 Private, discrete, & secure. No profiles shared without your consent.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PICKER MODAL: Gender
         ───────────────────────────────────────────────────────────── */}
      <Modal visible={genderPickerVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base">I'm looking for a</Text>
              <TouchableOpacity onPress={() => setGenderPickerVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="mt-2">
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    setLookingFor({ ...lookingFor, gender: opt.value });
                    setGenderPickerVisible(false);
                  }}
                  className={`p-3.5 rounded-xl my-0.5 ${
                    lookingFor.gender === opt.value
                      ? "bg-rose-50 border border-rose-200"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      lookingFor.gender === opt.value
                        ? "text-rose-600 font-bold"
                        : "text-slate-800 font-medium"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PICKER MODAL: Orientation
         ───────────────────────────────────────────────────────────── */}
      <Modal visible={orientationPickerVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base">Orientation</Text>
              <TouchableOpacity onPress={() => setOrientationPickerVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="mt-2">
              {ORIENTATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    setLookingFor({ ...lookingFor, orientation: opt.value });
                    setOrientationPickerVisible(false);
                  }}
                  className={`p-3.5 rounded-xl my-0.5 ${
                    lookingFor.orientation === opt.value
                      ? "bg-rose-50 border border-rose-200"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      lookingFor.orientation === opt.value
                        ? "text-rose-600 font-bold"
                        : "text-slate-800 font-medium"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PICKER MODAL: Min Age
         ───────────────────────────────────────────────────────────── */}
      <Modal visible={minAgePickerVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base">Minimum Age</Text>
              <TouchableOpacity onPress={() => setMinAgePickerVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="mt-2">
              {ageOptions.map((opt) => (
                <TouchableOpacity
                  key={`min-${opt.value}`}
                  onPress={() => {
                    setLookingFor({ ...lookingFor, minAge: Number(opt.value) });
                    setMinAgePickerVisible(false);
                  }}
                  className={`p-3.5 rounded-xl my-0.5 ${
                    lookingFor.minAge === opt.value
                      ? "bg-rose-50 border border-rose-200"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      lookingFor.minAge === opt.value
                        ? "text-rose-600 font-bold"
                        : "text-slate-800 font-medium"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PICKER MODAL: Max Age
         ───────────────────────────────────────────────────────────── */}
      <Modal visible={maxAgePickerVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base">Maximum Age</Text>
              <TouchableOpacity onPress={() => setMaxAgePickerVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="mt-2">
              {ageOptions.map((opt) => (
                <TouchableOpacity
                  key={`max-${opt.value}`}
                  onPress={() => {
                    setLookingFor({ ...lookingFor, maxAge: Number(opt.value) });
                    setMaxAgePickerVisible(false);
                  }}
                  className={`p-3.5 rounded-xl my-0.5 ${
                    lookingFor.maxAge === opt.value
                      ? "bg-rose-50 border border-rose-200"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      lookingFor.maxAge === opt.value
                        ? "text-rose-600 font-bold"
                        : "text-slate-800 font-medium"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PICKER MODAL: Country Code
         ───────────────────────────────────────────────────────────── */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white border-t border-slate-200 rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-slate-900 font-bold text-base">Select Country Code</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Search box */}
            <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2 my-3 border border-slate-200">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search country or code..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-800 text-xs ml-2 py-0"
              />
            </View>

            {/* Country list */}
            <ScrollView className="space-y-1">
              {filteredCountries.map((c: CountryData) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <TouchableOpacity
                    key={`${c.code}-${c.dialCode}`}
                    onPress={() => {
                      setSelectedCountry(c);
                      setCountryModalVisible(false);
                      setSearchQuery("");
                    }}
                    className={`flex-row items-center justify-between p-3 rounded-xl ${
                      isSelected ? "bg-rose-50 border border-rose-200" : "active:bg-slate-50"
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View className="bg-rose-100 px-2 py-0.5 rounded">
                        <Text className="text-rose-700 font-bold text-xs">{c.code}</Text>
                      </View>
                      <Text className="text-slate-800 text-xs font-medium">{c.name}</Text>
                    </View>
                    <Text className="text-slate-600 font-mono text-xs font-bold">
                      {c.dialCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
