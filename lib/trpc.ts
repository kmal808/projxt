import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, httpLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { useAuthStore } from "@/store/auth-store";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

// Create a client with authentication
export const createTrpcClient = () => {
  const token = useAuthStore.getState().token;
  
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
        headers: () => {
          const headers: Record<string, string> = {};
          
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
      headers: () => {
        const token = useAuthStore.getState().token;
        const headers: Record<string, string> = {};
        
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }
        
        return headers;
      },
    }),
  ],
});