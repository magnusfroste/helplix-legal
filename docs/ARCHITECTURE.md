# Helplix Assist - Systemarkitektur

## Översikt

Helplix Assist är en juridisk diktafon-app för Android (mobile-first) som hjälper användare dokumentera juridiska ärenden genom AI-assisterad intervju.

## Systemarkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    HELPLIX ASSIST                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + TypeScript)                       │
│  ├── Pages                                                   │
│  │   ├── Auth.tsx         - Login/Signup                    │
│  │   ├── Index.tsx        - Huvudapp (tabbar)               │
│  │   ├── Admin.tsx        - Admin-panel                     │
│  │   └── Install.tsx      - PWA-installation                │
│  ├── Components                                              │
│  │   ├── DictaphoneScreen - Huvudvy för intervju            │
│  │   ├── LogScreen        - Visar Q&A-historik              │
│  │   ├── ReportScreen     - Genererade rapporter            │
│  │   ├── SettingsScreen   - Användarinställningar           │
│  │   └── SessionHistoryScreen - Tidigare sessioner          │
│  └── Hooks                                                   │
│      ├── useAuth          - Autentisering                   │
│      ├── useSession       - Sessionshantering               │
│      ├── useCooperChat    - AI-konversation                 │
│      ├── useVoice         - TTS/STT                         │
│      └── useFeatureFlags  - Feature flags                   │
├─────────────────────────────────────────────────────────────┤
│  Backend (Supabase Edge Functions)                          │
│  ├── cooper-chat          - AI-konversation                 │
│  ├── cooper-report        - Rapportgenerering               │
│  ├── elevenlabs-tts       - Text-till-tal                   │
│  ├── elevenlabs-stt       - Tal-till-text                   │
│  ├── elevenlabs-scribe-token - Realtime token               │
│  ├── classify-session     - Ärendetypsklassificering        │
│  ├── perplexity-legal-search - Juridisk research           │
│  ├── check-ai-secrets     - Secrets-status                  │
│  ├── test-ai-connection   - Testa AI-endpoint               │
│  ├── verify-admin         - Admin-behörighet                │
│  └── manage-role          - Rollhantering                   │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                             │
│  ├── profiles             - Användarprofiler                │
│  ├── sessions             - Intervjusessioner               │
│  ├── log_entries          - Q&A-logg                        │
│  ├── reports              - Genererade rapporter            │
│  ├── ai_config            - AI-endpoint konfiguration       │
│  ├── feature_flags        - Admin-kontrollerade funktioner  │
│  ├── user_roles           - Admin/User roller               │
│  ├── jurisdiction_prompts - Landsspecifika systemprompts    │
│  ├── phase_instructions   - Fasspecifika instruktioner      │
│  ├── behavior_guidelines  - Beteenderiktlinjer              │
│  └── report_templates     - Rapportmallar                   │
├─────────────────────────────────────────────────────────────┤
│  External Services                                           │
│  ├── Lovable AI Gateway   - AI-modeller (default)           │
│  ├── OpenAI API           - GPT-4o (valfri)                 │
│  ├── Google Gemini API    - Gemini (valfri)                 │
│  ├── ElevenLabs           - TTS/STT                         │
│  └── Perplexity           - Juridisk sökning                │
└─────────────────────────────────────────────────────────────┘
```

## Dataflöde

### Intervjuflöde

```
Användare talar
      │
      ▼
┌─────────────┐
│ ElevenLabs  │──── Transkription
│    STT      │
└─────────────┘
      │
      ▼
┌─────────────┐
│ cooper-chat │──── AI-svar baserat på:
│             │     - Systemprompt (jurisdiktion)
│             │     - Fasinstruktioner
│             │     - Tidigare konversation
│             │     - Informationsluckor
└─────────────┘
      │
      ▼
┌─────────────┐
│ ElevenLabs  │──── Syntetiserat tal
│    TTS      │
└─────────────┘
      │
      ▼
Användare hör svaret
```

### Rapportflöde

```
Användare klickar "Generera rapport"
      │
      ▼
┌───────────────┐
│ cooper-report │──── Läser alla log_entries
│               │     för sessionen
└───────────────┘
      │
      ▼
Genererar 3 rapporter:
├── Kronologisk tidslinje
├── Juridisk analys
└── Tolkningsrapport
      │
      ▼
Sparas i 'reports' tabellen
```

## Feature Flags

Admin-kontrollerade funktioner:

| Flag | Beskrivning | Påverkar |
|------|-------------|----------|
| tts_enabled | Text-till-tal | TTS-inställningar visas |
| stt_enabled | Tal-till-text | STT-inställningar visas |
| realtime_transcription | Realtidstranskription | Transkriptionsvy |
| streaming_tts | Streaming TTS | Avancerade röstinställningar |
| voice_cloning | Röstkloning | Avancerade röstinställningar |

## Säkerhet

### Row-Level Security (RLS)
Alla användartabeller använder `auth.uid()` för isolering:
- Användare kan endast se/ändra sina egna data
- Admin-funktioner verifieras via `has_role()` funktion

### API-nycklar
- Lagras som Supabase secrets (miljövariabler)
- Aldrig i databas eller frontend-kod
- Edge functions läser via `Deno.env.get()`

### Edge Functions
- Publikt anropbara (verify_jwt = false)
- Autentisering sker via RLS på databastabeller
- Rate limiting på platform-nivå

## Jurisdiktioner

Stödda länder med anpassade systemprompts:

| Kod | Land | Språk |
|-----|------|-------|
| SE | Sverige | Svenska |
| BR | Brasilien | Portugisiska |
| MX | Mexiko | Spanska |
| DO | Dominikanska Republiken | Spanska |
| NL | Nederländerna | Holländska |
| US | USA | Engelska |

Varje jurisdiktion har:
- Systemprompt med juridisk kontext
- Fasinstruktioner anpassade för lokala lagar
- Rapportmallar på rätt språk

## Intervjufaser

AI-intervjun följer 7 faser:

1. **Opening** - Fri berättelse
2. **Timeline** - Kronologisk ordning
3. **Details** - Specifika detaljer
4. **Legal** - Juridiska aspekter
5. **Evidence** - Bevisning och vittnen
6. **Impact** - Konsekvenser och skador
7. **Closing** - Sammanfattning och luckor
