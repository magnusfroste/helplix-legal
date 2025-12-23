export type ConversationPhase = 
  | 'opening'
  | 'timeline'
  | 'details'
  | 'legal'
  | 'evidence'
  | 'impact'
  | 'closing';

export interface PhaseInfo {
  phase: ConversationPhase;
  name: string;
  description: string;
  objectives: string[];
  minQuestions: number;
  completionCriteria: string[];
}

export const CONVERSATION_PHASES: Record<ConversationPhase, PhaseInfo> = {
  opening: {
    phase: 'opening',
    name: 'Opening',
    description: 'Let the user tell their story freely',
    objectives: [
      'Understand the general situation',
      'Identify the main issue',
      'Build rapport and trust',
      'Get an overview of what happened'
    ],
    minQuestions: 2,
    completionCriteria: [
      'User has described the main issue',
      'Basic context is established',
      'Key parties are mentioned'
    ]
  },
  timeline: {
    phase: 'timeline',
    name: 'Timeline',
    description: 'Build chronological understanding',
    objectives: [
      'Establish when events occurred',
      'Understand the sequence of events',
      'Identify key dates and deadlines',
      'Map the progression of the situation'
    ],
    minQuestions: 3,
    completionCriteria: [
      'Start date is known',
      'Key events are dated',
      'Sequence is clear'
    ]
  },
  details: {
    phase: 'details',
    name: 'Details',
    description: 'Deep dive into specifics',
    objectives: [
      'Identify all parties involved',
      'Understand locations and settings',
      'Clarify how things happened',
      'Explore motivations and context'
    ],
    minQuestions: 4,
    completionCriteria: [
      'All parties are identified',
      'Locations are specified',
      'Methods and actions are clear'
    ]
  },
  legal: {
    phase: 'legal',
    name: 'Legal Aspects',
    description: 'Identify legal issues and frameworks',
    objectives: [
      'Identify contracts or agreements',
      'Understand legal obligations',
      'Recognize potential violations',
      'Determine applicable laws'
    ],
    minQuestions: 3,
    completionCriteria: [
      'Legal relationships are identified',
      'Relevant laws are mentioned',
      'Obligations are understood'
    ]
  },
  evidence: {
    phase: 'evidence',
    name: 'Evidence',
    description: 'Gather documentation and witnesses',
    objectives: [
      'Identify written documentation',
      'Find witnesses',
      'Locate communication records',
      'Discover physical evidence'
    ],
    minQuestions: 3,
    completionCriteria: [
      'Documents are identified',
      'Witnesses are named',
      'Communication records are noted'
    ]
  },
  impact: {
    phase: 'impact',
    name: 'Impact & Consequences',
    description: 'Assess damages and effects',
    objectives: [
      'Quantify financial losses',
      'Assess emotional impact',
      'Identify ongoing consequences',
      'Understand future implications'
    ],
    minQuestions: 2,
    completionCriteria: [
      'Damages are quantified',
      'Impact is described',
      'Consequences are clear'
    ]
  },
  closing: {
    phase: 'closing',
    name: 'Closing',
    description: 'Fill gaps and summarize',
    objectives: [
      'Address any missing information',
      'Clarify ambiguities',
      'Confirm key facts',
      'Prepare for report generation'
    ],
    minQuestions: 1,
    completionCriteria: [
      'No major gaps remain',
      'User confirms understanding',
      'Ready for report'
    ]
  }
};

export interface PhaseProgress {
  currentPhase: ConversationPhase;
  questionsInPhase: number;
  coveredTopics: Set<string>;
  missingInfo: string[];
  phaseHistory: ConversationPhase[];
}

export interface PhaseTransitionReason {
  from: ConversationPhase;
  to: ConversationPhase;
  reason: string;
  timestamp: Date;
}

// Helper to determine if phase should transition
export function shouldTransitionPhase(
  progress: PhaseProgress,
  responseLength: number,
  hasNewInfo: boolean
): boolean {
  const currentPhaseInfo = CONVERSATION_PHASES[progress.currentPhase];
  
  // Minimum questions not met
  if (progress.questionsInPhase < currentPhaseInfo.minQuestions) {
    return false;
  }
  
  // User giving very short answers might indicate they don't have more info
  if (responseLength < 20 && progress.questionsInPhase >= currentPhaseInfo.minQuestions + 2) {
    return true;
  }
  
  // No new information in last few responses
  if (!hasNewInfo && progress.questionsInPhase >= currentPhaseInfo.minQuestions + 1) {
    return true;
  }
  
  // Maximum questions in phase reached
  if (progress.questionsInPhase >= currentPhaseInfo.minQuestions + 5) {
    return true;
  }
  
  return false;
}

// Get next phase in sequence
export function getNextPhase(currentPhase: ConversationPhase): ConversationPhase | null {
  const sequence: ConversationPhase[] = [
    'opening',
    'timeline',
    'details',
    'legal',
    'evidence',
    'impact',
    'closing'
  ];
  
  const currentIndex = sequence.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null; // Already at last phase
  }
  
  return sequence[currentIndex + 1];
}

// Generate phase-specific system prompt enhancement
export function getPhasePromptEnhancement(phase: ConversationPhase, country: string): string {
  const phaseInfo = CONVERSATION_PHASES[phase];
  
  return `
## CURRENT INTERVIEW PHASE: ${phaseInfo.name.toUpperCase()}

**Phase Objective:** ${phaseInfo.description}

**Key Goals:**
${phaseInfo.objectives.map(obj => `- ${obj}`).join('\n')}

**What to Focus On:**
${getPhaseSpecificGuidance(phase, country)}

**Transition Criteria:**
- Ask at least ${phaseInfo.minQuestions} questions in this phase
- Ensure: ${phaseInfo.completionCriteria.join(', ')}
- Move to next phase when objectives are met or user has no more information

**Remember:** Stay in this phase until objectives are met. Don't rush to next phase.
`;
}

function getPhaseSpecificGuidance(phase: ConversationPhase, country: string): string {
  switch (phase) {
    case 'opening':
      return `- Ask open-ended questions like "Can you tell me what happened?"
- Let the user speak freely without interruption
- Listen for key themes and parties
- Build trust and rapport`;
      
    case 'timeline':
      return `- Ask "When did this start?" and "When did X happen?"
- Request specific dates, times, or timeframes
- Build a chronological sequence
- Identify any deadlines or time-sensitive issues`;
      
    case 'details':
      return `- Ask "Who was involved?" and "Where did this happen?"
- Request specific names, titles, and roles
- Clarify locations and settings
- Understand the "how" of each event`;
      
    case 'legal':
      return `- Ask about contracts, agreements, or written terms
- Identify legal relationships (employer-employee, landlord-tenant, etc.)
- Explore obligations and rights under ${country} law
- Look for potential violations or breaches`;
      
    case 'evidence':
      return `- Ask "Do you have any documents related to this?"
- Request emails, messages, contracts, receipts
- Identify potential witnesses
- Look for photos, videos, or recordings`;
      
    case 'impact':
      return `- Ask "How has this affected you financially?"
- Explore emotional and psychological impact
- Identify ongoing consequences
- Quantify losses where possible`;
      
    case 'closing':
      return `- Review any gaps in the story
- Ask clarifying questions
- Confirm key facts
- Prepare user for report generation`;
      
    default:
      return '';
  }
}
