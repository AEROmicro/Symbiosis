-- Symbiosis – Supabase Schema
-- Run this in your Supabase project's SQL Editor.

-- Portfolio entries (one row per symbol per user)
CREATE TABLE IF NOT EXISTS portfolio_entries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol     TEXT NOT NULL,
  shares     DOUBLE PRECISION NOT NULL,
  avg_price  DOUBLE PRECISION NOT NULL,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  source     TEXT DEFAULT 'manual',
  UNIQUE (user_id, symbol)
);

-- Row-level security: each user can only access their own rows
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own portfolio"
  ON portfolio_entries
  FOR ALL
  USING (auth.uid() = user_id);
