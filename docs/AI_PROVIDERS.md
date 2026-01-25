# AI Provider Management

## Översikt

Helplix Assist stöder 4 AI-providers som admin kan konfigurera via Admin-panelen. Systemet använder en "one secret per provider"-modell där API-nycklar lagras som environment secrets i Supabase, inte i databasen.

## Tillgängliga Providers

### 1. Lovable AI (Standard)
- **Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`
- **Modell**: `google/gemini-2.5-flash`
- **Secret**: `LOVABLE_API_KEY` (auto-konfigurerad)
- **Fördel**: Ingen extra konfiguration krävs

### 2. OpenAI
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Modell**: `gpt-4o`
- **Secret**: `OPENAI_API_KEY`
- **Kräver**: Manuell nyckelkonfiguration

### 3. Google Gemini (Direkt)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- **Modell**: `gemini-2.5-flash`
- **Secret**: `GOOGLE_API_KEY`
- **Kräver**: Manuell nyckelkonfiguration

### 4. Local LLM (LMStudio)
- **Endpoint**: `http://localhost:1234/v1/chat/completions`
- **Modell**: Valfri lokal modell
- **Secret**: `LOCAL_LLM_API_KEY` (valfri)
- **Användning**: Utveckling och testning

## Säkerhetsmodell

```
┌─────────────────────────────────────────────────┐
│              SUPABASE SECRETS                    │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ LOVABLE_API_KEY │  │ OPENAI_API_KEY  │       │
│  │   (auto)        │  │   (manuell)     │       │
│  └─────────────────┘  └─────────────────┘       │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ GOOGLE_API_KEY  │  │LOCAL_LLM_API_KEY│       │
│  │   (manuell)     │  │   (valfri)      │       │
│  └─────────────────┘  └─────────────────┘       │
└─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│           EDGE FUNCTIONS                         │
│  cooper-chat, cooper-report, test-ai-connection │
│  → Läser secrets via Deno.env.get()             │
└─────────────────────────────────────────────────┘
```

## Admin-panel funktioner

### AI-konfiguration
- **Preset-knappar**: Snabbval för varje provider
- **Statusindikator**: Grön/röd visar om secret finns
- **Test-knapp**: Verifierar anslutning innan sparning

### Secrets Status
Edge function `check-ai-secrets` returnerar status för alla nycklar:

```typescript
// Response
{
  secrets: [
    { name: 'LOVABLE_API_KEY', provider: 'Lovable AI', configured: true },
    { name: 'OPENAI_API_KEY', provider: 'OpenAI', configured: false },
    { name: 'GOOGLE_API_KEY', provider: 'Google Gemini', configured: true },
    { name: 'LOCAL_LLM_API_KEY', provider: 'Local LLM', configured: false }
  ]
}
```

## Databaslagring

Tabellen `ai_config` lagrar endast endpoint och modellnamn:

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| config_key | TEXT | 'primary' (endast en aktiv) |
| endpoint_url | TEXT | API-endpoint URL |
| model_name | TEXT | Modellidentifierare |
| is_active | BOOLEAN | Om konfigurationen är aktiv |
| api_key | TEXT | DEPRECATED - använd secrets |

**Viktigt**: `api_key`-kolumnen används inte längre. Alla API-nycklar hämtas från Supabase secrets.

## Edge Function: cooper-chat

Provider-detektion sker automatiskt baserat på endpoint URL:

```typescript
function detectProvider(endpointUrl: string): AIProvider {
  if (endpointUrl.includes('ai.gateway.lovable.dev')) return 'lovable';
  if (endpointUrl.includes('openai.com')) return 'openai';
  if (endpointUrl.includes('generativelanguage.googleapis')) return 'google';
  if (endpointUrl.includes('localhost')) return 'local';
  return 'openai'; // Fallback för kompatibla endpoints
}
```

## Konfigurationsguide

### Lägga till en ny API-nyckel

1. Gå till Lovable Cloud → Secrets
2. Klicka "Add Secret"
3. Ange secretnamn (t.ex. `OPENAI_API_KEY`)
4. Klistra in API-nyckeln
5. Spara och vänta på omdistribution
6. Verifiera via Admin → AI Configuration

### Byta aktiv provider

1. Gå till Admin → AI Configuration
2. Klicka på önskad provider-knapp
3. Om secret saknas, lägg till den först
4. Klicka "Testa anslutning"
5. Om test lyckas, klicka "Spara konfiguration"

## Felsökning

### "No API key found for provider X"
- Verifiera att secret är tillagd i Supabase
- Kontrollera att secretnamnet är korrekt stavat
- Vänta 1-2 minuter efter att secret lagts till

### "AI gateway error: 401"
- API-nyckeln är ogiltig eller utgången
- Kontrollera nyckeln hos providern

### "AI gateway error: 429"
- Rate limit nådd
- Vänta och försök igen
- Överväg uppgradering hos providern
