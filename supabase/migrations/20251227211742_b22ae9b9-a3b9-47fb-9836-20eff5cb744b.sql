-- Create table for report templates per jurisdiction
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'timeline', 'legal', 'interpretation'
  template_text TEXT NOT NULL,
  section_header TEXT NOT NULL, -- Localized header
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, report_type)
);

-- Enable RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read report templates" 
ON public.report_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert report templates" 
ON public.report_templates 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update report templates" 
ON public.report_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete report templates" 
ON public.report_templates 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_report_templates_updated_at
BEFORE UPDATE ON public.report_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates for Sweden
INSERT INTO public.report_templates (country_code, report_type, section_header, template_text) VALUES
('SE', 'timeline', 'Kronologisk Tidslinje', 'Skapa en tydlig, kronologisk tidslinje baserad på konversationen.

Format:
- Använd tydliga datumrubriker (om datum nämndes) eller relativa tidsmarkörer
- Lista händelser i kronologisk ordning
- Inkludera nyckelfakta: vem, vad, när, var
- Markera viktiga detaljer som kan vara juridiskt relevanta
- Var koncis men fullständig'),

('SE', 'legal', 'Juridisk Översikt', 'Skapa en professionell juridisk sammanfattning baserad på konversationen.

Inkludera:
1. **Sammanfattning**: Kort översikt av situationen (2-3 meningar)
2. **Inblandade parter**: Lista alla personer/enheter som nämnts
3. **Nyckelfakta**: Punktlista med de viktigaste fakta
4. **Potentiella juridiska frågor**: Identifiera möjliga juridiska ärenden (avtal, skador, rättighetsbrott, etc.)
5. **Relevant lagstiftning**: Nämn potentiellt tillämpliga lagar
6. **Rekommenderade nästa steg**: Föreslå vad användaren bör göra härnäst'),

('SE', 'interpretation', 'Juridisk Tolkning', '⚠️ **DISCLAIMER**: Detta är en AI-genererad juridisk analys avsedd ENDAST för utbildnings- och orienteringssyfte. Innehållet utgör INTE juridisk rådgivning.

Skapa en detaljerad juridisk tolkning och analys baserad på fakta i ärendet.

Inkludera följande sektioner:

### Juridisk bedömning
Ge en grundlig juridisk analys av situationen.

### Tillämplig lagstiftning
Lista och förklara relevanta lagar och förordningar.

### Relevant rättspraxis
Referera till relevant rättspraxis från jurisdiktionen.

### Juridisk argumentation
Presentera hur en jurist kan argumentera i detta ärende.

### Möjliga utfall
Analysera möjliga utfall: bästa fall, värsta fall, mest sannolikt.

### Processväg och nästa steg
Beskriv processvägen och rekommenderade åtgärder.'),

-- USA
('US', 'timeline', 'Chronological Timeline', 'Create a clear, chronological timeline of events based on the conversation.

Format:
- Use clear date headers (if dates were mentioned) or relative time markers
- List events in chronological order
- Include key facts: who, what, when, where
- Highlight important details that may be legally relevant
- Be concise but complete'),

('US', 'legal', 'Legal Overview', 'Create a professional legal case summary based on the conversation.

Include:
1. **Summary**: Brief overview of the situation (2-3 sentences)
2. **Parties Involved**: List all people/entities mentioned
3. **Key Facts**: Bullet points of the most important facts
4. **Potential Legal Issues**: Identify possible legal matters (contracts, damages, rights violations, etc.)
5. **Relevant Legislation**: Mention potentially applicable laws
6. **Recommended Next Steps**: Suggest what the user should do next'),

('US', 'interpretation', 'Legal Interpretation', '⚠️ **DISCLAIMER**: This is an AI-generated legal analysis intended ONLY for educational and informational purposes. The content does NOT constitute legal advice.

Create a detailed legal interpretation and analysis based on the case facts.

Include the following sections:

### Legal Assessment
Provide a thorough legal analysis of the situation.

### Applicable Legislation
List and explain relevant laws and regulations.

### Relevant Case Law and Precedents
Reference relevant case law from the jurisdiction.

### Legal Argumentation
Present how a lawyer might argue this case.

### Possible Outcomes
Analyze possible outcomes: best case, worst case, most likely.

### Procedural Path and Next Steps
Outline the procedural path and recommended actions.'),

-- Brazil
('BR', 'timeline', 'Linha do Tempo Cronológica', 'Crie uma linha do tempo clara e cronológica dos eventos com base na conversa.

Formato:
- Use cabeçalhos de data claros (se as datas foram mencionadas) ou marcadores de tempo relativos
- Liste os eventos em ordem cronológica
- Inclua fatos-chave: quem, o quê, quando, onde
- Destaque detalhes importantes que podem ser juridicamente relevantes
- Seja conciso mas completo'),

('BR', 'legal', 'Visão Geral Jurídica', 'Crie um resumo jurídico profissional com base na conversa.

Inclua:
1. **Resumo**: Breve visão geral da situação (2-3 frases)
2. **Partes Envolvidas**: Liste todas as pessoas/entidades mencionadas
3. **Fatos-Chave**: Pontos principais dos fatos mais importantes
4. **Questões Jurídicas Potenciais**: Identifique possíveis questões legais
5. **Legislação Relevante**: Mencione leis potencialmente aplicáveis
6. **Próximos Passos Recomendados**: Sugira o que o usuário deve fazer'),

('BR', 'interpretation', 'Interpretação Jurídica', '⚠️ **AVISO LEGAL**: Esta é uma análise jurídica gerada por IA destinada APENAS para fins educacionais e informativos. O conteúdo NÃO constitui aconselhamento jurídico.

Crie uma interpretação e análise jurídica detalhada com base nos fatos do caso.

Inclua as seguintes seções:

### Avaliação Jurídica
Forneça uma análise jurídica completa da situação.

### Legislação Aplicável
Liste e explique as leis e regulamentos relevantes.

### Jurisprudência Relevante
Faça referência a jurisprudência relevante.

### Argumentação Jurídica
Apresente como um advogado poderia argumentar este caso.

### Possíveis Resultados
Analise possíveis resultados: melhor caso, pior caso, mais provável.

### Caminho Processual e Próximos Passos
Descreva o caminho processual e ações recomendadas.'),

-- Mexico
('MX', 'timeline', 'Línea de Tiempo Cronológica', 'Crea una línea de tiempo clara y cronológica de los eventos basada en la conversación.

Formato:
- Usa encabezados de fecha claros (si se mencionaron fechas) o marcadores de tiempo relativos
- Lista los eventos en orden cronológico
- Incluye hechos clave: quién, qué, cuándo, dónde
- Resalta detalles importantes que pueden ser legalmente relevantes
- Sé conciso pero completo'),

('MX', 'legal', 'Resumen Legal', 'Crea un resumen legal profesional basado en la conversación.

Incluye:
1. **Resumen**: Breve descripción de la situación (2-3 oraciones)
2. **Partes Involucradas**: Lista todas las personas/entidades mencionadas
3. **Hechos Clave**: Puntos principales de los hechos más importantes
4. **Cuestiones Legales Potenciales**: Identifica posibles asuntos legales
5. **Legislación Relevante**: Menciona leyes potencialmente aplicables
6. **Próximos Pasos Recomendados**: Sugiere qué debe hacer el usuario'),

('MX', 'interpretation', 'Interpretación Legal', '⚠️ **DESCARGO DE RESPONSABILIDAD**: Este es un análisis legal generado por IA destinado SOLO para fines educativos e informativos. El contenido NO constituye asesoramiento legal.

Crea una interpretación y análisis legal detallado basado en los hechos del caso.

Incluye las siguientes secciones:

### Evaluación Legal
Proporciona un análisis legal completo de la situación.

### Legislación Aplicable
Lista y explica las leyes y regulaciones relevantes.

### Jurisprudencia Relevante
Haz referencia a jurisprudencia relevante.

### Argumentación Legal
Presenta cómo un abogado podría argumentar este caso.

### Posibles Resultados
Analiza posibles resultados: mejor caso, peor caso, más probable.

### Ruta Procesal y Próximos Pasos
Describe la ruta procesal y acciones recomendadas.'),

-- Dominican Republic
('DO', 'timeline', 'Línea de Tiempo Cronológica', 'Crea una línea de tiempo clara y cronológica de los eventos basada en la conversación.

Formato:
- Usa encabezados de fecha claros o marcadores de tiempo relativos
- Lista los eventos en orden cronológico
- Incluye hechos clave: quién, qué, cuándo, dónde
- Resalta detalles legalmente relevantes
- Sé conciso pero completo'),

('DO', 'legal', 'Resumen Legal', 'Crea un resumen legal profesional basado en la conversación.

Incluye:
1. **Resumen**: Breve descripción de la situación
2. **Partes Involucradas**: Lista todas las personas/entidades
3. **Hechos Clave**: Los hechos más importantes
4. **Cuestiones Legales Potenciales**: Posibles asuntos legales
5. **Legislación Relevante**: Leyes aplicables
6. **Próximos Pasos Recomendados**: Qué debe hacer el usuario'),

('DO', 'interpretation', 'Interpretación Legal', '⚠️ **DESCARGO DE RESPONSABILIDAD**: Este análisis es generado por IA y NO constituye asesoramiento legal.

Crea una interpretación legal detallada.

### Evaluación Legal
Análisis completo de la situación.

### Legislación Aplicable
Leyes y regulaciones relevantes.

### Jurisprudencia Relevante
Referencias a casos relevantes.

### Argumentación Legal
Cómo argumentar este caso.

### Posibles Resultados
Mejor, peor y más probable resultado.

### Próximos Pasos
Ruta procesal y acciones recomendadas.'),

-- Netherlands
('NL', 'timeline', 'Chronologische Tijdlijn', 'Maak een duidelijke, chronologische tijdlijn van gebeurtenissen op basis van het gesprek.

Formaat:
- Gebruik duidelijke datumkoppen (indien data werden genoemd) of relatieve tijdsmarkeringen
- Lijst gebeurtenissen in chronologische volgorde
- Neem belangrijke feiten op: wie, wat, wanneer, waar
- Markeer belangrijke details die juridisch relevant kunnen zijn
- Wees beknopt maar volledig'),

('NL', 'legal', 'Juridisch Overzicht', 'Maak een professionele juridische samenvatting op basis van het gesprek.

Neem op:
1. **Samenvatting**: Korte beschrijving van de situatie (2-3 zinnen)
2. **Betrokken Partijen**: Lijst alle genoemde personen/entiteiten
3. **Belangrijke Feiten**: Opsomming van de belangrijkste feiten
4. **Potentiële Juridische Kwesties**: Identificeer mogelijke juridische zaken
5. **Relevante Wetgeving**: Noem mogelijk toepasselijke wetten
6. **Aanbevolen Volgende Stappen**: Suggereer wat de gebruiker moet doen'),

('NL', 'interpretation', 'Juridische Interpretatie', '⚠️ **DISCLAIMER**: Dit is een door AI gegenereerde juridische analyse die ALLEEN bedoeld is voor educatieve en informatieve doeleinden. De inhoud vormt GEEN juridisch advies.

Maak een gedetailleerde juridische interpretatie en analyse op basis van de casefeiten.

Neem de volgende secties op:

### Juridische Beoordeling
Geef een grondige juridische analyse van de situatie.

### Toepasselijke Wetgeving
Lijst en leg relevante wetten en regelgeving uit.

### Relevante Jurisprudentie
Verwijs naar relevante rechtspraak.

### Juridische Argumentatie
Presenteer hoe een advocaat deze zaak zou kunnen beargumenteren.

### Mogelijke Uitkomsten
Analyseer mogelijke uitkomsten: beste geval, slechtste geval, meest waarschijnlijk.

### Procedureel Pad en Volgende Stappen
Beschrijf het procedurele pad en aanbevolen acties.');