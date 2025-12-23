import type { ConversationPhase } from './phases';

export type AnswerQuality = 'excellent' | 'good' | 'acceptable' | 'poor' | 'unclear';

export interface QualityIssue {
  type: 'too_short' | 'too_vague' | 'missing_details' | 'contradictory' | 'incomplete';
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  suggestedFollowUp: string;
}

export interface AnswerQualityAssessment {
  quality: AnswerQuality;
  score: number; // 0-100
  issues: QualityIssue[];
  needsFollowUp: boolean;
  confidence: number; // 0-100, how confident we are in this assessment
}

export interface FollowUpQuestion {
  question: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  targetTopic: string;
}

// Analyze answer quality
export function assessAnswerQuality(
  answer: string,
  currentPhase: ConversationPhase,
  previousQuestion: string
): AnswerQualityAssessment {
  const issues: QualityIssue[] = [];
  let score = 100;
  
  const answerLength = answer.trim().length;
  const wordCount = answer.trim().split(/\s+/).length;
  const lowerAnswer = answer.toLowerCase();
  
  // Check for extremely short answers
  if (answerLength < 10) {
    issues.push({
      type: 'too_short',
      severity: 'critical',
      description: 'Answer is too short to be meaningful',
      suggestedFollowUp: 'Could you provide more details about that?'
    });
    score -= 40;
  } else if (answerLength < 30) {
    issues.push({
      type: 'too_short',
      severity: 'moderate',
      description: 'Answer lacks sufficient detail',
      suggestedFollowUp: 'Can you tell me more about this?'
    });
    score -= 25;
  }
  
  // Check for vague answers
  const vagueIndicators = [
    'i don\'t know',
    'not sure',
    'maybe',
    'i think',
    'probably',
    'i guess',
    'kind of',
    'sort of',
    'something like',
    'around',
    'approximately'
  ];
  
  let vagueCount = 0;
  vagueIndicators.forEach(indicator => {
    if (lowerAnswer.includes(indicator)) vagueCount++;
  });
  
  if (vagueCount >= 3) {
    issues.push({
      type: 'too_vague',
      severity: 'moderate',
      description: 'Answer contains many uncertain expressions',
      suggestedFollowUp: 'Can you be more specific about the details you do remember?'
    });
    score -= 20;
  } else if (vagueCount >= 2) {
    issues.push({
      type: 'too_vague',
      severity: 'minor',
      description: 'Answer shows some uncertainty',
      suggestedFollowUp: 'What parts are you most certain about?'
    });
    score -= 10;
  }
  
  // Check for missing critical details based on phase
  const phaseSpecificIssues = checkPhaseSpecificQuality(answer, currentPhase, previousQuestion);
  issues.push(...phaseSpecificIssues);
  score -= phaseSpecificIssues.length * 15;
  
  // Check for contradictions (simple heuristic)
  if (lowerAnswer.includes('but') && lowerAnswer.includes('however')) {
    issues.push({
      type: 'contradictory',
      severity: 'minor',
      description: 'Answer may contain contradictory information',
      suggestedFollowUp: 'Just to clarify, which of these is correct?'
    });
    score -= 10;
  }
  
  // Check for incomplete thoughts
  if (answer.endsWith('...') || answer.includes('etc') || answer.includes('and so on')) {
    issues.push({
      type: 'incomplete',
      severity: 'minor',
      description: 'Answer appears incomplete',
      suggestedFollowUp: 'Can you complete that thought?'
    });
    score -= 10;
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine quality level
  let quality: AnswerQuality;
  if (score >= 80) quality = 'excellent';
  else if (score >= 60) quality = 'good';
  else if (score >= 40) quality = 'acceptable';
  else if (score >= 20) quality = 'poor';
  else quality = 'unclear';
  
  // Determine if follow-up is needed
  const needsFollowUp = quality === 'poor' || quality === 'unclear' || 
                        issues.some(i => i.severity === 'critical');
  
  // Calculate confidence in assessment
  const confidence = calculateAssessmentConfidence(answer, wordCount);
  
  return {
    quality,
    score,
    issues,
    needsFollowUp,
    confidence
  };
}

// Check phase-specific quality requirements
function checkPhaseSpecificQuality(
  answer: string,
  phase: ConversationPhase,
  question: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.toLowerCase();
  
  switch (phase) {
    case 'timeline':
      // Check for dates/times
      if (lowerQuestion.includes('when') || lowerQuestion.includes('date')) {
        const hasDate = /\d{4}|\d{1,2}\/\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december|last year|this year|ago/i.test(answer);
        if (!hasDate) {
          issues.push({
            type: 'missing_details',
            severity: 'critical',
            description: 'No specific date or timeframe provided',
            suggestedFollowUp: 'Can you remember approximately when this happened? Even a rough timeframe would help.'
          });
        }
      }
      break;
      
    case 'details':
      // Check for names
      if (lowerQuestion.includes('who') || lowerQuestion.includes('name')) {
        const hasName = /[A-Z][a-z]+ [A-Z][a-z]+/.test(answer);
        if (!hasName && answer.length < 50) {
          issues.push({
            type: 'missing_details',
            severity: 'moderate',
            description: 'No specific names mentioned',
            suggestedFollowUp: 'Do you know the full name of the person involved?'
          });
        }
      }
      
      // Check for locations
      if (lowerQuestion.includes('where') || lowerQuestion.includes('location')) {
        const hasLocation = /\b(at|in|on|street|building|office|address|city|town)\b/i.test(answer);
        if (!hasLocation) {
          issues.push({
            type: 'missing_details',
            severity: 'moderate',
            description: 'No specific location mentioned',
            suggestedFollowUp: 'Where exactly did this take place?'
          });
        }
      }
      break;
      
    case 'legal':
      // Check for legal terms
      if (lowerQuestion.includes('contract') || lowerQuestion.includes('agreement')) {
        const hasLegalTerms = /\b(contract|agreement|signed|terms|clause|written)\b/i.test(answer);
        if (!hasLegalTerms && answer.length < 40) {
          issues.push({
            type: 'missing_details',
            severity: 'critical',
            description: 'No details about legal agreements',
            suggestedFollowUp: 'Was there any written agreement or contract? Even a verbal agreement?'
          });
        }
      }
      break;
      
    case 'evidence':
      // Check for documentation
      if (lowerQuestion.includes('document') || lowerQuestion.includes('evidence')) {
        const hasEvidence = /\b(document|email|text|message|photo|video|recording|receipt|letter)\b/i.test(answer);
        if (!hasEvidence && lowerAnswer.includes('no')) {
          // User said they don't have evidence - this is acceptable
        } else if (!hasEvidence) {
          issues.push({
            type: 'missing_details',
            severity: 'moderate',
            description: 'No specific evidence mentioned',
            suggestedFollowUp: 'Do you have any emails, messages, or documents related to this?'
          });
        }
      }
      break;
      
    case 'impact':
      // Check for quantifiable impact
      if (lowerQuestion.includes('financial') || lowerQuestion.includes('cost') || lowerQuestion.includes('money')) {
        const hasAmount = /\$|€|£|kr|\d+\s*(dollar|euro|pound|kronor|sek|usd|eur)/i.test(answer);
        if (!hasAmount && !lowerAnswer.includes('no') && !lowerAnswer.includes('nothing')) {
          issues.push({
            type: 'missing_details',
            severity: 'moderate',
            description: 'No specific financial amount mentioned',
            suggestedFollowUp: 'Can you estimate the financial impact, even roughly?'
          });
        }
      }
      break;
  }
  
  return issues;
}

// Calculate confidence in the assessment
function calculateAssessmentConfidence(answer: string, wordCount: number): number {
  let confidence = 100;
  
  // Less confident with very short answers
  if (wordCount < 5) confidence -= 30;
  else if (wordCount < 10) confidence -= 15;
  
  // Less confident with very long answers (harder to analyze)
  if (wordCount > 200) confidence -= 10;
  
  // Less confident if answer is mostly questions
  const questionMarks = (answer.match(/\?/g) || []).length;
  if (questionMarks > 2) confidence -= 20;
  
  return Math.max(0, Math.min(100, confidence));
}

// Generate follow-up questions based on quality issues
export function generateFollowUpQuestions(
  assessment: AnswerQualityAssessment,
  currentPhase: ConversationPhase,
  originalAnswer: string
): FollowUpQuestion[] {
  const followUps: FollowUpQuestion[] = [];
  
  // Generate follow-ups from quality issues
  assessment.issues.forEach(issue => {
    if (issue.severity === 'critical' || issue.severity === 'moderate') {
      followUps.push({
        question: issue.suggestedFollowUp,
        reason: issue.description,
        priority: issue.severity === 'critical' ? 'high' : 'medium',
        targetTopic: issue.type
      });
    }
  });
  
  // Add phase-specific follow-ups if needed
  if (assessment.quality === 'poor' || assessment.quality === 'unclear') {
    const phaseFollowUp = getPhaseSpecificFollowUp(currentPhase, originalAnswer);
    if (phaseFollowUp) {
      followUps.push(phaseFollowUp);
    }
  }
  
  // Prioritize and limit follow-ups
  return followUps
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 2); // Maximum 2 follow-up questions at a time
}

