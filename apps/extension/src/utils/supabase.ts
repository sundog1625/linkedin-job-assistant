import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These will be replaced with actual values from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xnbfqwytxvqeftqavuqj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYmZxd3l0eHZxZWZ0cWF2dXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzIyMjksImV4cCI6MjA3MDMwODIyOX0.nUWeZOqBKYzc7uO9iPe1nOM0HZYru-vSLscKt9dsiS4';

let supabaseClient: SupabaseClient | null = null;

export function initializeSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
}