import Header from "@/components/Header";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const settingsItems = [
  {
    id: "1",
    title: "Privacy Policy",
    icon: "shield-checkmark-outline",
  },
  {
    id: "2",
    title: "Terms & Conditions",
    icon: "document-text-outline",
  },
  {
    id: "3",
    title: "About App",
    icon: "information-circle-outline",
  },
  {
    id: "4",
    title: "Help & Support",
    icon: "help-circle-outline",
  },
];

export default function Settings() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="Settings" showBack />

      <View className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        <FlatList
          data={settingsItems}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-row items-center justify-between px-5 py-5 ${
                index !== settingsItems.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>

                <Text className="text-[15px] font-medium text-primary">
                  {item.title}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.secondary}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}