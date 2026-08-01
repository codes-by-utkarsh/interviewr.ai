export interface Session {
  id: string;
  user_id: string | null;
  resume_text: string | null;
  jd_text: string | null;
  status: 'created' | 'in_progress' | 'completed' | 'analyzed';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  role_title?: string | null;
}

export interface Turn {
  id: string;
  session_id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  audio_url?: string | null;
  created_at: string;
  turn_index: number;
}

export interface CategoryScores {
  communication: number;
  technical_depth: number;
  problem_solving: number;
  confidence_and_composure: number;
  resume_answer_consistency: number;
}

export interface Strength {
  quote: string;
  comment: string;
}

export interface Improvement {
  quote: string;
  comment: string;
  better_answer: string;
}

export interface Report {
  id: string;
  session_id: string;
  overall_score: number;
  category_scores: CategoryScores;
  strengths: Strength[];
  improvements: Improvement[];
  summary: string;
  created_at: string;
}
