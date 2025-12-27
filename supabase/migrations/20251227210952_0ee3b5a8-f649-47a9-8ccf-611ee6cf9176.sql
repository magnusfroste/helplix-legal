-- Create table for phase instructions per jurisdiction
CREATE TABLE public.phase_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  phase TEXT NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, phase)
);

-- Enable RLS
ALTER TABLE public.phase_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read phase instructions" 
ON public.phase_instructions 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert phase instructions" 
ON public.phase_instructions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update phase instructions" 
ON public.phase_instructions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete phase instructions" 
ON public.phase_instructions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_phase_instructions_updated_at
BEFORE UPDATE ON public.phase_instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default phase instructions for each country
INSERT INTO public.phase_instructions (country_code, phase, instruction) VALUES
-- Sweden
('SE', 'opening', '**Mål:** Låt användaren berätta sin historia fritt
**Fokus på:**
- Ställ öppna frågor som "Kan du berätta vad som hänt?"
- Låt användaren tala fritt utan avbrott
- Lyssna efter nyckelteman och inblandade parter
- Bygg förtroende och rapport
- Få en överblick av situationen'),
('SE', 'timeline', '**Mål:** Bygg kronologisk förståelse
**Fokus på:**
- Fråga "När började detta?" och "När hände X?"
- Be om specifika datum, tider eller tidsramar
- Bygg en kronologisk sekvens av händelser
- Identifiera deadlines eller tidskritiska frågor
- Kartlägg situationens utveckling'),
('SE', 'details', '**Mål:** Fördjupa dig i specifika detaljer
**Fokus på:**
- Fråga "Vem var inblandad?" och "Var hände detta?"
- Be om specifika namn, titlar och roller
- Klargör platser och miljöer
- Förstå "hur" för varje händelse
- Utforska motiv och sammanhang'),
('SE', 'legal', '**Mål:** Identifiera juridiska frågor och ramverk
**Fokus på:**
- Fråga om avtal, överenskommelser eller skriftliga villkor
- Identifiera juridiska relationer (arbetsgivare-anställd, hyresvärd-hyresgäst, etc.)
- Utforska skyldigheter och rättigheter
- Leta efter potentiella överträdelser
- Förstå relevanta lagar och regler'),
('SE', 'evidence', '**Mål:** Samla dokumentation och vittnen
**Fokus på:**
- Fråga "Har du några dokument relaterade till detta?"
- Be om e-post, meddelanden, avtal, kvitton
- Identifiera potentiella vittnen
- Leta efter foton, videor eller inspelningar
- Hitta kommunikationshistorik'),
('SE', 'impact', '**Mål:** Bedöm skador och effekter
**Fokus på:**
- Fråga "Hur har detta påverkat dig ekonomiskt?"
- Utforska emotionell och psykologisk påverkan
- Identifiera pågående konsekvenser
- Kvantifiera förluster där möjligt
- Förstå framtida implikationer'),
('SE', 'closing', '**Mål:** Fyll luckor och sammanfatta
**Fokus på:**
- Granska eventuella luckor i berättelsen
- Ställ klargörande frågor
- Bekräfta nyckelfakta
- Adressera saknad information
- Förbered användaren för rapportgenerering'),

-- USA
('US', 'opening', '**Objective:** Let the user tell their story freely
**Focus on:**
- Ask open-ended questions like "Can you tell me what happened?"
- Let the user speak freely without interruption
- Listen for key themes and parties involved
- Build trust and rapport
- Get an overview of the situation'),
('US', 'timeline', '**Objective:** Build chronological understanding
**Focus on:**
- Ask "When did this start?" and "When did X happen?"
- Request specific dates, times, or timeframes
- Build a chronological sequence of events
- Identify any deadlines or time-sensitive issues
- Map the progression of the situation'),
('US', 'details', '**Objective:** Deep dive into specifics
**Focus on:**
- Ask "Who was involved?" and "Where did this happen?"
- Request specific names, titles, and roles
- Clarify locations and settings
- Understand the "how" of each event
- Explore motivations and context'),
('US', 'legal', '**Objective:** Identify legal issues and frameworks
**Focus on:**
- Ask about contracts, agreements, or written terms
- Identify legal relationships (employer-employee, landlord-tenant, etc.)
- Explore obligations and rights
- Look for potential violations or breaches
- Understand relevant laws and regulations'),
('US', 'evidence', '**Objective:** Gather documentation and witnesses
**Focus on:**
- Ask "Do you have any documents related to this?"
- Request emails, messages, contracts, receipts
- Identify potential witnesses
- Look for photos, videos, or recordings
- Find communication records'),
('US', 'impact', '**Objective:** Assess damages and effects
**Focus on:**
- Ask "How has this affected you financially?"
- Explore emotional and psychological impact
- Identify ongoing consequences
- Quantify losses where possible
- Understand future implications'),
('US', 'closing', '**Objective:** Fill gaps and summarize
**Focus on:**
- Review any gaps in the story
- Ask clarifying questions
- Confirm key facts
- Address any missing information
- Prepare user for report generation'),

-- Brazil
('BR', 'opening', '**Objetivo:** Deixe o usuário contar sua história livremente
**Foco em:**
- Faça perguntas abertas como "Pode me contar o que aconteceu?"
- Deixe o usuário falar livremente sem interrupção
- Ouça temas-chave e partes envolvidas
- Construa confiança e relacionamento
- Obtenha uma visão geral da situação'),
('BR', 'timeline', '**Objetivo:** Construir entendimento cronológico
**Foco em:**
- Pergunte "Quando isso começou?" e "Quando X aconteceu?"
- Peça datas, horários ou prazos específicos
- Construa uma sequência cronológica de eventos
- Identifique prazos ou questões sensíveis ao tempo
- Mapeie a progressão da situação'),
('BR', 'details', '**Objetivo:** Aprofundar nos detalhes
**Foco em:**
- Pergunte "Quem estava envolvido?" e "Onde isso aconteceu?"
- Peça nomes, títulos e funções específicos
- Esclareça locais e ambientes
- Entenda o "como" de cada evento
- Explore motivações e contexto'),
('BR', 'legal', '**Objetivo:** Identificar questões e estruturas legais
**Foco em:**
- Pergunte sobre contratos, acordos ou termos escritos
- Identifique relações jurídicas (empregador-empregado, locador-locatário, etc.)
- Explore obrigações e direitos
- Procure violações ou descumprimentos potenciais
- Entenda leis e regulamentos relevantes'),
('BR', 'evidence', '**Objetivo:** Reunir documentação e testemunhas
**Foco em:**
- Pergunte "Você tem algum documento relacionado a isso?"
- Peça e-mails, mensagens, contratos, recibos
- Identifique testemunhas potenciais
- Procure fotos, vídeos ou gravações
- Encontre registros de comunicação'),
('BR', 'impact', '**Objetivo:** Avaliar danos e efeitos
**Foco em:**
- Pergunte "Como isso afetou você financeiramente?"
- Explore impacto emocional e psicológico
- Identifique consequências em andamento
- Quantifique perdas quando possível
- Entenda implicações futuras'),
('BR', 'closing', '**Objetivo:** Preencher lacunas e resumir
**Foco em:**
- Revise lacunas na história
- Faça perguntas esclarecedoras
- Confirme fatos-chave
- Aborde informações faltantes
- Prepare o usuário para geração do relatório'),

-- Mexico
('MX', 'opening', '**Objetivo:** Deja que el usuario cuente su historia libremente
**Enfócate en:**
- Haz preguntas abiertas como "¿Puede contarme qué pasó?"
- Deja que el usuario hable libremente sin interrupción
- Escucha temas clave y partes involucradas
- Construye confianza y rapport
- Obtén una visión general de la situación'),
('MX', 'timeline', '**Objetivo:** Construir comprensión cronológica
**Enfócate en:**
- Pregunta "¿Cuándo empezó esto?" y "¿Cuándo pasó X?"
- Solicita fechas, horas o plazos específicos
- Construye una secuencia cronológica de eventos
- Identifica plazos o asuntos sensibles al tiempo
- Mapea la progresión de la situación'),
('MX', 'details', '**Objetivo:** Profundizar en los detalles
**Enfócate en:**
- Pregunta "¿Quién estuvo involucrado?" y "¿Dónde pasó esto?"
- Solicita nombres, títulos y roles específicos
- Aclara ubicaciones y entornos
- Entiende el "cómo" de cada evento
- Explora motivaciones y contexto'),
('MX', 'legal', '**Objetivo:** Identificar cuestiones y marcos legales
**Enfócate en:**
- Pregunta sobre contratos, acuerdos o términos escritos
- Identifica relaciones legales (empleador-empleado, arrendador-arrendatario, etc.)
- Explora obligaciones y derechos
- Busca violaciones o incumplimientos potenciales
- Entiende leyes y regulaciones relevantes'),
('MX', 'evidence', '**Objetivo:** Reunir documentación y testigos
**Enfócate en:**
- Pregunta "¿Tiene algún documento relacionado con esto?"
- Solicita correos, mensajes, contratos, recibos
- Identifica testigos potenciales
- Busca fotos, videos o grabaciones
- Encuentra registros de comunicación'),
('MX', 'impact', '**Objetivo:** Evaluar daños y efectos
**Enfócate en:**
- Pregunta "¿Cómo le ha afectado esto financieramente?"
- Explora impacto emocional y psicológico
- Identifica consecuencias en curso
- Cuantifica pérdidas cuando sea posible
- Entiende implicaciones futuras'),
('MX', 'closing', '**Objetivo:** Llenar vacíos y resumir
**Enfócate en:**
- Revisa vacíos en la historia
- Haz preguntas aclaratorias
- Confirma hechos clave
- Aborda información faltante
- Prepara al usuario para la generación del reporte'),

-- Dominican Republic
('DO', 'opening', '**Objetivo:** Deja que el usuario cuente su historia libremente
**Enfócate en:**
- Haz preguntas abiertas como "¿Puede contarme qué pasó?"
- Deja que el usuario hable libremente sin interrupción
- Escucha temas clave y partes involucradas
- Construye confianza y rapport
- Obtén una visión general de la situación'),
('DO', 'timeline', '**Objetivo:** Construir comprensión cronológica
**Enfócate en:**
- Pregunta "¿Cuándo empezó esto?" y "¿Cuándo pasó X?"
- Solicita fechas, horas o plazos específicos
- Construye una secuencia cronológica de eventos
- Identifica plazos o asuntos sensibles al tiempo
- Mapea la progresión de la situación'),
('DO', 'details', '**Objetivo:** Profundizar en los detalles
**Enfócate en:**
- Pregunta "¿Quién estuvo involucrado?" y "¿Dónde pasó esto?"
- Solicita nombres, títulos y roles específicos
- Aclara ubicaciones y entornos
- Entiende el "cómo" de cada evento
- Explora motivaciones y contexto'),
('DO', 'legal', '**Objetivo:** Identificar cuestiones y marcos legales
**Enfócate en:**
- Pregunta sobre contratos, acuerdos o términos escritos
- Identifica relaciones legales (empleador-empleado, arrendador-arrendatario, etc.)
- Explora obligaciones y derechos
- Busca violaciones o incumplimientos potenciales
- Entiende leyes y regulaciones relevantes'),
('DO', 'evidence', '**Objetivo:** Reunir documentación y testigos
**Enfócate en:**
- Pregunta "¿Tiene algún documento relacionado con esto?"
- Solicita correos, mensajes, contratos, recibos
- Identifica testigos potenciales
- Busca fotos, videos o grabaciones
- Encuentra registros de comunicación'),
('DO', 'impact', '**Objetivo:** Evaluar daños y efectos
**Enfócate en:**
- Pregunta "¿Cómo le ha afectado esto financieramente?"
- Explora impacto emocional y psicológico
- Identifica consecuencias en curso
- Cuantifica pérdidas cuando sea posible
- Entiende implicaciones futuras'),
('DO', 'closing', '**Objetivo:** Llenar vacíos y resumir
**Enfócate en:**
- Revisa vacíos en la historia
- Haz preguntas aclaratorias
- Confirma hechos clave
- Aborda información faltante
- Prepara al usuario para la generación del reporte'),

-- Netherlands
('NL', 'opening', '**Doel:** Laat de gebruiker zijn verhaal vrij vertellen
**Focus op:**
- Stel open vragen zoals "Kunt u me vertellen wat er is gebeurd?"
- Laat de gebruiker vrij spreken zonder onderbreking
- Luister naar belangrijke thema''s en betrokken partijen
- Bouw vertrouwen en rapport op
- Krijg een overzicht van de situatie'),
('NL', 'timeline', '**Doel:** Bouw chronologisch begrip
**Focus op:**
- Vraag "Wanneer begon dit?" en "Wanneer gebeurde X?"
- Vraag om specifieke data, tijden of tijdframes
- Bouw een chronologische volgorde van gebeurtenissen
- Identificeer deadlines of tijdgevoelige kwesties
- Breng de progressie van de situatie in kaart'),
('NL', 'details', '**Doel:** Verdiep je in de details
**Focus op:**
- Vraag "Wie was erbij betrokken?" en "Waar gebeurde dit?"
- Vraag om specifieke namen, titels en rollen
- Verduidelijk locaties en omgevingen
- Begrijp het "hoe" van elke gebeurtenis
- Verken motivaties en context'),
('NL', 'legal', '**Doel:** Identificeer juridische kwesties en kaders
**Focus op:**
- Vraag naar contracten, overeenkomsten of schriftelijke voorwaarden
- Identificeer juridische relaties (werkgever-werknemer, verhuurder-huurder, etc.)
- Verken verplichtingen en rechten
- Zoek naar mogelijke overtredingen of schendingen
- Begrijp relevante wetten en regelgeving'),
('NL', 'evidence', '**Doel:** Verzamel documentatie en getuigen
**Focus op:**
- Vraag "Heeft u documenten gerelateerd aan dit?"
- Vraag om e-mails, berichten, contracten, bonnetjes
- Identificeer potentiële getuigen
- Zoek naar foto''s, video''s of opnames
- Vind communicatiegeschiedenis'),
('NL', 'impact', '**Doel:** Beoordeel schade en effecten
**Focus op:**
- Vraag "Hoe heeft dit u financieel beïnvloed?"
- Verken emotionele en psychologische impact
- Identificeer lopende gevolgen
- Kwantificeer verliezen waar mogelijk
- Begrijp toekomstige implicaties'),
('NL', 'closing', '**Doel:** Vul hiaten en vat samen
**Focus op:**
- Bekijk eventuele hiaten in het verhaal
- Stel verduidelijkende vragen
- Bevestig belangrijke feiten
- Adresseer ontbrekende informatie
- Bereid de gebruiker voor op rapportgeneratie');