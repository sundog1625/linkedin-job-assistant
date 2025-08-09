-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER database postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create custom types
CREATE TYPE job_status AS ENUM ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn');
CREATE TYPE interview_category AS ENUM ('behavioral', 'technical', 'situational', 'cultural');
CREATE TYPE remote_preference AS ENUM ('remote', 'hybrid', 'onsite', 'any');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    headline TEXT,
    summary TEXT,
    location VARCHAR(255),
    skills TEXT[], -- Array of skills
    experience INTEGER DEFAULT 0, -- Years of experience
    education TEXT,
    linkedin_url VARCHAR(500),
    resume_url VARCHAR(500),
    preferences JSONB DEFAULT '{}', -- User preferences as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    linkedin_url VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    requirements TEXT[],
    required_skills TEXT[],
    experience_required VARCHAR(100),
    education_required VARCHAR(255),
    salary_range VARCHAR(100),
    job_type VARCHAR(50),
    posted_date VARCHAR(50),
    application_deadline DATE,
    match_score JSONB, -- Match scores as JSON
    status job_status DEFAULT 'saved',
    applied_date DATE,
    interview_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Versions table
CREATE TABLE public.cv_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover Letters table
CREATE TABLE public.cover_letters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Questions table
CREATE TABLE public.interview_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    category interview_category NOT NULL,
    answer_template TEXT,
    tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile Scores table
CREATE TABLE public.profile_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    max_score INTEGER NOT NULL DEFAULT 100,
    suggestions TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Contacts table for networking
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    linkedin_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    tags TEXT[],
    last_contact DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generated Content table
CREATE TABLE public.ai_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'email', 'pitch', 'post', etc.
    title VARCHAR(255),
    content TEXT NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX idx_cv_versions_user_id ON public.cv_versions(user_id);
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX idx_interview_questions_user_id ON public.interview_questions(user_id);
CREATE INDEX idx_profile_scores_user_id ON public.profile_scores(user_id);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_ai_content_user_id ON public.ai_content(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User Profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Jobs
CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.jobs
    FOR DELETE USING (auth.uid() = user_id);

-- CV Versions
CREATE POLICY "Users can view own CVs" ON public.cv_versions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CVs" ON public.cv_versions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CVs" ON public.cv_versions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CVs" ON public.cv_versions
    FOR DELETE USING (auth.uid() = user_id);

-- Cover Letters
CREATE POLICY "Users can view own cover letters" ON public.cover_letters
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cover letters" ON public.cover_letters
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cover letters" ON public.cover_letters
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cover letters" ON public.cover_letters
    FOR DELETE USING (auth.uid() = user_id);

-- Interview Questions
CREATE POLICY "Users can view own interview questions" ON public.interview_questions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interview questions" ON public.interview_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interview questions" ON public.interview_questions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interview questions" ON public.interview_questions
    FOR DELETE USING (auth.uid() = user_id);

-- Profile Scores
CREATE POLICY "Users can view own profile scores" ON public.profile_scores
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile scores" ON public.profile_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile scores" ON public.profile_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Contacts
CREATE POLICY "Users can view own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

-- AI Content
CREATE POLICY "Users can view own AI content" ON public.ai_content
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI content" ON public.ai_content
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI content" ON public.ai_content
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI content" ON public.ai_content
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data for testing
INSERT INTO public.user_profiles (user_id, full_name, headline, email, skills, experience, location)
VALUES 
(uuid_generate_v4(), 'John Doe', 'Senior Software Engineer', 'john.doe@example.com', 
 ARRAY['JavaScript', 'React', 'Node.js', 'Python'], 5, 'San Francisco, CA');

-- Sample jobs
INSERT INTO public.jobs (user_id, linkedin_url, title, company, location, description, status, match_score)
VALUES 
((SELECT user_id FROM public.user_profiles LIMIT 1), 
 'https://linkedin.com/jobs/view/123456789', 
 'Senior Frontend Developer', 
 'Google', 
 'Mountain View, CA',
 'We are looking for a Senior Frontend Developer...',
 'saved',
 '{"skills": 85, "experience": 90, "education": 75, "location": 95, "overall": 86}'::jsonb);