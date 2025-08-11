-- 只创建resumes表（其他表已存在）

-- 简历表
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    template_type TEXT DEFAULT 'modern',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（仅针对resumes表）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'resumes' 
        AND policyname = 'Users can manage own resumes'
    ) THEN
        CREATE POLICY "Users can manage own resumes" ON public.resumes
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

SELECT 'Resumes table created successfully! 🎉' as result;