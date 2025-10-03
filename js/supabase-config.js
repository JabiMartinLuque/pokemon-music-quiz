// Supabase Configuration with Environment Variables
import { envConfig } from './env-config.js';

// Initialize Supabase client
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

// Get configuration from environment
const SUPABASE_URL = envConfig.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = envConfig.get('SUPABASE_ANON_KEY');

// Validate configuration
if (!envConfig.validate()) {
  console.error('🚨 Supabase configuration is missing or invalid!');
  console.error('Please check your .env file or environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export { supabase }