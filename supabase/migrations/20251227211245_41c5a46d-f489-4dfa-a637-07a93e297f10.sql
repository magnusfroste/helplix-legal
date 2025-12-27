-- Create table for behavior guidelines (global + per jurisdiction)
CREATE TABLE public.behavior_guidelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT, -- NULL = global, otherwise jurisdiction-specific
  guideline_key TEXT NOT NULL,
  guideline_text TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, guideline_key)
);

-- Enable RLS
ALTER TABLE public.behavior_guidelines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read behavior guidelines" 
ON public.behavior_guidelines 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert behavior guidelines" 
ON public.behavior_guidelines 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update behavior guidelines" 
ON public.behavior_guidelines 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete behavior guidelines" 
ON public.behavior_guidelines 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_behavior_guidelines_updated_at
BEFORE UPDATE ON public.behavior_guidelines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert global behavior guidelines
INSERT INTO public.behavior_guidelines (country_code, guideline_key, guideline_text, sort_order) VALUES
(NULL, 'empathy', 'Var alltid empatisk och tålmodig - kom ihåg att användaren kan vara äldre eller i en stressig situation.', 1),
(NULL, 'concise', 'Håll dina svar koncisa men varma.', 2),
(NULL, 'acknowledge', 'Efter att ha fått information, bekräfta kort och ställ sedan nästa fråga.', 3),
(NULL, 'no_legal_advice', 'Ge aldrig juridisk rådgivning - samla endast information för dokumentation.', 4),
(NULL, 'one_question', 'Ställ en fråga i taget för att inte överväldiga användaren.', 5),
(NULL, 'clarify', 'Om något är oklart, be om förtydligande innan du går vidare.', 6);