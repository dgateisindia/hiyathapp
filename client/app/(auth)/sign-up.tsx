import { COLORS } from "@/constants";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const scrollViewRef = useRef<ScrollView>(null);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 300);
  };

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !emailAddress.trim() ||
      !password.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);

    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: false,
        });
      }, 100);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Sign Up",
        text2: err?.errors?.[0]?.message ?? "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    if (!code.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Code",
        text2: "Enter the verification code",
      });
      return;
    }

    setLoading(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({
          session: attempt.createdSessionId,
        });

        router.replace("/");
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Incomplete",
          text2: "Please check the verification code and try again",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Verify",
        text2: err?.errors?.[0]?.message ?? "Invalid verification code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: 30,
            paddingBottom: 320,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {!pendingVerification ? (
            <View className="w-full">
              {/* Back button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="mb-14 self-start"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-primary mb-2">
                  Create Account
                </Text>

                <Text className="text-secondary text-lg">
                  Sign up to get started
                </Text>
              </View>

              {/* First name */}
              <View className="mb-4">
                <Text className="text-primary font-medium mb-2">
                  First Name
                </Text>

                <TextInput
                  className="w-full bg-surface px-4 py-4 rounded-xl text-primary"
                  placeholder="John"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              {/* Last name */}
              <View className="mb-4">
                <Text className="text-primary font-medium mb-2">
                  Last Name
                </Text>

                <TextInput
                  className="w-full bg-surface px-4 py-4 rounded-xl text-primary"
                  placeholder="Doe"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-primary font-medium mb-2">
                  Email
                </Text>

                <TextInput
                  className="w-full bg-surface px-4 py-4 rounded-xl text-primary"
                  placeholder="user@example.com"
                  placeholderTextColor="#999"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-primary font-medium mb-2">
                  Password
                </Text>

                <TextInput
                  className="w-full bg-surface px-4 py-4 rounded-xl text-primary"
                  placeholder="********"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="done"
                  editable={!loading}
                  onFocus={scrollToBottom}
                  onSubmitEditing={onSignUpPress}
                />
              </View>

              {/* Continue button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-full items-center mb-8 ${
                  loading ? "bg-gray-500" : "bg-primary"
                }`}
                onPress={onSignUpPress}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login link */}
              <View className="flex-row justify-center pb-8">
                <Text className="text-secondary">
                  Already have an account?{" "}
                </Text>

                <Link href="/sign-in" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text className="text-primary font-bold">Login</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ) : (
            <View className="w-full">
              {/* Verification back button */}
              <TouchableOpacity
                onPress={() => {
                  setPendingVerification(false);
                  setCode("");
                }}
                className="mb-14 self-start"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              {/* Verification header */}
              <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-primary mb-2">
                  Verify Email
                </Text>

                <Text className="text-secondary text-center">
                  Enter the code sent to
                </Text>

                <Text className="text-primary font-medium text-center mt-1">
                  {emailAddress}
                </Text>
              </View>

              {/* Verification code */}
              <View className="mb-6">
                <TextInput
                  className="w-full bg-surface px-4 py-4 rounded-xl text-primary text-center tracking-widest"
                  placeholder="123456"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={(value) =>
                    setCode(value.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  onFocus={scrollToBottom}
                />
              </View>

              {/* Verify button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-full items-center ${
                  loading ? "bg-gray-500" : "bg-primary"
                }`}
                onPress={onVerifyPress}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}