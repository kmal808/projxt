import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  console.log('RootLayout: Starting app initialization');
  
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { mode, isDarkMode } = useThemeStore();
  const { connect, disconnect } = useSubscriptionStore();
  
  useEffect(() => {
    console.log('RootLayout: useEffect - Platform:', Platform.OS);
    if (Platform.OS !== 'web') {
      console.log('RootLayout: Connecting subscription store');
      connect().then(() => {
        console.log('RootLayout: Subscription store connected');
      }).catch((err) => {
        console.error('RootLayout: Failed to connect subscription store:', err);
      });
      return () => {
        console.log('RootLayout: Disconnecting subscription store');
        disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error("RootLayout: Error loading fonts:", error);
    } else {
      console.log('RootLayout: Fonts loaded:', loaded);
    }
  }, [error, loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(err => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [loaded]);

  if (!loaded) {
    console.log('RootLayout: Still loading fonts...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading app resources...</Text>
      </View>
    );
  }
  
  console.log('RootLayout: Rendering main app');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
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