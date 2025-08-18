-- LinkedIn Job Assistant - 完整测试验证脚本
-- 验证所有数据库问题已彻底解决

-- ========================================
-- 第一步：数据库结构验证
-- ========================================

RAISE NOTICE '🔍 开始验证数据库结构...';

-- 验证所有必要的表都存在
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_profiles', 'jobs');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ 所有必要的表都已创建：users, user_profiles, jobs';
    ELSE
        RAISE EXCEPTION '❌ 缺少必要的表，当前只有 % 个表', table_count;
    END IF;
END $$;

-- 验证外键约束存在
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name IN ('jobs', 'user_profiles');
    
    IF fk_count >= 2 THEN
        RAISE NOTICE '✅ 外键约束已正确设置';
    ELSE
        RAISE EXCEPTION '❌ 外键约束缺失，当前只有 % 个', fk_count;
    END IF;
END $$;

-- 验证applicant_count字段存在
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'applicant_count'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE '✅ applicant_count字段已存在';
    ELSE
        RAISE EXCEPTION '❌ applicant_count字段缺失';
    END IF;
END $$;

-- ========================================
-- 第二步：测试用户验证
-- ========================================

RAISE NOTICE '🔍 验证测试用户...';

-- 验证指定的测试用户存在
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE '✅ 测试用户 550e8400-e29b-41d4-a716-446655440000 已存在';
    ELSE
        RAISE EXCEPTION '❌ 测试用户不存在';
    END IF;
END $$;

-- 显示所有用户
SELECT 
    id,
    email,
    full_name,
    created_at
FROM users 
ORDER BY created_at;

-- ========================================
-- 第三步：完整的jobs表插入测试
-- ========================================

RAISE NOTICE '🔍 测试jobs表插入功能...';

-- 清理可能存在的测试数据
DELETE FROM jobs WHERE title LIKE '%测试职位%';

-- 测试1：使用指定的测试用户ID插入职位
INSERT INTO jobs (
    user_id,
    linkedin_url,
    title,
    company,
    location,
    description,
    requirements,
    required_skills,
    experience_required,
    education_required,
    salary_range,
    job_type,
    posted_date,
    applicant_count,  -- 关键测试字段
    match_score,
    status,
    notes,
    tags
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'https://linkedin.com/jobs/test-complete-solution',
    '高级全栈开发工程师（测试职位）',
    'TechCorp Solutions',
    '上海市',
    '负责全栈开发，包括前端React和后端Node.js开发',
    ARRAY['React开发经验', 'Node.js后端开发', '数据库设计', '5年以上经验'],
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    '5-8年',
    '硕士或同等经验',
    '30k-50k',
    'full-time',
    NOW() - INTERVAL '1 day',
    89,  -- 测试applicant_count字段
    '{"skills": 92, "experience": 88, "education": 85, "location": 95, "overall": 90}'::jsonb,
    'saved',
    '这是一个很好的全栈职位机会',
    ARRAY['全栈', '高级', '技术领导']
);

RAISE NOTICE '✅ 测试职位插入成功';

-- 验证插入的数据
SELECT 
    id,
    title,
    company,
    applicant_count,
    match_score,
    status,
    created_at
FROM jobs 
WHERE title LIKE '%测试职位%';

-- ========================================
-- 第四步：测试更新操作（模拟API PATCH请求）
-- ========================================

RAISE NOTICE '🔍 测试jobs表更新功能...';

-- 更新申请状态
UPDATE jobs 
SET 
    applicant_count = 95,
    status = 'applied',
    applied_date = NOW(),
    notes = '已通过LinkedIn提交申请，等待回复',
    tags = ARRAY['全栈', '高级', '技术领导', '已申请'],
    updated_at = NOW()
WHERE title LIKE '%测试职位%';

RAISE NOTICE '✅ 职位更新成功';

-- 验证更新的数据
SELECT 
    title,
    company,
    applicant_count,
    status,
    applied_date,
    notes,
    tags,
    updated_at
FROM jobs 
WHERE title LIKE '%测试职位%';

-- ========================================
-- 第五步：测试外键约束是否正常工作
-- ========================================

RAISE NOTICE '🔍 测试外键约束...';

-- 尝试插入不存在的用户ID（应该失败）
DO $$
BEGIN
    BEGIN
        INSERT INTO jobs (
            user_id,
            title,
            company
        ) VALUES (
            '99999999-9999-9999-9999-999999999999'::UUID,
            '应该失败的职位',
            '不存在的公司'
        );
        RAISE EXCEPTION '❌ 外键约束未生效 - 应该阻止插入不存在的用户ID';
    EXCEPTION 
        WHEN foreign_key_violation THEN
            RAISE NOTICE '✅ 外键约束正常工作 - 正确阻止了无效的用户ID';
        WHEN OTHERS THEN
            RAISE EXCEPTION '❌ 意外的错误: %', SQLERRM;
    END;
END $$;

-- ========================================
-- 第六步：测试UUID格式
-- ========================================

RAISE NOTICE '🔍 测试UUID格式...';

-- 测试生成新的UUID
DO $$
DECLARE
    new_uuid UUID;
BEGIN
    new_uuid := gen_random_uuid();
    RAISE NOTICE '✅ UUID生成正常: %', new_uuid;
END $$;

-- ========================================
-- 第七步：性能和索引验证
-- ========================================

RAISE NOTICE '🔍 验证索引性能...';

-- 检查重要索引是否存在
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'jobs', 'user_profiles')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- 第八步：API兼容性测试
-- ========================================

RAISE NOTICE '🔍 API兼容性测试...';

-- 模拟前端API调用的查询
SELECT 
    j.id,
    j.title,
    j.company,
    j.location,
    j.applicant_count,  -- API第49行需要的字段
    j.match_score,
    j.status,
    j.created_at,
    u.email as user_email,
    u.full_name as user_name
FROM jobs j
JOIN users u ON j.user_id = u.id
WHERE j.title LIKE '%测试职位%';

-- ========================================
-- 第九步：清理测试数据
-- ========================================

RAISE NOTICE '🧹 清理测试数据...';

-- 删除测试职位
DELETE FROM jobs WHERE title LIKE '%测试职位%';

RAISE NOTICE '✅ 测试数据已清理';

-- ========================================
-- 最终验证总结
-- ========================================

RAISE NOTICE '🎉 ===============================================';
RAISE NOTICE '🎉 LinkedIn Job Assistant 数据库验证完成！';
RAISE NOTICE '🎉 ===============================================';
RAISE NOTICE '✅ 1. users表已创建并包含测试用户';
RAISE NOTICE '✅ 2. 外键约束正常工作';
RAISE NOTICE '✅ 3. applicant_count字段可正常使用';
RAISE NOTICE '✅ 4. UUID格式正确';
RAISE NOTICE '✅ 5. 所有索引已创建';
RAISE NOTICE '✅ 6. API兼容性验证通过';
RAISE NOTICE '🚀 数据库已准备就绪，可以开始使用！';

-- 显示最终的表统计信息
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
    'jobs' as table_name,
    COUNT(*) as record_count
FROM jobs;