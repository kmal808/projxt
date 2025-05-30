import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { Home, Users, Clipboard, Package, Settings, FolderOpen } from "lucide-react-native";

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isField = user?.role === 'field';
  const isOffice = user?.role === 'office';
  const isSales = user?.role === 'sales';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      {(isAdmin || isManager || !user) && (
        <Tabs.Screen
          name="projects"
          options={{
            title: "Projects",
            tabBarIcon: ({ color, size }) => <Clipboard size={size} color={color} />,
          }}
        />
      )}
      
      {(isAdmin || isManager || !user) && (
        <Tabs.Screen
          name="crews"
          options={{
            title: "Crews",
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
      )}
      
      {(isAdmin || isOffice || !user) && (
        <Tabs.Screen
          name="files"
          options={{
            title: "Files",
            tabBarIcon: ({ color, size }) => <FolderOpen size={size} color={color} />,
          }}
        />
      )}
      
      {(isField || isOffice || !user) && (
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
      )}
      
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}