import type { ConversationPhase } from './phases';

export interface TopicInfo {
  topic: string;
  covered: boolean;
  confidence: 'high' | 'medium' | 'low' | 'none';
  notes?: string;
}

export interface PhaseTopics {
  opening: {
    mainIssue: TopicInfo;
    involvedParties: TopicInfo;
    basicContext: TopicInfo;
  };
  timeline: {
    startDate: TopicInfo;
    keyEvents: TopicInfo;
    eventSequence: TopicInfo;
    deadlines: TopicInfo;
  };
  details: {
    specificNames: TopicInfo;
    locations: TopicInfo;
    howItHappened: TopicInfo;
    motivations: TopicInfo;
  };
  legal: {
    contracts: TopicInfo;
    legalRelationships: TopicInfo;
    obligations: TopicInfo;
    violations: TopicInfo;
  };
  evidence: {
    documents: TopicInfo;
    witnesses: TopicInfo;
    communications: TopicInfo;
    physicalEvidence: TopicInfo;
  };
  impact: {
    financialLoss: TopicInfo;
    emotionalImpact: TopicInfo;
    ongoingConsequences: TopicInfo;
    futureImplications: TopicInfo;
  };
  closing: {
    gapsFilled: TopicInfo;
    factsConfirmed: TopicInfo;
    readyForReport: TopicInfo;
  };
}

export interface InformationGaps {
  critical: string[]; // Must have for a complete case
  important: string[]; // Should have for a strong case
  optional: string[]; // Nice to have for additional context
}

export interface InformationTracker {
  topics: Partial<PhaseTopics>;
  gaps: InformationGaps;
  completeness: number; // 0-100 percentage
  lastUpdated: Date;
}

// Define required topics per phase
export const REQUIRED_TOPICS: Record<ConversationPhase, string[]> = {
  opening: ['mainIssue', 'involvedParties', 'basicContext'],
  timeline: ['startDate', 'keyEvents', 'eventSequence'],
  details: ['specificNames', 'locations', 'howItHappened'],
  legal: ['legalRelationships', 'obligations'],
  evidence: ['documents', 'witnesses', 'communications'],
  impact: ['financialLoss', 'emotionalImpact', 'ongoingConsequences'],
  closing: ['gapsFilled', 'factsConfirmed', 'readyForReport']
};

