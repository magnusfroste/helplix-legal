

# Plan: Analysdjup-val & Visuell Framstegsindikator

## Sammanfattning

Användare har gett feedback att AI:n ställer "för många frågor". Detta är avsiktligt - systemet är designat för att vara dynamisk och ställa fler frågor kring viktiga ämnen. Lösningen är att ge användaren kontroll över analysdjupet och en visuell indikator som visar var de befinner sig i processen.

## Problem att lösa

1. **Användarens upplevelse**: Processen känns lång utan förväntningshantering
2. **Kontroll**: Användaren kan inte påverka hur djupgående analysen blir
3. **Transparens**: Ingen visuell feedback på var i processen man befinner sig

## Lösningsförslag

### 1. Analysdjup-val (Snabb vs Grundlig)

Ge användaren möjlighet att välja analysdjup vid sessionens start:

| Läge | Beskrivning | Frågor ca | Intensity |
|------|-------------|-----------|-----------|
| **Snabb** | Översiktlig analys - grundläggande fakta | 8-12 | 30 |
| **Standard** | Balanserad analys (default) | 15-25 | 70 |
| **Grundlig** | Fullständig utredning - alla detaljer | 25-40+ | 100 |

**Teknisk implementation:**
- Nytt UI-element i DictaphoneScreen som visas vid första interaktionen
- Lokalt val som överskriver admin-intensity under sessionen
- Anpassar `minQuestions` per fas och follow-up-trösklar

### 2. Visuell Framstegsindikator

En diskret progressindikator som visar:
- Aktuell fas (av 7 totalt)
- Ungefärlig "completeness" baserat på information tracking

**Design för äldre användare:**
- Enkel horisontell progress bar
- Fasnamn i klartext ("Tidslinje", "Detaljer", etc)
- Färgkodad: grå (ej nådd) → blå (pågående) → grön (klar)

```text
┌─────────────────────────────────────────────┐
│  ● Öppning  ● Tidslinje  ◐ Detaljer  ○ ...  │
│  ████████████████░░░░░░░░░░░░  45% klar     │
└─────────────────────────────────────────────┘
```

**Anpassning efter analysdjup:**
- Snabb: Hoppar över vissa faser (t.ex. evidence, impact kan förenklas)
- Standard: Alla faser, normal djup
- Grundlig: Alla faser, fler follow-ups tillåts

## Varför det inte går att säga exakt antal frågor

AI:n är designad att vara dynamisk:
- Korta/vaga svar → fler follow-up-frågor
- Detaljerade svar → snabbare progression
- Viktiga ämnen → djupare utforskning

Progressindikatorn visar därför **fas-progression** snarare än "fråga X av Y".

---

## Tekniska detaljer

### Nya komponenter

1. **`AnalysisDepthSelector.tsx`** - Val av analysdjup
   - Visas endast vid `isFirstInteraction === true`
   - Tre tydliga knappar med ikoner och kort beskrivning
   - Sparar val i session state

2. **`PhaseProgressIndicator.tsx`** - Visuell framstegsindikator
   - Tar emot `currentPhase`, `completeness`, `analysisDepth`
   - Responsiv design - minimal på mobil
   - Placeras i DictaphoneScreen under frågans text

### Ändringar i befintlig kod

**`src/types/helplix.ts`**
- Ny typ: `AnalysisDepth = 'quick' | 'standard' | 'thorough'`
- Utöka `CooperSettings` med `analysisDepth`

**`src/hooks/useConversation.ts`**
- Ny state: `analysisDepth`
- Modifiera `questionIntensity` baserat på val
- Exponera `phaseProgress` och `completeness` redan tillgängliga

**`src/components/helplix/DictaphoneScreen.tsx`**
- Integrera `AnalysisDepthSelector` (vid första interaktion)
- Integrera `PhaseProgressIndicator` (alltid synlig efter val)

**`src/hooks/usePhaseTracking.ts`**
- Justera `shouldTransitionPhase` baserat på analysdjup
- Snabb = lägre minQuestions, färre follow-ups

**`src/i18n/translations.ts`**
- Översättningar för alla 6 länder:
  - "Snabb analys" / "Quick analysis" etc
  - Fasnamn på varje språk
  - "X% klar" / "X% complete"

### Dataflöde

```text
Användare väljer "Grundlig"
       ↓
CooperSettings.analysisDepth = 'thorough'
       ↓
useConversation → questionIntensity = 100
       ↓
usePhaseTracking → minQuestions ökas, fler follow-ups tillåts
       ↓
PhaseProgressIndicator visar "Fas 3/7 - Detaljer"
```

### Admin-kontroll (befintlig)

Admin-satt `question_intensity` per jurisdiktion blir nu "baseline" som användaren kan justera:
- Snabb: -40 från baseline
- Standard: baseline
- Grundlig: +30 från baseline (max 100)

