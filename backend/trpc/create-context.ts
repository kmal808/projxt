import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabase } from "../../lib/supabase";

// Define User type
interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
  company_id: string | null;
  created_at: string;
  updated_at: string;
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
  const token = authHeader.replace('Bearer ', '');
  
  let user: User | null = null;
  
  try {
    // Verify the JWT token with Supabase
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      console.error('Auth error:', authError);
      return {
        req: opts.req,
        user: null,
      };
    }
    
    // Get the user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return {
        req: opts.req,
        user: null,
      };
    }
    
    user = userProfile;
  } catch (error) {
    console.error('Token verification failed:', error);
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