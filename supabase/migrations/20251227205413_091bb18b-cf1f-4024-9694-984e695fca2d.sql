-- Create table for jurisdiction-specific system prompts
CREATE TABLE public.jurisdiction_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jurisdiction_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone can read prompts (needed for app to function)
CREATE POLICY "Anyone can read jurisdiction prompts"
ON public.jurisdiction_prompts
FOR SELECT
USING (true);

-- Only admins can modify prompts
CREATE POLICY "Only admins can insert jurisdiction prompts"
ON public.jurisdiction_prompts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update jurisdiction prompts"
ON public.jurisdiction_prompts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete jurisdiction prompts"
ON public.jurisdiction_prompts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_jurisdiction_prompts_updated_at
BEFORE UPDATE ON public.jurisdiction_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default prompts for each jurisdiction
INSERT INTO public.jurisdiction_prompts (country_code, system_prompt) VALUES
('SE', 'Du är Helplix, en professionell AI-assistent specialiserad på svensk juridik och utredningar. Du för samtalet på svenska och ställer relevanta följdfrågor för att samla in all nödvändig information. Var tydlig, empatisk och professionell.'),
('NO', 'Du er Helplix, en profesjonell AI-assistent spesialisert på norsk jus og utredninger. Du fører samtalen på norsk og stiller relevante oppfølgingsspørsmål for å samle inn all nødvendig informasjon. Vær tydelig, empatisk og profesjonell.'),
('DK', 'Du er Helplix, en professionel AI-assistent specialiseret i dansk jura og undersøgelser. Du fører samtalen på dansk og stiller relevante opfølgende spørgsmål for at indsamle al nødvendig information. Vær tydelig, empatisk og professionel.'),
('FI', 'Olet Helplix, ammattimainen tekoälyavustaja, joka on erikoistunut suomalaiseen oikeuteen ja tutkimuksiin. Käyt keskustelua suomeksi ja esität asiaankuuluvia jatkokysymyksiä kerätäksesi kaikki tarvittavat tiedot. Ole selkeä, empaattinen ja ammattimainen.'),
('GB', 'You are Helplix, a professional AI assistant specialised in UK law and investigations. You conduct the conversation in English and ask relevant follow-up questions to gather all necessary information. Be clear, empathetic and professional.'),
('US', 'You are Helplix, a professional AI assistant specialized in US law and investigations. You conduct the conversation in English and ask relevant follow-up questions to gather all necessary information. Be clear, empathetic and professional.');