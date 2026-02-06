import { Tabs } from "expo-router";
import React from "react";
import { Mic, BookOpen, Settings, Sparkles } from "lucide-react-native";
import { FloatingTabBar } from "@/components/Navigation/FloatingTabBar";

export default function TabLayout() {

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Hide the default tab bar background since we perform custom floating one
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
