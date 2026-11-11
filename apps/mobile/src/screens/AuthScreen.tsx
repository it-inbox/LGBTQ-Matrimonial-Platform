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
} from "react-native";
import { useAuthStore } from "../stores/auth.store";
import { Heart, Phone, KeyRound, ArrowRight } from "lucide-react-native";

export const AuthScreen: React.FC = () => {
  const { sendOtp, login, isLoading } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg("Please enter a valid phone number with country code.");
      return;
    }
    setErrorMsg(null);
    setBusy(true);
    try {
      await sendOtp(phoneNumber.trim());
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
    setErrorMsg(null);
    setBusy(true);
    try {
      await login(phoneNumber.trim(), otp.trim());
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
              ? `Enter the verification code sent to ${phoneNumber}`
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
                Phone Number (with country code)
              </Text>
              <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 mb-5">
                <Phone size={18} color="#94a3b8" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+919876543210"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  className="flex-1 text-white text-sm ml-2.5"
                />
              </View>

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={busy}
                className="bg-brand-600 hover:bg-brand-500 py-3.5 rounded-xl items-center flex-row justify-center"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-semibold text-sm">Send Code</Text>
                    <ArrowRight size={16} color="#ffffff" className="ml-1" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-slate-300 text-xs font-medium mb-1.5">
                Verification Code (OTP)
              </Text>
              <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 mb-5">
                <KeyRound size={18} color="#94a3b8" />
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 text-white text-sm ml-2.5"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={busy}
                className="bg-brand-600 py-3.5 rounded-xl items-center flex-row justify-center mb-3"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOtpSent(false)}
                className="py-2 items-center"
              >
                <Text className="text-slate-400 text-xs">
                  Change phone number
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text className="text-slate-500 text-xs text-center mt-6">
          🔒 Private, discrete, & secure. No profiles shared without your consent.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

