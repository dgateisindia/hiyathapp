import { COLORS } from "@/constants";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendResetCode = async () => {
    if (!isLoaded || !email) return;

    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setCodeSent(true);
    } catch (err) {
      console.log("SEND CODE ERROR:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });

        router.replace("/");
      }
    } catch (err) {
      console.log("RESET ERROR:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white justify-center"
      style={{ padding: 28 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 z-10"
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {!codeSent ? (
        <>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">
              Forgot Password
            </Text>

            <Text className="text-secondary text-center">
              Enter your email to receive a verification code.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-primary font-medium mb-2">
              Email
            </Text>

            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="user@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Pressable
            className={`w-full py-4 rounded-full items-center ${
              loading || !email
                ? "bg-gray-300"
                : "bg-primary"
            }`}
            disabled={loading || !email}
            onPress={sendResetCode}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Send Code
              </Text>
            )}
          </Pressable>
        </>
      ) : (
        <>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">
              Reset Password
            </Text>

            <Text className="text-secondary text-center">
              Enter the verification code and your new password.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-primary font-medium mb-2">
              Verification Code
            </Text>

            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
              placeholder="123456"
              keyboardType="number-pad"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
            />
          </View>

          <View className="mb-6">
            <Text className="text-primary font-medium mb-2">
              New Password
            </Text>

            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary"
              placeholder="********"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <Pressable
            className={`w-full py-4 rounded-full items-center ${
              loading || !code || !newPassword
                ? "bg-gray-300"
                : "bg-primary"
            }`}
            disabled={loading || !code || !newPassword}
            onPress={resetPassword}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Reset Password
              </Text>
            )}
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}