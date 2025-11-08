-- Create leaderboard profiles table for anonymized display
CREATE TABLE IF NOT EXISTS public.leaderboard_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'US',
  avatar_emoji TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leaderboard_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view visible leaderboard profiles"
  ON public.leaderboard_profiles
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can update own leaderboard profile"
  ON public.leaderboard_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard profile"
  ON public.leaderboard_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create game_type_earnings table for per-game leaderboards
CREATE TABLE IF NOT EXISTS public.game_type_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL,
  total_earned NUMERIC(10, 2) DEFAULT 0.00,
  actions_completed INTEGER DEFAULT 0,
  last_played TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- Enable RLS
ALTER TABLE public.game_type_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all game type earnings"
  ON public.game_type_earnings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own game earnings"
  ON public.game_type_earnings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game earnings"
  ON public.game_type_earnings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_game_type_earnings_leaderboard 
  ON public.game_type_earnings(game_type, total_earned DESC);

-- Function to get user's rank
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID, p_game_type TEXT)
RETURNS TABLE(rank BIGINT, total_earned NUMERIC) AS $$
BEGIN
  IF p_game_type IS NULL THEN
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY us.total_earned DESC) as rank,
      us.total_earned
    FROM user_stats us
    WHERE us.user_id = p_user_id;
  ELSE
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY gte.total_earned DESC) as rank,
      gte.total_earned
    FROM game_type_earnings gte
    WHERE gte.user_id = p_user_id AND gte.game_type = p_game_type;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at
CREATE TRIGGER update_leaderboard_profiles_updated_at
  BEFORE UPDATE ON public.leaderboard_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create leaderboard profile when user profile is created
CREATE OR REPLACE FUNCTION public.handle_new_leaderboard_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard_profiles (user_id, display_name, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.username, 'Player_' || FLOOR(RANDOM() * 10000)::TEXT),
    'US'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_leaderboard
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_leaderboard_profile();