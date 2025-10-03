// Simple environment configuration loader
// This ensures we always have fallback values

// Initialize with current working credentials
window.ENV = {
  VITE_SUPABASE_URL: 'https://pcfxnzrdzqbnkexqbvvc.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZnhuenJkenFibmtleHFidnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ4MTIsImV4cCI6MjA3NTA2MDgxMn0.g_AFIXSaxgBYa0ZcQIt7UVhmRSYprGtgrn0op40nY5o'
};

console.log('🔧 Environment configuration loaded');