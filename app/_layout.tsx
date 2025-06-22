import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { useThemeStore } from "@/store/theme-store";
import { useSubscriptionStore } from "@/store/subscription-store";

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  initialRouteName: "index",
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn("Error preventing splash screen auto hide:", err);
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { mode, isDarkMode } = useThemeStore();
  const { connect, disconnect } = useSubscriptionStore();
  
  useEffect(() => {
    if (Platform.OS !== 'web') {
      connect();
      return () => {
        disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(err => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading app resources...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: true, title: "Profile" }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: true, title: "Project Details" }} />
      <Stack.Screen name="crew/[id]" options={{ headerShown: true, title: "Crew Details" }} />
      <Stack.Screen name="payroll" options={{ headerShown: true, title: "Payroll Calculator" }} />
      <Stack.Screen name="inventory" options={{ headerShown: true, title: "Inventory Management" }} />
      <Stack.Screen name="configurator" options={{ headerShown: true, title: "Product Configurator" }} />
      <Stack.Screen name="privacy-security" options={{ headerShown: false, title: "Privacy & Security" }} />
      <Stack.Screen name="subscription" options={{ headerShown: true, title: "Subscription" }} />
    </Stack>
  );
}