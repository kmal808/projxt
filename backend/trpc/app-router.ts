import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { registerProcedure } from "./routes/auth/register";
import { loginProcedure } from "./routes/auth/login";
import { verifyEmailProcedure } from "./routes/auth/verify-email";
import { requestResetProcedure, resetPasswordProcedure } from "./routes/auth/reset-password";
import { inviteUserProcedure } from "./routes/auth/invite-user";
import { getCurrentUserProcedure, updateUserProcedure } from "./routes/auth/user";
import { 
  requestAdminAccessProcedure, 
  approveAdminRequestProcedure, 
  rejectAdminRequestProcedure 
} from "./routes/auth/admin";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
    verifyEmail: verifyEmailProcedure,
    requestPasswordReset: requestResetProcedure,
    resetPassword: resetPasswordProcedure,
    inviteUser: inviteUserProcedure,
    getCurrentUser: getCurrentUserProcedure,
    updateUser: updateUserProcedure,
    requestAdminAccess: requestAdminAccessProcedure,
    approveAdminRequest: approveAdminRequestProcedure,
    rejectAdminRequest: rejectAdminRequestProcedure,
  }),
});

export type AppRouter = typeof appRouter;