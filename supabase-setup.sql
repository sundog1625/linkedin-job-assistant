-- 这是你需要在 Supabase SQL Editor 中执行的完整脚本
-- 访问 https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- 复制粘贴这个脚本并点击 RUN

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE job_status AS ENUM ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn');
CREATE TYPE interview_category AS ENUM ('behavioral', 'technical', 'situational', 'cultural');
CREATE TYPE remote_preference AS ENUM ('remote', 'hybrid', 'onsite', 'any');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
CREATE TABLE IF NOT EXISTS public.jobs (
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
CREATE TABLE IF NOT EXISTS public.cv_versions (
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
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
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
CREATE TABLE IF NOT EXISTS public.profile_scores (
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
CREATE TABLE IF NOT EXISTS public.contacts (
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
CREATE TABLE IF NOT EXISTS public.ai_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'email', 'pitch', 'post', etc.
    title VARCHAR(255),
    content TEXT NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;
CREATE POLICY "Users can view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.jobs;
CREATE POLICY "Users can insert own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
CREATE POLICY "Users can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;
CREATE POLICY "Users can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- 为其他表创建类似的policies
DROP POLICY IF EXISTS "Users can manage own cvs" ON public.cv_versions;
CREATE POLICY "Users can manage own cvs" ON public.cv_versions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cover letters" ON public.cover_letters;
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own interview questions" ON public.interview_questions;
CREATE POLICY "Users can manage own interview questions" ON public.interview_questions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own profile scores" ON public.profile_scores;
CREATE POLICY "Users can manage own profile scores" ON public.profile_scores FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
CREATE POLICY "Users can manage own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own ai content" ON public.ai_content;
CREATE POLICY "Users can manage own ai content" ON public.ai_content FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_jobs_updated_at ON public.jobs;
CREATE TRIGGER handle_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_contacts_updated_at ON public.contacts;
CREATE TRIGGER handle_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 注意：示例数据需要在用户注册后插入
-- 这里只创建表结构，不插入示例数据
-- 用户注册后可以通过应用界面添加职位数据

-- 如果需要测试数据，请先确保有有效的用户ID，然后手动插入：
-- INSERT INTO public.jobs (user_id, linkedin_url, title, company, location, description, status, match_score, created_at)
-- VALUES 
--   (auth.uid(), 'https://linkedin.com/jobs/view/123456789', 'Senior Frontend Developer', 'Google', 'Mountain View, CA', 'We are looking for a Senior Frontend Developer...', 'saved', '{"skills": 85, "experience": 90, "education": 75, "location": 95, "overall": 86}'::jsonb, NOW());

-- 完成消息
SELECT 'Database setup completed successfully! 🎉' as message;