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
} from "react-native";
import { useAuthStore } from "../stores/auth.store";
import { Heart, KeyRound, ArrowRight, ChevronDown, Search, X, AlertCircle } from "lucide-react-native";
import { ALL_COUNTRIES, CountryData } from "@everpride/shared";

export const AuthScreen: React.FC = () => {
  const { sendOtp, login, isLoading } = useAuthStore();
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

  // Clear inputs when component mounts / user lands on AuthScreen after signout
  useEffect(() => {
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setErrorMsg(null);
    setBusy(false);
  }, []);

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
      className="flex-1 bg-slate-50 justify-center px-6"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        {/* Brand Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center border border-rose-200 mb-3 shadow-sm">
            <Heart size={32} color="#e11d48" fill="#e11d48" />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ever<Text className="text-rose-600">Pride</Text>
          </Text>
          <Text className="text-slate-500 text-sm mt-1 text-center">
            Meaningful connections designed for our LGBTQ+ community
          </Text>
        </View>

        {/* Auth Form Card matching Web Login Modal */}
        <View className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <Text className="text-slate-900 text-lg font-bold mb-1">
            {otpSent ? "Verify Mobile Number" : "Sign in / Register"}
          </Text>
          <Text className="text-slate-500 text-xs mb-5">
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
        </View>

        {/* Footer info matching web */}
        <Text className="text-slate-500 text-xs text-center mt-6">
          🔒 Private, discrete, & secure. No profiles shared without your consent.
        </Text>
      </ScrollView>

      {/* Country Code Modal matching Web Search Picker */}
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
    </KeyboardAvoidingView>
  );
};
