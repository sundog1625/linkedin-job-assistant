/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();

const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'media.licdn.com'],
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

module.exports = withNextIntl(nextConfig);