
# Testbänk för AI-agentens Kvalitet - Systemdesign

## Sammanfattning

Vi skapar en komplett testbänk för att systematiskt utvärdera Helplix AI-agentens förmåga att genomföra juridiska utredningar. Systemet kommer att:
1. Lagra verkliga och syntetiska juridiska testfall
2. Simulera konversationer genom att mata in fall till AI:n
3. Analysera och betygsätta AI-agentens rapporter
4. Stödja flera jurisdiktioner (SE, BR, MX, US, NL, DO)
5. Ge detaljerade kvalitetspoäng och förbättringsförslag

---

## Arkitektur

```text
┌─────────────────────────────────────────────────────────────────┐
│                     TESTBÄNK ARKITEKTUR                         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend                                                        │
│  └── TestBenchScreen                                             │
│      ├── TestCaseLibrary     - Bläddra/lägg till testfall       │
│      ├── TestRunner          - Kör tester mot AI                │
│      ├── ResultsDashboard    - Visa poäng och jämförelser       │
│      └── TestCaseEditor      - Skapa/redigera testfall          │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Edge Functions)                                        │
│  ├── testbench-run          - Kör ett testfall genom AI         │
│  ├── testbench-evaluate     - Betygsätt genererad rapport       │
│  └── testbench-research     - Hämta verkliga fall från internet │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase)                                             │
│  ├── test_cases             - Testfall med förväntade resultat  │
│  ├── test_runs              - Körningar och resultat            │
│  ├── test_scores            - Detaljerade betyg per kategori    │
│  └── test_benchmarks        - Jämförelsedata över tid           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Databasdesign

### 1. test_cases - Testfall

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | Primärnyckel |
| country_code | text | SE, BR, MX, US, NL, DO |
| case_type | text | travel_damage, consumer, housing, etc |
| title | text | Kort beskrivning |
| source | text | 'synthetic', 'real', 'research' |
| source_url | text | URL till källan om verkligt fall |
| difficulty | text | 'easy', 'medium', 'hard' |
| scenario | jsonb | Komplett scenario med fakta |
| simulated_answers | jsonb | Array av användarsvar att mata in |
| expected_facts | jsonb | Fakta som bör finnas i rapporten |
| expected_legal_issues | jsonb | Juridiska frågor som bör identifieras |
| expected_timeline | jsonb | Kronologiska händelser att fånga |
| scoring_rubric | jsonb | Viktning av olika bedömningskriterier |
| created_by | uuid | Admin som skapade |
| is_active | boolean | Om testfallet är aktivt |
| created_at, updated_at | timestamp | Tidsstämplar |

### 2. test_runs - Testkörningar

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | Primärnyckel |
| test_case_id | uuid | FK till test_cases |
| ai_config_snapshot | jsonb | AI-inställningar vid körning |
| conversation_log | jsonb | Hela konversationen |
| generated_report | jsonb | Timeline, legal, interpretation |
| started_at, completed_at | timestamp | Tidpunkter |
| status | text | 'running', 'completed', 'failed' |
| run_by | uuid | Användare som körde testet |

### 3. test_scores - Detaljerade betyg

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | Primärnyckel |
| test_run_id | uuid | FK till test_runs |
| overall_score | integer | 0-100 totalpoäng |
| fact_coverage | integer | 0-100 täckning av förväntade fakta |
| legal_accuracy | integer | 0-100 korrekt juridisk analys |
| timeline_accuracy | integer | 0-100 kronologisk precision |
| language_quality | integer | 0-100 språkkvalitet |
| professionalism | integer | 0-100 professionell ton |
| question_quality | integer | 0-100 kvalitet på intervjufrågor |
| gap_detection | integer | 0-100 identifierade luckor |
| evaluation_details | jsonb | Detaljerad bedömning |
| evaluator_notes | text | Anteckningar från AI-utvärderaren |
| created_at | timestamp | Tidsstämpel |

### 4. test_benchmarks - Jämförelsedata

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid | Primärnyckel |
| benchmark_date | date | Datum för benchmarken |
| country_code | text | Jurisdiktion |
| case_type | text | Ärendetyp |
| avg_overall_score | decimal | Genomsnittlig totalpoäng |
| avg_fact_coverage | decimal | Genomsnittlig faktatäckning |
| avg_legal_accuracy | decimal | Genomsnittlig juridisk precision |
| tests_run | integer | Antal körda tester |
| ai_config_snapshot | jsonb | AI-konfiguration |
| created_at | timestamp | Tidsstämpel |

---

## Edge Functions

### 1. testbench-run

Kör ett testfall genom hela AI-flödet:

```text
Input:
├── test_case_id
├── ai_config_override (valfritt)
└── phases_to_run (valfritt)

