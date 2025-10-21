-- Create individual_responses table to track each action
CREATE TABLE public.individual_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_session_id UUID,
  game_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  response_data JSONB NOT NULL,
  reward_earned NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own responses"
  ON public.individual_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own responses"
  ON public.individual_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_individual_responses_user_id ON public.individual_responses(user_id);
CREATE INDEX idx_individual_responses_game_session ON public.individual_responses(game_session_id);