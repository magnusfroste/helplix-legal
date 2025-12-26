import { useState, useCallback } from 'react';
import type { ConversationPhase, PhaseProgress } from '@/types/phases';
import { shouldTransitionPhase, getNextPhase } from '@/types/phases';
import type { InformationTracker } from '@/types/information-tracking';
import { initializeTracker, updateTracker } from '@/types/information-tracking';
import type { QualityMetrics, AnswerQualityAssessment } from '@/types/quality-control';
import { 
  assessAnswerQuality, 
  generateFollowUpQuestions, 
  shouldAskFollowUpNow, 
  initializeQualityMetrics, 
  updateQualityMetrics 
} from '@/types/quality-control';

interface UsePhaseTrackingOptions {
  onPhaseChange?: (from: ConversationPhase, to: ConversationPhase) => void;
}

export function usePhaseTracking({ onPhaseChange }: UsePhaseTrackingOptions = {}) {
  // Phase tracking state
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgress>({
    currentPhase: 'opening',
    questionsInPhase: 0,
    coveredTopics: new Set<string>(),
    missingInfo: [],
    phaseHistory: ['opening']
  });
  
  // Information tracking state
  const [infoTracker, setInfoTracker] = useState<InformationTracker>(() => initializeTracker());
  
  // Quality control state
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>(() => initializeQualityMetrics());
  const [consecutiveFollowUps, setConsecutiveFollowUps] = useState(0);
  const [lastAssessment, setLastAssessment] = useState<AnswerQualityAssessment | null>(null);

  // Process a user response and determine next action
  const processUserResponse = useCallback((
    userResponse: string,
    currentQuestion: string
  ): { 
    shouldFollowUp: boolean; 
    followUpQuestion: string | null;
    nextPhase: ConversationPhase;
  } => {
    // Assess answer quality
    const qualityAssessment = assessAnswerQuality(userResponse, phaseProgress.currentPhase, currentQuestion);
    setLastAssessment(qualityAssessment);
    
    console.log('Answer quality:', qualityAssessment.quality, 'Score:', qualityAssessment.score, 'Issues:', qualityAssessment.issues.length);
    
    // Update information tracker with user's response
    setInfoTracker(prev => updateTracker(prev, phaseProgress.currentPhase, userResponse));
    
    // Update phase progress - increment questions in current phase
    setPhaseProgress(prev => ({
      ...prev,
      questionsInPhase: prev.questionsInPhase + 1
    }));

    // Check if we should transition to next phase
    const shouldTransition = shouldTransitionPhase(
      phaseProgress,
      userResponse.length,
      userResponse.length > 50 // Simple heuristic: longer responses likely contain new info
    );

    let nextPhase = phaseProgress.currentPhase;
    if (shouldTransition) {
      const newPhase = getNextPhase(phaseProgress.currentPhase);
      if (newPhase) {
        console.log(`Phase transition: ${phaseProgress.currentPhase} -> ${newPhase}`);
        nextPhase = newPhase;
        onPhaseChange?.(phaseProgress.currentPhase, newPhase);
        
        setPhaseProgress(prev => ({
          ...prev,
          currentPhase: newPhase,
          questionsInPhase: 0,
          phaseHistory: [...prev.phaseHistory, newPhase]
        }));
      }
    }

    // Check if we should ask a follow-up question immediately
    const shouldFollowUp = shouldAskFollowUpNow(qualityAssessment, consecutiveFollowUps);
    let followUpQuestion: string | null = null;
    
    if (shouldFollowUp) {
      const followUps = generateFollowUpQuestions(qualityAssessment, phaseProgress.currentPhase, userResponse);
      
      if (followUps.length > 0) {
        console.log('Asking follow-up question:', followUps[0].reason);
        followUpQuestion = followUps[0].question;
        setConsecutiveFollowUps(prev => prev + 1);
        setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, true));
      } else {
        setConsecutiveFollowUps(0);
        setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, false));
      }
    } else {
      setConsecutiveFollowUps(0);
      setQualityMetrics(prev => updateQualityMetrics(prev, qualityAssessment, false));
    }

    return {
      shouldFollowUp: shouldFollowUp && followUpQuestion !== null,
      followUpQuestion,
      nextPhase,
    };
  }, [phaseProgress, consecutiveFollowUps, onPhaseChange]);

  // Reset all tracking state
  const reset = useCallback(() => {
    setPhaseProgress({
      currentPhase: 'opening',
      questionsInPhase: 0,
      coveredTopics: new Set<string>(),
      missingInfo: [],
      phaseHistory: ['opening']
    });
    setInfoTracker(initializeTracker());
    setQualityMetrics(initializeQualityMetrics());
    setConsecutiveFollowUps(0);
    setLastAssessment(null);
  }, []);

  return {
    // State (read-only)
    currentPhase: phaseProgress.currentPhase,
    phaseProgress,
    infoTracker,
    qualityMetrics,
    lastAssessment,
    
    // Derived
    informationGaps: infoTracker.gaps,
    completeness: infoTracker.completeness,
    
    // Actions
    processUserResponse,
    reset,
  };
}
