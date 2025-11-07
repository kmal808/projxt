# Supabase Authentication Setup

Your authentication flow has been updated with better error handling and logging. However, to make it work properly, you need to configure Supabase settings.

## Critical Settings in Supabase Dashboard

1. **Disable Email Confirmation (for testing/development)**
   - Go to your Supabase project dashboard
   - Navigate to: **Authentication** → **Settings** → **Auth Settings**
   - Find the **Enable email confirmations** toggle
   - **Turn it OFF** for development/testing
   - This allows users to sign in immediately after registration

2. **Configure Email Templates (for production)**
   - If you want email verification in production:
   - Go to: **Authentication** → **Email Templates**
   - Customize the confirmation email template
   - Set up an SMTP provider for reliable email delivery
   - Note: By default, Supabase uses a limited email service that may not send emails reliably

## Testing Authentication

### Creating a Test User (Two Methods)

**Method 1: Via App Registration**
1. Open the app
2. Click "Create Account" on the login screen
3. Fill in the registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: (at least 8 characters)
   - Confirm Password: (same as above)
4. Click "Create Account"
5. You should see "Registration Successful"
6. Try logging in with the same credentials

**Method 2: Via Supabase Dashboard**
1. Go to: **Authentication** → **Users**
2. Click "Add User"
3. Enter:
   - Email: test@example.com
   - Password: testpassword123
   - **IMPORTANT:** Check "Auto Confirm User" box
4. Click "Create User"
5. The user profile will be created automatically via database trigger
6. Try logging in with these credentials in the app

## Troubleshooting

### Issue: "Email not confirmed"
- Solution: Disable email confirmations in Supabase settings (step 1 above)
- Or when creating users in dashboard, check "Auto Confirm User"

### Issue: "Invalid credentials" after creating user in dashboard
- Check that you checked "Auto Confirm User" when creating the user
- Try resetting the password for that user in the Supabase dashboard
- Or create a new user with a different email

### Issue: Registration works but login fails
- Check the browser/app console for detailed error logs
- Verify the user exists in: **Authentication** → **Users**
- Check if the user has a profile in the **Table Editor** → **users** table
- The trigger should create the profile automatically

### Issue: "No profile found for user"
- This means the database trigger didn't fire
- Check that the trigger exists: **Database** → **Triggers** → **on_auth_user_created**
- Manually create the profile in **Table Editor** → **users** if needed

## Current Implementation Details

The authentication flow now:
1. Uses detailed console logging to help debug issues
2. Waits 1 second after signup for the database trigger to create the user profile
3. Updates (not inserts) the user profile to avoid conflicts with the trigger
4. Returns clear error messages when something goes wrong

## Production Checklist

Before deploying to production:
- [ ] Enable email confirmations
- [ ] Set up custom email templates
- [ ] Configure SMTP provider for reliable email delivery
- [ ] Set up proper password reset flow
- [ ] Consider adding social authentication (Google, Apple, etc.)
- [ ] Set up proper error tracking (Sentry, etc.)