Process:
1. Ladda testfall från databas
2. Starta ny session
3. För varje simulerat svar:
   - Skicka till cooper-chat
   - Logga fråga och svar
   - Hantera fas-övergångar
4. Generera alla rapporttyper via cooper-report
5. Spara allt till test_runs

Output:
├── test_run_id
├── conversation_log
└── generated_reports
```

### 2. testbench-evaluate

AI-driven utvärdering av testkörningen:

```text
Input:
├── test_run_id
└── evaluation_depth ('quick', 'thorough')

Process:
1. Ladda test_run och test_case
2. Jämför genererad rapport mot expected_facts
3. Kontrollera juridisk korrekthet mot expected_legal_issues
4. Verifiera tidslinje mot expected_timeline
5. Bedöm intervjukvalitet (frågors relevans, progression)
6. Språk- och tonbedömning
7. Beräkna poäng enligt scoring_rubric

Bedömningskriterier:
├── Faktatäckning: Hur många förväntade fakta fångades?
├── Juridisk precision: Identifierades rätt lagar och rättigheter?
├── Kronologi: Är tidslinjen korrekt och komplett?
├── Frågeteknik: Ställde AI:n rätt följdfrågor?
├── Luckidentifiering: Upptäcktes saknad information?
├── Professionalism: Ton och format
└── Språkkvalitet: Grammatik och tydlighet

Output:
├── test_scores (alla kategorier)
├── detailed_feedback
└── improvement_suggestions
```

### 3. testbench-research

Hämta verkliga juridiska fall via Perplexity:

```text
Input:
├── country_code
├── case_type
└── search_terms

Process:
1. Sök efter verkliga juridiska fall via Perplexity
2. Extrahera relevanta detaljer (anonymisera vid behov)
3. Strukturera till testfallsformat
4. Generera förväntade fakta och juridiska frågor
5. Föreslå testfall för admin-granskning

Output:
├── suggested_test_cases[]
└── sources_cited[]
```

---

## Frontend-komponenter

### TestBenchScreen (Admin-vy)

```text
┌────────────────────────────────────────────────────────┐
│  TESTBÄNK                                        [Kör] │
├────────────────────────────────────────────────────────┤
│  Statistik                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 85%      │ │ 78%      │ │ 92%      │ │ 156      │  │
│  │ Total    │ │ Juridik  │ │ Fakta    │ │ Tester   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├────────────────────────────────────────────────────────┤
│  Filter: [Land ▼] [Typ ▼] [Svårighet ▼]               │
├────────────────────────────────────────────────────────┤
│  Testfall                                               │
│  ┌────────────────────────────────────────────────────┐│
│  │ 🇸🇪 Flygförsenat bagage - Consumer (Medium)        ││
│  │   Senaste körning: 87/100 • 3 dagar sedan         ││
│  │   [Kör] [Visa detaljer] [Redigera]                ││
│  └────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────┐│
│  │ 🇧🇷 Atraso de voo - Travel (Easy)                  ││
│  │   Senaste körning: 92/100 • 1 vecka sedan         ││
│  │   [Kör] [Visa detaljer] [Redigera]                ││
│  └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

### Funktioner

1. **Testfallsbibliotek**
   - Lista alla testfall med filter
   - Visa senaste körningsresultat
   - Importera/exportera testfall

2. **Testkörare**
   - Kör enskilda eller batch-tester
   - Realtidsvy av konversationen
   - Pausa/återuppta körningar

3. **Resultatvy**
   - Detaljerad poänguppdelning
   - Jämförelse med tidigare körningar
   - Trend-grafer över tid

