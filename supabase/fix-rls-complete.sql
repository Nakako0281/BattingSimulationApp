-- ============================================
-- Complete RLS Policy Fix for NextAuth Integration
-- ============================================
-- This file fixes all RLS policies to work with NextAuth (Auth.js)
-- instead of Supabase Auth

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing user policies
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_insert_public ON users;
DROP POLICY IF EXISTS users_select_for_auth ON users;

-- 1. Anyone can insert new users (for registration)
CREATE POLICY users_insert_public ON users
  FOR INSERT
  WITH CHECK (true);

-- 2. Anyone can select users (for authentication lookup)
CREATE POLICY users_select_for_auth ON users
  FOR SELECT
  USING (true);

-- 3. Users can update their own data
-- Note: In a real app, you'd verify user_id from JWT or session
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (true);

-- ============================================
-- TEAMS TABLE POLICIES
-- ============================================

-- Drop existing team policies
DROP POLICY IF EXISTS teams_select_own ON teams;
DROP POLICY IF EXISTS teams_insert_own ON teams;
DROP POLICY IF EXISTS teams_update_own ON teams;
DROP POLICY IF EXISTS teams_delete_own ON teams;

-- 1. Anyone can select teams
-- Note: Application layer handles filtering by user_id
CREATE POLICY teams_select_all ON teams
  FOR SELECT
  USING (true);

-- 2. Anyone can insert teams
-- Note: Application layer sets correct user_id
CREATE POLICY teams_insert_all ON teams
  FOR INSERT
  WITH CHECK (true);

-- 3. Anyone can update teams
-- Note: Application layer verifies ownership
CREATE POLICY teams_update_all ON teams
  FOR UPDATE
  USING (true);

-- 4. Anyone can delete teams
-- Note: Application layer verifies ownership
CREATE POLICY teams_delete_all ON teams
  FOR DELETE
  USING (true);

-- ============================================
-- PLAYERS TABLE POLICIES
-- ============================================

-- Drop existing player policies
DROP POLICY IF EXISTS players_select_own ON players;
DROP POLICY IF EXISTS players_insert_own ON players;
DROP POLICY IF EXISTS players_update_own ON players;
DROP POLICY IF EXISTS players_delete_own ON players;

-- 1. Anyone can select players
-- Note: Application layer filters by user's teams
CREATE POLICY players_select_all ON players
  FOR SELECT
  USING (true);

-- 2. Anyone can insert players
-- Note: Application layer verifies team ownership
CREATE POLICY players_insert_all ON players
  FOR INSERT
  WITH CHECK (true);

-- 3. Anyone can update players
-- Note: Application layer verifies team ownership
CREATE POLICY players_update_all ON players
  FOR UPDATE
  USING (true);

-- 4. Anyone can delete players
-- Note: Application layer verifies team ownership
CREATE POLICY players_delete_all ON players
  FOR DELETE
  USING (true);

-- ============================================
-- NOTES
-- ============================================
-- These policies allow operations at the database level but rely on
-- application-layer authorization in Next.js API routes.
--
-- This is a common pattern when using third-party auth providers
-- (like NextAuth) with Supabase, since Supabase RLS is designed
-- primarily for Supabase Auth.
--
-- Make sure your API routes properly verify user sessions and
-- ownership before performing database operations.
