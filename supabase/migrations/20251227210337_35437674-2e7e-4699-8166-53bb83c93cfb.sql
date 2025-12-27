-- Add question_intensity column to jurisdiction_prompts
ALTER TABLE public.jurisdiction_prompts
ADD COLUMN question_intensity INTEGER NOT NULL DEFAULT 70
CHECK (question_intensity >= 0 AND question_intensity <= 100);

-- Add comment for clarity
COMMENT ON COLUMN public.jurisdiction_prompts.question_intensity IS 'Question intensity 0-100: higher = more detailed/thorough questions';