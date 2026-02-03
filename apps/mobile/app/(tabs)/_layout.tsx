import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => <FontAwesome5 name="microphone" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color }) => <FontAwesome5 name="book-open" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
