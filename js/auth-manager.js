// Simple Authentication Manager
import { supabase } from './supabase-config.js';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.onAuthChange = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    // Check if user is already logged in (Supabase session)
    const { data: { user } } = await supabase.auth.getUser();
    this.currentUser = user;
    
    // If no Supabase session, check localStorage for auto-login
    if (!user) {
      await this.checkAutoLogin();
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      
      // Save/remove from localStorage
      if (session?.user) {
        this.saveUserToLocal(session.user);
      } else {
        this.removeUserFromLocal();
      }
      
      if (this.onAuthChange) {
        this.onAuthChange(this.currentUser);
      }
      console.log('🔐 Auth state changed:', event, this.currentUser?.email);
    });
  }

  // Auto-login from localStorage
  async checkAutoLogin() {
    const savedUser = localStorage.getItem('pokemon-quiz-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔄 Attempting auto-login for:', userData.email);
        
        // Try to refresh session
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data.user) {
          console.log('✅ Auto-login successful');
          this.currentUser = data.user;
        } else {
          console.log('⚠️ Auto-login failed, clearing saved data');
          this.removeUserFromLocal();
        }
      } catch (error) {
        console.log('⚠️ Error during auto-login:', error);
        this.removeUserFromLocal();
      }
    }
  }

  // Save user to localStorage
  saveUserToLocal(user) {
    const userData = {
      id: user.id,
      email: user.email,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('pokemon-quiz-user', JSON.stringify(userData));
    console.log('💾 User saved to localStorage');
  }

  // Remove user from localStorage
  removeUserFromLocal() {
    localStorage.removeItem('pokemon-quiz-user');
    console.log('🗑️ User removed from localStorage');
  }

  // Simple email/password login
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      console.log('✅ Signed in successfully:', data.user.email);
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error('❌ Sign in failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Simple email/password signup
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      console.log('✅ Signed up successfully:', data.user?.email);
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error('❌ Sign up failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Signed out successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Sign out failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Set callback for auth changes
  onAuthStateChange(callback) {
    this.onAuthChange = callback;
  }
}