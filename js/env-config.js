// Simplified environment configuration
class EnvConfig {
  constructor() {
    this.config = {
      SUPABASE_URL: window.ENV?.VITE_SUPABASE_URL || 'https://pcfxnzrdzqbnkexqbvvc.supabase.co',
      SUPABASE_ANON_KEY: window.ENV?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZnhuenJkenFibmtleHFidnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ4MTIsImV4cCI6MjA3NTA2MDgxMn0.g_AFIXSaxgBYa0ZcQIt7UVhmRSYprGtgrn0op40nY5o'
    };
  }

  get(key) {
    return this.config[key];
  }

  validate() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !this.config[key]);

    if (missing.length > 0) {
      console.error('❌ Missing configuration:', missing);
      return false;
    }

    console.log('✅ Supabase configuration validated');
    return true;
  }
}

export const envConfig = new EnvConfig();