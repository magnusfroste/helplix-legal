export type CaseType = 
  | 'general'
  | 'travel_damage'
  | 'consumer'
  | 'insurance'
  | 'housing'
  | 'employment'
  | 'personal_injury';

export type SessionStatus = 'active' | 'completed' | 'archived';

export interface SessionWithMetadata {
  id: string;
  title: string | null;
  case_type: CaseType;
  status: SessionStatus;
  summary: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export const CASE_TYPE_ICONS: Record<CaseType, string> = {
  general: 'FileText',
  travel_damage: 'Plane',
  consumer: 'ShoppingBag',
  insurance: 'Shield',
  housing: 'Home',
  employment: 'Briefcase',
  personal_injury: 'Heart',
};
