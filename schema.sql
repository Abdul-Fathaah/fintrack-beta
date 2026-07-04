-- FinTrack Database Schema and Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor to initialize or audit the database tables.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  monthly_savings_target NUMERIC DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 2. OBLIGATIONS TABLE
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_recurring BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;

-- Obligations Policies
CREATE POLICY "Users can manage own obligations" 
  ON public.obligations FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
  category TEXT NOT NULL,
  date DATE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
CREATE POLICY "Users can manage own transactions" 
  ON public.transactions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
