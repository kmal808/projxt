import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, httpLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "./supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback for development
  console.warn('EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
  return 'http://localhost:8081';
};

// Get auth token from Supabase
const getAuthToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create a client with authentication
export const createTrpcClient = () => {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) => 
          process.env.NODE_ENV === "development" || 
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers: async () => {
          const headers: Record<string, string> = {};
          const token = await getAuthToken();
          
          if (token) {
            headers.authorization = `Bearer ${token}`;
          }
          
          return headers;
        },
      }),
    ],
  });
};

// Create a client without authentication for direct use
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        const headers: Record<string, string> = {};
        const token = await getAuthToken();
        
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }
        
        return headers;
      },
    }),
  ],
});