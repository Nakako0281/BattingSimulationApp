# Environment Variables Guide

This document explains all environment variables required for the Baseball Batting Simulator application.

## Required Variables

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmno.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Your Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Auth.js Configuration

#### `NEXTAUTH_SECRET`
- **Description**: Secret key for Auth.js session encryption
- **Generation**: Run `openssl rand -base64 32` in terminal
- **Example**: `abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx`
- **Security**: Keep this secret! Never commit to version control

#### `NEXTAUTH_URL`
- **Description**: Base URL of your application
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Description**: Public-facing application URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Setup Instructions

### 1. Create .env.local file

```bash
cp .env.example .env.local
```

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Navigate to Settings → API
4. Copy Project URL to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy anon/public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Generate Auth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET`

### 4. Set Application URLs

For development:
```env
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Environment-Specific Files

- `.env.local` - Local development (gitignored)
- `.env.development` - Development defaults
- `.env.production` - Production defaults
- `.env.example` - Template file (committed to git)

## Security Best Practices

1. **Never commit** `.env.local` or any file containing actual secrets
2. **Rotate secrets** regularly, especially after team member changes
3. **Use different secrets** for development and production
4. **Limit access** to production environment variables
5. **Validate variables** on application startup

## Troubleshooting

### "Supabase client not configured"
- Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Ensure variables start with `NEXT_PUBLIC_` to be available in browser

### "Invalid session" or authentication errors
- Verify `NEXTAUTH_SECRET` is set and is a valid base64 string
- Check if `NEXTAUTH_URL` matches your application URL

### Variables not updating
- Restart the development server after changing `.env.local`
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`

## Reference

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Auth.js Configuration](https://authjs.dev/reference/configuration/auth-config)
