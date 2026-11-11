import React, { useState } from "react";
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
} from "react-native";
import { useAuthStore } from "../stores/auth.store";
import { Heart, Phone, KeyRound, ArrowRight, ChevronDown, Search, X } from "lucide-react-native";
import { allCountries, CountryData } from "../data/countries";

export const AuthScreen: React.FC = () => {
  const { sendOtp, login, isLoading } = useAuthStore();
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return allCountries.find((c) => c.dialCode === "+91") || allCountries[0];
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = searchQuery.trim()
    ? allCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.dialCode.includes(searchQuery) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCountries;

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
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Login failed. Please check the code."
      );
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-950 justify-center px-6"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        {/* Brand Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-brand-600/20 items-center justify-center border border-brand-500/30 mb-3">
            <Heart size={32} color="#f43f5e" fill="#f43f5e" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            Ever<Text className="text-brand-500">Pride</Text>
          </Text>
          <Text className="text-slate-400 text-sm mt-1 text-center">
            Meaningful connections designed for our LGBTQ+ community
          </Text>
        </View>

        {/* Auth Form Card */}
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <Text className="text-white text-lg font-bold mb-1">
            {otpSent ? "Verify Mobile Number" : "Sign in / Register"}
          </Text>
          <Text className="text-slate-400 text-xs mb-5">
            {otpSent
              ? `Enter the verification code sent to ${getFullPhoneNumber()}`
              : "We'll send you a fast, passwordless SMS verification code"}
          </Text>

          {errorMsg && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-xs text-center">{errorMsg}</Text>
            </View>
          )}

          {!otpSent ? (
            <View>
              <Text className="text-slate-300 text-xs font-medium mb-1.5">
                Mobile Number <Text className="text-rose-500">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {/* Country Code Picker Button */}
                <TouchableOpacity
                  onPress={() => setCountryModalVisible(true)}
                  className="bg-slate-800 px-3 py-3 rounded-xl border border-slate-700 flex-row items-center gap-1.5"
                >
                  <View className="bg-brand-500/20 px-1.5 py-0.5 rounded">
                    <Text className="text-brand-400 font-bold text-xs">
                      {selectedCountry.code}
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-medium">
                    {selectedCountry.dialCode}
                  </Text>
                  <ChevronDown size={14} color="#94a3b8" />
                </TouchableOpacity>

                {/* Phone Number Input */}
                <View className="flex-1 relative justify-center">
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="9876543210"
                    placeholderTextColor="#64748b"
                    className="bg-slate-800 text-white px-3 py-3 rounded-xl border border-slate-700 text-sm font-medium"
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={busy}
                className="mt-5 bg-brand-600 hover:bg-brand-700 py-3.5 rounded-xl items-center flex-row justify-center"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-sm mr-2">
                      Send Verification Code
                    </Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-slate-300 text-xs font-medium mb-1.5">
                Verification Code (OTP)
              </Text>
              <View className="relative justify-center">
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#64748b"
                  className="bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 text-sm tracking-widest font-mono"
                  autoFocus
                />
                <KeyRound
                  size={18}
                  color="#64748b"
                  style={{ position: "absolute", left: 14 }}
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={busy}
                className="mt-5 bg-brand-600 hover:bg-brand-700 py-3.5 rounded-xl items-center"
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
                className="mt-4 items-center"
              >
                <Text className="text-slate-400 text-xs hover:text-white">
                  Change phone number
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer info */}
        <Text className="text-slate-500 text-xs text-center mt-6">
          🔒 Private, discrete, & secure. No profiles shared without your consent.
        </Text>
      </ScrollView>

      {/* Country Code Modal */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
              <Text className="text-white font-bold text-base">Select Country Code</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Search box */}
            <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 my-3 border border-slate-700">
              <Search size={16} color="#64748b" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search country or code..."
                placeholderTextColor="#64748b"
                className="flex-1 text-white text-xs ml-2"
              />
            </View>

            {/* Country list */}
            <ScrollView className="space-y-1">
              {filteredCountries.map((c) => {
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
                      isSelected ? "bg-brand-600/20 border border-brand-500/40" : "hover:bg-slate-800"
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <Text className="text-brand-400 font-bold text-xs">{c.code}</Text>
                      </View>
                      <Text className="text-white text-xs font-medium">{c.name}</Text>
                    </View>
                    <Text className="text-slate-400 font-mono text-xs font-bold">
                      {c.dialCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