// Get phase-specific follow-up question
function getPhaseSpecificFollowUp(
  phase: ConversationPhase,
  answer: string
): FollowUpQuestion | null {
  const lowerAnswer = answer.toLowerCase();
  
  switch (phase) {
    case 'opening':
      if (answer.length < 50) {
        return {
          question: 'Can you tell me more about what happened? Take your time and share as much detail as you remember.',
          reason: 'Initial answer too brief',
          priority: 'high',
          targetTopic: 'main_issue'
        };
      }
      break;
      
    case 'timeline':
      if (!(/\d/.test(answer))) {
        return {
          question: 'Even if you don\'t remember the exact date, can you recall approximately when this started? For example, was it this year, last year, or longer ago?',
          reason: 'No timeframe provided',
          priority: 'high',
          targetTopic: 'dates'
        };
      }
      break;
      
    case 'details':
      if (answer.length < 40) {
        return {
          question: 'Can you describe this in more detail? What exactly happened, and who was involved?',
          reason: 'Insufficient detail provided',
          priority: 'medium',
          targetTopic: 'specifics'
        };
      }
      break;
      
    case 'evidence':
      if (lowerAnswer.includes('no') || lowerAnswer.includes('don\'t have')) {
        return {
          question: 'Are there any witnesses who saw what happened, or anyone you told about this at the time?',
          reason: 'No documentation - checking for witnesses',
          priority: 'medium',
          targetTopic: 'witnesses'
        };
      }
      break;
  }
  
  return null;
}

