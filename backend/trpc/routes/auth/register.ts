import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { generateUUID } from '@/utils/uuid';

// Define validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  title: z.string().optional(),
  inviteCode: z.string().optional(),
  role: z.enum(['admin', 'manager', 'field', 'office', 'sales']).optional(),
});

export const registerProcedure = publicProcedure
  .input(registerSchema)
  .mutation(async ({ input, ctx }) => {
    // In a real implementation, you would:
    // 1. Check if the email already exists in your database
    // 2. Hash the password (using bcrypt or similar)
    // 3. Create the user in your database
    // 4. Generate a verification token
    // 5. Send a verification email
    
    // For now, we'll simulate these steps
    const { name, email, password, phone, title, inviteCode, role = 'field' } = input;
    
    // Generate a user ID
    const userId = generateUUID();
    
    // Generate a verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    // Create user object
    const user = {
      id: userId,
      name,
      email,
      role: role,
      phone,
      title,
      isEmailVerified: false,
      createdAt: new Date().toISOString()
    };
    
    // In a real implementation, you would save this user to your database
    // For now, we'll just return the user and verification token
    
    return {
      success: true,
      user,
      verificationToken,
      message: "Registration successful. Please verify your email."
    };
  });