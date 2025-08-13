-- 数据库迁移脚本：添加缺失的applicant_count列
-- 解决"Could not find the 'applicant_count' column of 'jobs' in the schema cache"错误

-- 检查并添加applicant_count列（如果不存在）
DO $$ 
BEGIN
    -- 检查applicant_count列是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'applicant_count'
    ) THEN
        -- 添加缺失的applicant_count列
        ALTER TABLE jobs ADD COLUMN applicant_count INTEGER;
        
        RAISE NOTICE 'Successfully added applicant_count column to jobs table';
    ELSE
        RAISE NOTICE 'applicant_count column already exists in jobs table';
    END IF;
END
$$;

-- 验证列是否存在并显示结果
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name = 'applicant_count';

-- 显示jobs表的完整结构以确认
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;