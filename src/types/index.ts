export interface AtsBreakdown {
  formatting: number;
  keywords: number;
  sections: number;
  readability: number;
  length_appropriateness: number;
}

export interface AtsScan {
  file_format: 'Pass' | 'Fail';
  text_readability: 'Good' | 'Average' | 'Poor';
  section_detection: 'Successful' | 'Partial' | 'Failed';
  keyword_extraction: 'Successful' | 'Partial' | 'Failed';
  formatting: 'Good' | 'Average' | 'Poor';
}

export interface SkillGap {
  candidate_skills: string[];
  required_skills: string[];
  match_percent: number;
}

export interface Keywords {
  present: string[];
  missing: string[];
  total_expected: number;
}

export interface ClaudeAnalysis {
  is_resume: boolean;
  rejection_reason: string | null;

  ats_score: number;
  ats_verdict: 'Poor' | 'Average' | 'Good' | 'Excellent';
  ats_breakdown: AtsBreakdown;

  overall_grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  grade_reasoning: string;

  job_match_percent: number | null;
  job_title_detected: string | null;
  job_match_verdict: string;

  keywords: Keywords;
  skill_gap: SkillGap;

  strengths: string[];
  improvements: string[];
  quick_suggestions: string[];

  ats_scan: AtsScan;

  experience_years: number | null;
  detected_sections: string[];
  missing_sections: string[];
  contact_info_present: boolean;
  summary_present: boolean;
  education_present: boolean;
}

export type AppState = 'upload' | 'processing' | 'rejected' | 'dashboard' | 'error';

export interface ProcessingStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export interface HistoryItem {
  id: string;
  fileName: string;
  analyzedAt: string;
  atsScore: number;
  grade: string;
  jobTitle: string | null;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
