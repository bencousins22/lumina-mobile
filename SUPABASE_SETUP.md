# Supabase Setup Guide for Lumina

This guide will help you set up Supabase authentication for the Lumina application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js installed
- Lumina project cloned locally

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `lumina` (or your preferred name)
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to set up (1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll need three values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhbG...` (starts with eyJ)
   - **Service role key**: `eyJhbG...` (different key, keep this secret!)

## Step 3: Configure Environment Variables

1. In your Lumina project root, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   JWT_SECRET=your-secure-random-string-at-least-32-characters-long
   ```

3. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it for `JWT_SECRET`

## Step 4: Set Up Database Schema (Optional)

If you want to store additional user data, create a `users` table:

1. Go to **Table Editor** in Supabase
2. Click "Create a new table"
3. Use this SQL or use the UI:

```sql
-- Users table for extended user information
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 5: Configure Email Authentication

1. Go to **Authentication** → **Providers** in Supab ase
2. **Email** should be enabled by default
3. Configure email settings:
   - Disable "Confirm email" if you want to skip email verification during development
   - Enable "Confirm email" for production

### Production Email Configuration:
1. Go to **Authentication** → **Email Templates**
2. Customize the email templates:
   - Confirm signup
   - Magic link
   - Reset password
   
3. Go to **Project Settings** → **Auth** → **SMTP Settings**
4. Configure your email provider (SendGrid, AWS SES, etc.)

## Step 6: Create Your First User

### Option A: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Fill in:
   - Email: `admin@lumina.ai`
   - Password: Your secure password
   - Auto Confirm User: Yes (for development)
4. Click "Create user"

### Option B: Through the Lumina App
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000`
3. You'll see the login screen
4. Use the Supabase signup endpoint or create users through the dashboard

## Step 7: Add User to your users table (if using extended schema)

After creating a user through Supab ase Auth, add them to your users table:

```sql
INSERT INTO users (id, email, name, role)
SELECT id, email, email, 'admin'
FROM auth.users
WHERE email = 'admin@lumina.ai';
```

## Step 8: Test Authentication

1. Start your Lumina development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Log in with your credentials:
   - Email: `admin@lumina.ai`
   - Password: (your password)

4. You should be authenticated successfully!

## Troubleshooting

### "Invalid email or password" error
- Check that the user exists in Supabase Auth dashboard
- Verify email confirmation (if enabled)
- Check that environment variables are loaded correctly

### "Not authenticated" error
- Check browser cookies (access_token, refresh_token)
- Verify JWT_SECRET is set correctly
- Check Supabase service role key has correct permissions

### Environment variables not loading
- Restart your development server after changing `.env.local`
- Verify file is named exactly `.env.local` (not `.env.txt`, etc.)
- Check that values don't have quotes around them

### CORS errors
- Supabase should allow all origins by default
- If you have production URLs, add them in **Project Settings** → **API** → **Allowed origins**

## Security Best Practices

### For Development
- ✅ Use `.env.local` (git-ignored by default)
- ✅ Never commit API keys to git
- ✅ Use different Supabase projects for dev/staging/prod

### For Production
- ✅ Enable Row Level Security on all tables
- ✅ Enable email confirmation
- ✅ Configure rate limiting in Supabase
- ✅ Use custom SMTP provider
- ✅ Set up proper domain for auth callbacks
- ✅ Use strong JWT_SECRET (32+ characters, random)
- ✅ Enable 2FA for admin users
- ✅ Configure security headers in Next.js

## Additional Features

### Password Reset
Lumina supports password reset through Supabase. Users can:
1. Click "Forgot password" (to be implemented in Settings)
2. Receive reset email
3. Create new password

### Email Change
Users can change their email in Settings panel (to be implemented)

### OAuth Providers
You can enable additional login providers (Google, GitHub, etc.):
1. Go to **Authentication** → **Providers**
2. Enable desired providers
3. Configure OAuth credentials
4. Update login screen to show OAuth options

## Next Steps

- ✅ Authentication system is configured
- ✅ Users can log in/logout
- ✅ JWT tokens stored securely in httpOnly cookies
- ⏳ Implement password reset flow
- ⏳ Add OAuth providers if needed
- ⏳ Configure production email templates
- ⏳ Set up Row Level Security policies for all data tables

## Support

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Lumina Issues: [Your GitHub repository]