// Determine if we should ask a follow-up immediately
export function shouldAskFollowUpNow(
  assessment: AnswerQualityAssessment,
  consecutiveFollowUps: number
): boolean {
  // Don't ask too many follow-ups in a row (max 2)
  if (consecutiveFollowUps >= 2) return false;
  
  // Always follow up on critical issues
  if (assessment.issues.some(i => i.severity === 'critical')) return true;
  
  // Follow up on poor/unclear answers
  if (assessment.quality === 'poor' || assessment.quality === 'unclear') return true;
  
  // Otherwise, continue with normal flow
  return false;
}

// Track quality over time
export interface QualityMetrics {
  averageScore: number;
  totalAnswers: number;
  excellentCount: number;
  goodCount: number;
  acceptableCount: number;
  poorCount: number;
  unclearCount: number;
  followUpsAsked: number;
}

export function updateQualityMetrics(
  metrics: QualityMetrics,
  assessment: AnswerQualityAssessment,
  followUpAsked: boolean
): QualityMetrics {
  const newMetrics = { ...metrics };
  
  newMetrics.totalAnswers++;
  newMetrics.averageScore = 
    (metrics.averageScore * metrics.totalAnswers + assessment.score) / 
    (metrics.totalAnswers + 1);
  
  switch (assessment.quality) {
    case 'excellent': newMetrics.excellentCount++; break;
    case 'good': newMetrics.goodCount++; break;
    case 'acceptable': newMetrics.acceptableCount++; break;
    case 'poor': newMetrics.poorCount++; break;
    case 'unclear': newMetrics.unclearCount++; break;
  }
  
  if (followUpAsked) {
    newMetrics.followUpsAsked++;
  }
  
  return newMetrics;
}

export function initializeQualityMetrics(): QualityMetrics {
  return {
    averageScore: 0,
    totalAnswers: 0,
    excellentCount: 0,
    goodCount: 0,
    acceptableCount: 0,
    poorCount: 0,
    unclearCount: 0,
    followUpsAsked: 0
  };
}
