// Type definitions for the extension

export enum MessageType {
  SAVE_JOB = 'SAVE_JOB',
  GET_JOBS = 'GET_JOBS',
  UPDATE_JOB = 'UPDATE_JOB',
  ANALYZE_JOB = 'ANALYZE_JOB',
  GET_USER_PROFILE = 'GET_USER_PROFILE',
  UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE',
  TOGGLE_PANEL = 'TOGGLE_PANEL',
  EXTRACT_JOB_DATA = 'EXTRACT_JOB_DATA',
  SYNC_TO_DASHBOARD = 'SYNC_TO_DASHBOARD',
  GENERATE_AI_SUMMARY = 'GENERATE_AI_SUMMARY',
  TRANSLATE_TEXT = 'TRANSLATE_TEXT',
  TEST_MESSAGE = 'TEST_MESSAGE'
}

export interface Message {
  type: MessageType | string;
  data?: any;
  requestId?: string;
}

export interface Job {
  id?: string;
  user_id?: string;
  linkedin_url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  required_skills?: string[];
  experience_required?: string;
  education_required?: string;
  salary_range?: string;
  job_type?: string; // Full-time, Part-time, Contract, etc.
  posted_date?: string;
  application_deadline?: string;
  match_score?: MatchScore;
  status: JobStatus;
  applied_date?: string;
  notes?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export enum JobStatus {
  SAVED = 'saved',
  APPLIED = 'applied',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface MatchScore {
  skills: number;
  experience: number;
  education: number;
  location: number;
  overall: number;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  email?: string;
  full_name?: string;
  headline?: string;
  summary?: string;
  location?: string;
  skills?: string[];
  experience?: number; // Years of experience
  education?: string;
  linkedin_url?: string;
  resume_url?: string;
  preferences?: UserPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  job_types?: string[];
  preferred_locations?: string[];
  salary_expectations?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  industries?: string[];
  company_sizes?: string[];
  remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any';
}

export interface LinkedInJobData {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  jobType?: string;
  experienceLevel?: string;
  postedDate?: string;
  applicants?: number;
  isEasyApply?: boolean;
}

export interface LinkedInProfileData {
  name?: string;
  headline?: string;
  location?: string;
  about?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  certifications?: CertificationItem[];
  profilePhoto?: boolean;
  banner?: boolean;
  customUrl?: boolean;
  openToWork?: boolean;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  duration: string;
  field?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date?: string;
}

export interface ProfileScore {
  category: string;
  score: number;
  maxScore: number;
  suggestions: string[];
}

export interface CVVersion {
  id: string;
  job_id?: string;
  content: string;
  version: number;
  created_at: string;
  is_active: boolean;
}

export interface CoverLetter {
  id: string;
  job_id: string;
  content: string;
  version: number;
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  job_id?: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'cultural';
  answer_template?: string;
  tips?: string[];
}