// Analyze response to extract covered topics
export function analyzeResponseForTopics(
  response: string,
  currentPhase: ConversationPhase
): string[] {
  const coveredTopics: string[] = [];
  const lowerResponse = response.toLowerCase();
  
  // Opening phase keywords
  if (currentPhase === 'opening') {
    if (lowerResponse.length > 100) coveredTopics.push('mainIssue');
    if (lowerResponse.match(/\b(he|she|they|company|person|employer|landlord)\b/)) {
      coveredTopics.push('involvedParties');
    }
    if (lowerResponse.length > 50) coveredTopics.push('basicContext');
  }
  
  // Timeline phase keywords
  if (currentPhase === 'timeline') {
    if (lowerResponse.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|last year|this year|ago)\b/i)) {
      coveredTopics.push('startDate');
    }
    if (lowerResponse.match(/\b(then|after|before|next|later|first|second)\b/)) {
      coveredTopics.push('eventSequence');
    }
    if (lowerResponse.match(/\b(date|when|time)\b/)) {
      coveredTopics.push('keyEvents');
    }
    if (lowerResponse.match(/\b(deadline|due|expire|must|by)\b/)) {
      coveredTopics.push('deadlines');
    }
  }
  
  // Details phase keywords
  if (currentPhase === 'details') {
    if (lowerResponse.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/)) { // Name pattern
      coveredTopics.push('specificNames');
    }
    if (lowerResponse.match(/\b(at|in|on|street|building|office|home|address)\b/)) {
      coveredTopics.push('locations');
    }
    if (lowerResponse.match(/\b(how|method|way|process|did|made|caused)\b/)) {
      coveredTopics.push('howItHappened');
    }
    if (lowerResponse.match(/\b(because|reason|why|wanted|intended)\b/)) {
      coveredTopics.push('motivations');
    }
  }
  
  // Legal phase keywords
  if (currentPhase === 'legal') {
    if (lowerResponse.match(/\b(contract|agreement|signed|terms|clause)\b/i)) {
      coveredTopics.push('contracts');
    }
    if (lowerResponse.match(/\b(employee|employer|tenant|landlord|client|customer)\b/i)) {
      coveredTopics.push('legalRelationships');
    }
    if (lowerResponse.match(/\b(must|should|required|obligated|duty|responsibility)\b/i)) {
      coveredTopics.push('obligations');
    }
    if (lowerResponse.match(/\b(breach|violated|broke|failed|didn't)\b/i)) {
      coveredTopics.push('violations');
    }
  }
  
  // Evidence phase keywords
  if (currentPhase === 'evidence') {
    if (lowerResponse.match(/\b(document|paper|file|pdf|letter|form)\b/i)) {
      coveredTopics.push('documents');
    }
    if (lowerResponse.match(/\b(witness|saw|present|there|observed)\b/i)) {
      coveredTopics.push('witnesses');
    }
    if (lowerResponse.match(/\b(email|text|message|call|wrote|sent)\b/i)) {
      coveredTopics.push('communications');
    }
    if (lowerResponse.match(/\b(photo|video|recording|picture|evidence)\b/i)) {
      coveredTopics.push('physicalEvidence');
    }
  }
  
  // Impact phase keywords
  if (currentPhase === 'impact') {
    if (lowerResponse.match(/\b(\$|€|£|kr|money|cost|paid|lost|expense)\b/i)) {
      coveredTopics.push('financialLoss');
    }
    if (lowerResponse.match(/\b(stress|anxiety|upset|hurt|emotional|feel|felt)\b/i)) {
      coveredTopics.push('emotionalImpact');
    }
    if (lowerResponse.match(/\b(still|continue|ongoing|now|current)\b/i)) {
      coveredTopics.push('ongoingConsequences');
    }
    if (lowerResponse.match(/\b(will|future|next|plan|worry|concern)\b/i)) {
      coveredTopics.push('futureImplications');
    }
  }
  
  return coveredTopics;
}

// Calculate completeness score
export function calculateCompleteness(tracker: InformationTracker): number {
  let totalTopics = 0;
  let coveredTopics = 0;
  
  Object.entries(tracker.topics).forEach(([phase, topics]) => {
    if (topics) {
      Object.values(topics).forEach((topic: TopicInfo) => {
        totalTopics++;
        if (topic.covered && topic.confidence !== 'none') {
          coveredTopics++;
        }
      });
    }
  });
  
  return totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;
}

// Identify gaps in information
export function identifyGaps(tracker: InformationTracker, currentPhase: ConversationPhase): InformationGaps {
  const gaps: InformationGaps = {
    critical: [],
    important: [],
    optional: []
  };
  
  // Check each phase up to current phase
  const phaseOrder: ConversationPhase[] = ['opening', 'timeline', 'details', 'legal', 'evidence', 'impact', 'closing'];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
  
  for (let i = 0; i <= currentPhaseIndex; i++) {
    const phase = phaseOrder[i];
    const phaseTopics = tracker.topics[phase];
    
    if (!phaseTopics) continue;
    
    Object.entries(phaseTopics).forEach(([topicKey, topic]) => {
      if (!topic.covered || topic.confidence === 'none') {
        const topicName = formatTopicName(topicKey);
        
        // Determine if critical, important, or optional
        if (REQUIRED_TOPICS[phase]?.includes(topicKey)) {
          if (phase === 'opening' || phase === 'timeline') {
            gaps.critical.push(`${topicName} (${phase})`);
          } else {
            gaps.important.push(`${topicName} (${phase})`);
          }
        } else {
          gaps.optional.push(`${topicName} (${phase})`);
        }
      } else if (topic.confidence === 'low') {
        gaps.important.push(`More details needed: ${formatTopicName(topicKey)} (${phase})`);
      }
    });
  }
  
  return gaps;
}

// Format topic key to readable name
function formatTopicName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Initialize tracker with all topics
export function initializeTracker(): InformationTracker {
  return {
    topics: {
      opening: {
        mainIssue: { topic: 'Main Issue', covered: false, confidence: 'none' },
        involvedParties: { topic: 'Involved Parties', covered: false, confidence: 'none' },
        basicContext: { topic: 'Basic Context', covered: false, confidence: 'none' },
      },
      timeline: {
        startDate: { topic: 'Start Date', covered: false, confidence: 'none' },
        keyEvents: { topic: 'Key Events', covered: false, confidence: 'none' },
        eventSequence: { topic: 'Event Sequence', covered: false, confidence: 'none' },
        deadlines: { topic: 'Deadlines', covered: false, confidence: 'none' },
      },
      details: {
        specificNames: { topic: 'Specific Names', covered: false, confidence: 'none' },
        locations: { topic: 'Locations', covered: false, confidence: 'none' },
        howItHappened: { topic: 'How It Happened', covered: false, confidence: 'none' },
        motivations: { topic: 'Motivations', covered: false, confidence: 'none' },
      },
      legal: {
        contracts: { topic: 'Contracts', covered: false, confidence: 'none' },
        legalRelationships: { topic: 'Legal Relationships', covered: false, confidence: 'none' },
        obligations: { topic: 'Obligations', covered: false, confidence: 'none' },
        violations: { topic: 'Violations', covered: false, confidence: 'none' },
      },
      evidence: {
        documents: { topic: 'Documents', covered: false, confidence: 'none' },
        witnesses: { topic: 'Witnesses', covered: false, confidence: 'none' },
        communications: { topic: 'Communications', covered: false, confidence: 'none' },
        physicalEvidence: { topic: 'Physical Evidence', covered: false, confidence: 'none' },
      },
      impact: {
        financialLoss: { topic: 'Financial Loss', covered: false, confidence: 'none' },
        emotionalImpact: { topic: 'Emotional Impact', covered: false, confidence: 'none' },
        ongoingConsequences: { topic: 'Ongoing Consequences', covered: false, confidence: 'none' },
        futureImplications: { topic: 'Future Implications', covered: false, confidence: 'none' },
      },
      closing: {
        gapsFilled: { topic: 'Gaps Filled', covered: false, confidence: 'none' },
        factsConfirmed: { topic: 'Facts Confirmed', covered: false, confidence: 'none' },
        readyForReport: { topic: 'Ready For Report', covered: false, confidence: 'none' },
      },
    },
    gaps: {
      critical: [],
      important: [],
      optional: [],
    },
    completeness: 0,
    lastUpdated: new Date(),
  };
}

// Update tracker with new information
export function updateTracker(
  tracker: InformationTracker,
  phase: ConversationPhase,
  response: string
): InformationTracker {
  const coveredTopics = analyzeResponseForTopics(response, phase);
  const updatedTracker = { ...tracker };
  
  // Update covered topics
  const phaseTopics = updatedTracker.topics[phase];
  if (phaseTopics) {
    coveredTopics.forEach(topicKey => {
      const topic = (phaseTopics as Record<string, TopicInfo>)[topicKey];
      if (topic) {
        topic.covered = true;
        // Determine confidence based on response length and detail
        if (response.length > 200) {
          topic.confidence = 'high';
        } else if (response.length > 100) {
          topic.confidence = 'medium';
        } else if (response.length > 30) {
          topic.confidence = 'low';
        }
      }
    });
  }
  
  // Recalculate completeness and gaps
  updatedTracker.completeness = calculateCompleteness(updatedTracker);
  updatedTracker.gaps = identifyGaps(updatedTracker, phase);
  updatedTracker.lastUpdated = new Date();
  
  return updatedTracker;
}