4. **Testfallsredigerare**
   - Skapa nya testfall manuellt
   - Importera från Perplexity-research
   - Redigera förväntade resultat

---

## Testfallsstruktur (Exempel)

```json
{
  "title": "Försenat bagage vid flygresa",
  "country_code": "SE",
  "case_type": "travel_damage",
  "difficulty": "medium",
  "source": "synthetic",
  
  "scenario": {
    "description": "Användaren flög med SAS från Stockholm till Barcelona. Bagaget kom fram 4 dagar för sent och användaren var tvungen att köpa kläder och hygienartiklar.",
    "key_facts": [
      "Flygbolag: SAS",
      "Datum: 2024-06-15",
      "Rutt: Stockholm-Barcelona",
      "Försening: 4 dagar",
      "Utlägg: 3500 kr för kläder och hygien",
      "PIR-rapport: Ja, registrerad vid flygplatsen"
    ]
  },
  
  "simulated_answers": [
    "Jag flög till Barcelona och mitt bagage kom aldrig fram",
    "Det var den 15 juni i somras, med SAS från Arlanda",
    "Det tog 4 dagar innan jag fick väskan",
    "Ja, jag var tvungen att köpa nya kläder och tandborste och sånt. Blev typ 3500 kronor",
    "Ja, jag gjorde en anmälan på flygplatsen direkt när jag kom fram",
    "Nej, jag har inte skickat något till flygbolaget ännu"
  ],
  
  "expected_facts": [
    {"fact": "Flygbolag identifierat", "weight": 10},
    {"fact": "Datum för flygning", "weight": 10},
    {"fact": "Förseningens längd", "weight": 15},
    {"fact": "Ekonomisk skada kvantifierad", "weight": 15},
    {"fact": "PIR-rapport registrerad", "weight": 10}
  ],
  
  "expected_legal_issues": [
    {"issue": "Montrealkonventionen", "weight": 20},
    {"issue": "Flyggästförordningen 261/2004", "weight": 15},
    {"issue": "Rätt till ersättning för nödvändiga utlägg", "weight": 15},
    {"issue": "Reklamationsfrist 21 dagar", "weight": 10}
  ],
  
  "expected_timeline": [
    {"event": "Flygresa genomförd", "date": "2024-06-15"},
    {"event": "Bagageförsening upptäckt", "date": "2024-06-15"},
    {"event": "PIR-rapport registrerad", "date": "2024-06-15"},
    {"event": "Bagage levererat", "date": "2024-06-19"}
  ],
  
  "scoring_rubric": {
    "fact_coverage": 0.25,
    "legal_accuracy": 0.30,
    "timeline_accuracy": 0.15,
    "question_quality": 0.15,
    "language_quality": 0.10,
    "professionalism": 0.05
  }
}
```

---

## Implementationsplan

### Fas 1: Databasstruktur
- Skapa tabeller: test_cases, test_runs, test_scores, test_benchmarks
- Lägg till RLS-policies (admin-only för skrivning)
- Seed med 2-3 exempeltestfall per jurisdiktion

### Fas 2: Edge Functions
- `testbench-run`: Simulera konversation
- `testbench-evaluate`: AI-driven bedömning
- `testbench-research`: Perplexity-integration

### Fas 3: Admin-UI
- TestBenchScreen komponent
- Testfallslista med filter
- Körnings- och resultatvy
- Testfallsredigerare

### Fas 4: Research & Content
- Implementera testbench-research
- Samla 5-10 verkliga fall per jurisdiktion
- Skapa benchmark-baslinjer

---

## Tekniska detaljer

### Hooks att skapa
- `useTestBench`: Hantera testfall och körningar
- `useTestResults`: Hämta och analysera resultat
- `useTestCaseEditor`: CRUD för testfall

### Integrationer
- Använder existerande `cooper-chat` för konversation
- Använder existerande `cooper-report` för rapporter
- Ny utvärderingsprompt i `testbench-evaluate`
- Perplexity-connector för research

### Säkerhet
- Endast admins kan se testbänken
- RLS på alla testbänkstabeller
- Feature flag: `testbench_enabled`
