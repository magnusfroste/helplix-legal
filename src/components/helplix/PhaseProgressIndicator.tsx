import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ConversationPhase } from '@/types/phases';
import type { AnalysisDepth, CountryCode } from '@/types/helplix';
import { useTranslation } from '@/hooks/useTranslation';

interface PhaseProgressIndicatorProps {
  currentPhase: ConversationPhase;
  completeness: number; // 0-100
  analysisDepth: AnalysisDepth;
  country: CountryCode | null;
}

const PHASE_ORDER: ConversationPhase[] = [
  'opening',
  'timeline',
  'details',
  'legal',
  'evidence',
  'impact',
  'closing',
];

// For quick analysis, we skip some phases or merge them
const QUICK_PHASES: ConversationPhase[] = [
  'opening',
  'timeline',
  'details',
  'closing',
];

export const PhaseProgressIndicator = memo(function PhaseProgressIndicator({
  currentPhase,
  completeness,
  analysisDepth,
  country,
}: PhaseProgressIndicatorProps) {
  const t = useTranslation(country);
  
  const phases = analysisDepth === 'quick' ? QUICK_PHASES : PHASE_ORDER;
  const currentIndex = phases.indexOf(currentPhase);
  
  // Calculate progress percentage based on phase position
  const phaseProgress = useMemo(() => {
    if (currentIndex === -1) return 0;
    // Give weight to both phase position and completeness
    const phaseWeight = ((currentIndex) / phases.length) * 100;
    const inPhaseProgress = (1 / phases.length) * (completeness / 100) * 100;
    return Math.min(Math.round(phaseWeight + inPhaseProgress), 100);
  }, [currentIndex, phases.length, completeness]);

  // Get translated phase name
  const getPhaseLabel = (phase: ConversationPhase): string => {
    return t.phases[phase] || phase;
  };

  // Current phase label
  const currentPhaseLabel = getPhaseLabel(currentPhase);
  const phaseNumber = currentIndex + 1;
  const totalPhases = phases.length;

  return (
    <div className="w-full max-w-xs mx-auto px-4 py-2">
      {/* Phase indicator text */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span className="font-medium">
          {phaseNumber}/{totalPhases} · {currentPhaseLabel}
        </span>
        <span>{phaseProgress}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            analysisDepth === 'quick' && "bg-green-500",
            analysisDepth === 'standard' && "bg-primary",
            analysisDepth === 'thorough' && "bg-amber-500"
          )}
          style={{ width: `${phaseProgress}%` }}
        />
      </div>
      
      {/* Phase dots - only show on larger screens or for thorough analysis */}
      {analysisDepth !== 'quick' && (
        <div className="flex justify-between mt-2 px-0.5">
          {phases.map((phase, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            
            return (
              <div
                key={phase}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isCompleted && "bg-primary",
                  isCurrent && "bg-primary ring-2 ring-primary/30",
                  !isCompleted && !isCurrent && "bg-muted-foreground/30"
                )}
                title={getPhaseLabel(phase)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
