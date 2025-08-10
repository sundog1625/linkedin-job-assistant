'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types for our database schema
export interface Job {
  id: string
  user_id: string
  linkedin_url: string
  title: string
  company: string
  location: string
  description: string
  requirements?: string[]
  required_skills?: string[]
  experience_required?: string
  education_required?: string
  salary_range?: string
  job_type?: string
  posted_date?: string
  application_deadline?: string
  match_score?: {
    skills: number
    experience: number
    education: number
    location: number
    overall: number
  }
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  applied_date?: string
  interview_date?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  email?: string
  full_name?: string
  headline?: string
  summary?: string
  location?: string
  skills?: string[]
  experience?: number
  education?: string
  linkedin_url?: string
  resume_url?: string
  preferences?: {
    job_types?: string[]
    preferred_locations?: string[]
    salary_expectations?: {
      min?: number
      max?: number
      currency?: string
    }
    industries?: string[]
    company_sizes?: string[]
    remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any'
  }
  created_at: string
  updated_at: string
}

export interface CVVersion {
  id: string
  user_id: string
  job_id?: string
  title: string
  content: string
  version: number
  is_active: boolean
  created_at: string
}

export interface CoverLetter {
  id: string
  user_id: string
  job_id: string
  content: string
  version: number
  created_at: string
}

export interface InterviewQuestion {
  id: string
  user_id: string
  job_id?: string
  question: string
  category: 'behavioral' | 'technical' | 'situational' | 'cultural'
  answer_template?: string
  tips?: string[]
  created_at: string
}

export interface ProfileScore {
  id: string
  user_id: string
  category: string
  score: number
  max_score: number
  suggestions: string[]
  updated_at: string
}

// Supabase context for React components
const SupabaseContext = createContext<{
  supabase: SupabaseClient
  user: any
  loading: boolean
}>({
  supabase,
  user: null,
  loading: true,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // This should be in a .tsx file
  return { supabase, user, loading }
}

// Helper function to get user session
export const getUserSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Database operations
export class JobsService {
  static async getJobs(userId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createJob(job: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getJobsByStatus(userId: string, status: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

export class ProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createOrUpdateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getProfileScores(userId: string): Promise<ProfileScore[]> {
    const { data, error } = await supabase
      .from('profile_scores')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }
}