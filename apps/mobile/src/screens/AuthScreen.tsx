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
} from "lucide-react-native";
import { ALL_COUNTRIES, CountryData } from "@everpride/shared";

const heroCoupleImg = require("../../assets/hero-couple.jpg");

export const AuthScreen: React.FC = () => {
  const { sendOtp, login, isLoading } = useAuthStore();

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

  return (
    <View className="flex-1 bg-slate-900">
      {/* Background Hero Image matching Web */}
      <Image
        source={heroCoupleImg}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Subtle overlay for contrast */}
      <View
        style={StyleSheet.absoluteFill}
        className="bg-black/25"
      />

      {/* Main Content Area: Logo + Let's Begin Button */}
      <View className="flex-1 justify-end px-6 pb-12">
        {/* Brand Logo & Name directly above the button */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-0.5 shadow-xl shadow-rose-950/50 mb-3">
            <View className="w-full h-full bg-white rounded-[14px] items-center justify-center">
              <Heart size={32} color="#e11d48" fill="#e11d48" />
            </View>
          </View>
          <Text className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Ever<Text className="text-rose-500">Pride</Text>
          </Text>
        </View>

        {/* Let's Begin Action Button */}
        <TouchableOpacity
          onPress={openAuthModal}
          className="w-full py-4 rounded-2xl bg-rose-600 active:bg-rose-700 shadow-xl shadow-rose-950/40 flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-bold text-base">Let's Begin</Text>
          <ArrowRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          AUTH / LOGIN MODAL SHEET
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
