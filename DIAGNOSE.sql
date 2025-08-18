-- 诊断脚本 - 找出为什么还是报外键错误

-- 1. 检查users表中的具体数据
SELECT 'Users表中的数据:' as info;
SELECT id::TEXT, email FROM users;

-- 2. 检查jobs表的外键约束详情
SELECT 'Jobs表的外键约束:' as info;
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name,
    af.attname AS foreign_column_name
FROM
    pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE
    c.contype = 'f'
    AND c.conrelid = 'jobs'::regclass;

-- 3. 尝试直接插入一条测试记录
SELECT '尝试插入测试记录:' as info;
INSERT INTO jobs (
  user_id,
  title,
  company,
  location,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Direct Test Job',
  'Test Company',
  'Test Location',
  'saved'
) RETURNING id, user_id::TEXT, title;

-- 4. 检查是否有多个schema
SELECT '检查schema:' as info;
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name IN ('users', 'jobs')
ORDER BY table_schema, table_name;

-- 5. 检查users表的数据类型
SELECT '检查users表的id列数据类型:' as info;
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- 6. 检查jobs表的user_id数据类型
SELECT '检查jobs表的user_id列数据类型:' as info;
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'user_id';