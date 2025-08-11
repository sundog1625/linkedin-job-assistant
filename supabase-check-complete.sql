-- 检查并补全数据库设置
-- 只创建缺失的部分

-- 检查触发器函数是否存在，如果不存在则创建
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$;
    END IF;
END $$;

-- 检查并创建缺失的触发器
DO $$
BEGIN
    -- user_profiles触发器
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_user_profiles_updated_at') THEN
        CREATE TRIGGER handle_user_profiles_updated_at
            BEFORE UPDATE ON public.user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- jobs触发器
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_jobs_updated_at') THEN
        CREATE TRIGGER handle_jobs_updated_at
            BEFORE UPDATE ON public.jobs
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- contacts触发器
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_contacts_updated_at') THEN
        CREATE TRIGGER handle_contacts_updated_at
            BEFORE UPDATE ON public.contacts
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- resumes触发器
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_resumes_updated_at') THEN
        CREATE TRIGGER handle_resumes_updated_at
            BEFORE UPDATE ON public.resumes
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- ai_content触发器
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_ai_content_updated_at') THEN
        CREATE TRIGGER handle_ai_content_updated_at
            BEFORE UPDATE ON public.ai_content
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 创建有用的索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON public.ai_content(user_id);

SELECT 'Database setup completed! All tables, triggers, and indexes are ready. 🎉' as result;