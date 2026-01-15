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
  const isProjectManager = user?.role === 'project_manager';
  const isCrewLeader = user?.role === 'crew_leader';
  const isWorker = user?.role === 'worker';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      
      {(isAdmin || isProjectManager || !user) && (
        <Tabs.Screen
          name="projects"
          options={{
            title: "Projects",
            tabBarIcon: ({ color }) => <Clipboard size={22} color={color} />,
          }}
        />
      )}
      
      {(isAdmin || isProjectManager || !user) && (
        <Tabs.Screen
          name="crews"
          options={{
            title: "Crews",
            tabBarIcon: ({ color }) => <Users size={22} color={color} />,
          }}
        />
      )}
      
      {(isAdmin || isProjectManager || isCrewLeader || !user) && (
        <Tabs.Screen
          name="files"
          options={{
            title: "Files",
            tabBarIcon: ({ color }) => <FolderOpen size={22} color={color} />,
          }}
        />
      )}
      
      {(isAdmin || isProjectManager || isCrewLeader || isWorker || !user) && (
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color }) => <Package size={22} color={color} />,
          }}
        />
      )}
      
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}