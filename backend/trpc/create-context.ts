import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'field' | 'office' | 'sales';
  isEmailVerified: boolean;
  createdAt: string;
}

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Get the authorization header
  const authHeader = opts.req.headers.get('authorization');
  
  // If there's no auth header, return context without user
  if (!authHeader) {
    return {
      req: opts.req,
      user: null,
    };
  }
  
  // Extract the token from the auth header
  const token = authHeader.split(' ')[1];
  
  // In a real implementation, you would:
  // 1. Verify the token (JWT, etc.)
  // 2. Get the user from your database
  
  // For now, we'll simulate these steps
  // This would be replaced with actual token verification and database queries
  let user: User | null = null;
  
  try {
    // Simulate token verification
    if (token) {
      // In production, you would verify the token and get the user ID
      // Then fetch the user from your database
      
      // Simulated user for development
      user = {
        id: "simulated-user-id",
        name: "Simulated User",
        email: "user@example.com",
        role: "field",
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };
    }
  } catch (error) {
    // Token verification failed
    console.error("Token verification failed:", error);
  }
  
  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Middleware to check if user is an admin
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(isAuthed);

// Admin procedure - requires admin role
export const adminProcedure = t.procedure.use(isAdmin);