// Favorites Manager with Supabase - Your Schema
import { supabase } from './supabase-config.js';

export class FavoritesManager {
  constructor() {
    this.favorites = new Set(); // Local cache: Set of "gameName:trackName"
    this.tracksCache = new Map(); // Cache: trackName → track data from Supabase
    this.isOnline = false;
    this.currentUser = null;
    this.initializeSupabase();
  }

  async initializeSupabase() {
    try {
      // Check connection and get current user
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUser = user;
      
      // Test connection to tracks table
      const { data, error } = await supabase.from('tracks').select('count', { count: 'exact' });
      if (!error) {
        this.isOnline = true;
        console.log('✅ Supabase connected successfully');
        if (user) {
          console.log('👤 User authenticated:', user.email);
          await this.loadFavorites();
        } else {
          console.log('👤 No user authenticated, using local storage');
          this.loadFavoritesFromLocal();
        }
      }
    } catch (error) {
      console.warn('⚠️ Supabase offline, using localStorage fallback');
      this.loadFavoritesFromLocal();
    }
  }

  // Add track to favorites
  async addFavorite(trackName, gameName, generation) {
    const favoriteKey = `${gameName}:${trackName}`;
    
    if (this.isOnline && this.currentUser) {
      try {
        // Find the track in tracks table (should exist from migration)
        let trackId = await this.findTrackId(trackName, gameName);
        
        if (trackId) {
          // Then add to favorites table
          const { data, error } = await supabase
            .from('favorites')
            .insert({
              user_id: this.currentUser.id,
              track_id: trackId
            });
          
          if (!error) {
            this.favorites.add(favoriteKey);
            console.log('⭐ Added to favorites (Supabase):', trackName);
            return true;
          } else {
            console.error('Error adding to favorites:', error);
          }
        } else {
          // Track not found in database, save locally
          console.log('💾 Track not in database, saving to localStorage:', trackName);
          this.addFavoriteLocal(favoriteKey);
          return true;
        }
      } catch (error) {
        console.warn('Failed to save online, saving locally:', error);
        this.addFavoriteLocal(favoriteKey);
      }
    } else {
      this.addFavoriteLocal(favoriteKey);
    }
    return false;
  }

  // Find existing track with flexible search
  async findTrackId(trackName, gameName) {
    try {
      console.log('🔍 Searching for:', trackName, '|', gameName);
      
      // First try exact match (handle duplicates by taking first result)
      let { data: existingTracks, error: searchError } = await supabase
        .from('tracks')
        .select('id, name')
        .eq('name', trackName)
        .eq('game_name', gameName)
        .limit(1);
      
      console.log('📊 Search result:', existingTracks, 'Error:', searchError);
      
      if (!searchError && existingTracks && existingTracks.length > 0) {
        console.log('✅ Found track:', existingTracks[0].name);
        return existingTracks[0].id;
      }
      
      // If exact match fails, try flexible search (similar names in same game)
      console.log('🔍 Exact match failed, trying flexible search...');
      const { data: similarTracks, error: flexError } = await supabase
        .from('tracks')
        .select('id, name')
        .eq('game_name', gameName)
        .ilike('name', `%${trackName.replace(/[()]/g, '').trim()}%`);
      
      if (!flexError && similarTracks && similarTracks.length > 0) {
        console.log('✅ Found similar track:', similarTracks[0].name);
        return similarTracks[0].id;
      }
      
      // Last resort: try partial game name match
      const gameWords = gameName.split(' ');
      const { data: gameMatches, error: gameError } = await supabase
        .from('tracks')
        .select('id, name, game_name')
        .ilike('name', `%${trackName.split('(')[0].trim()}%`)
        .or(gameWords.map(word => `game_name.ilike.%${word}%`).join(','));
      
      if (!gameError && gameMatches && gameMatches.length > 0) {
        console.log('✅ Found game match:', gameMatches[0]);
        return gameMatches[0].id;
      }
      
      // Track not found anywhere - fall back to localStorage
      console.warn('❌ Track not found in database:', trackName, gameName);
      console.warn('💡 Falling back to localStorage favorites');
      console.warn('🔧 Consider re-running migration: await window.migrateTracksToSupabase()');
      
      // Add to local favorites as fallback
      const favoriteKey = `${gameName}:${trackName}`;
      this.addFavoriteLocal(favoriteKey);
      
      return null;
      
    } catch (error) {
      console.error('Error finding track:', error);
      return null;
    }
  }

  // Remove from favorites
  async removeFavorite(trackName, gameName) {
    const favoriteKey = `${gameName}:${trackName}`;
    
    if (this.isOnline && this.currentUser) {
      try {
        // Find the track first
        const { data: track, error: trackError } = await supabase
          .from('tracks')
          .select('id')
          .eq('name', trackName)
          .eq('game_name', gameName)
          .single();
        
        if (!trackError && track) {
          // Remove from favorites
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', this.currentUser.id)
            .eq('track_id', track.id);
          
          if (!error) {
            this.favorites.delete(favoriteKey);
            console.log('❌ Removed from favorites:', trackName);
            return true;
          }
        }
      } catch (error) {
        console.warn('Failed to remove online, removing locally:', error);
        this.removeFavoriteLocal(favoriteKey);
      }
    } else {
      this.removeFavoriteLocal(favoriteKey);
    }
    return false;
  }

  // Check if track is favorite
  isFavorite(trackName, gameName) {
    const favoriteKey = `${gameName}:${trackName}`;
    return this.favorites.has(favoriteKey);
  }

  // Load favorites from Supabase
  async loadFavorites() {
    if (!this.currentUser) {
      this.loadFavoritesFromLocal();
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          tracks (
            name,
            game_name,
            generation
          )
        `)
        .eq('user_id', this.currentUser.id);
      
      if (!error && data) {
        this.favorites.clear();
        data.forEach(fav => {
          if (fav.tracks) {
            const key = `${fav.tracks.game_name}:${fav.tracks.name}`;
            this.favorites.add(key);
          }
        });
        console.log(`📚 Loaded ${data.length} favorites from Supabase`);
      } else {
        console.error('Error loading favorites:', error);
        this.loadFavoritesFromLocal();
      }
    } catch (error) {
      console.warn('Failed to load from Supabase:', error);
      this.loadFavoritesFromLocal();
    }
  }

  // Get favorites by generation
  async getFavoritesByGeneration() {
    if (!this.isOnline) {
      return this.getFavoritesByGenerationLocal();
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('generation', { ascending: true });
      
      if (!error && data) {
        const byGeneration = {};
        data.forEach(fav => {
          if (!byGeneration[fav.generation]) {
            byGeneration[fav.generation] = [];
          }
          byGeneration[fav.generation].push(fav);
        });
        return byGeneration;
      }
    } catch (error) {
      console.warn('Failed to get favorites by generation');
    }
    
    return {};
  }

  // Local storage fallback methods
  addFavoriteLocal(favoriteKey) {
    this.favorites.add(favoriteKey);
    localStorage.setItem('pokemon-favorites', JSON.stringify([...this.favorites]));
  }

  removeFavoriteLocal(favoriteKey) {
    this.favorites.delete(favoriteKey);
    localStorage.setItem('pokemon-favorites', JSON.stringify([...this.favorites]));
  }

  loadFavoritesFromLocal() {
    const saved = localStorage.getItem('pokemon-favorites');
    if (saved) {
      this.favorites = new Set(JSON.parse(saved));
      console.log(`📚 Loaded ${this.favorites.size} favorites from localStorage`);
    }
  }

  getFavoritesByGenerationLocal() {
    // Simple local implementation
    const byGeneration = {};
    this.favorites.forEach(key => {
      const [gameName, trackName] = key.split(':');
      // You'd map game names to generations here
      const gen = this.getGenerationFromGame(gameName);
      if (!byGeneration[gen]) byGeneration[gen] = [];
      byGeneration[gen].push({ game_name: gameName, track_name: trackName, generation: gen });
    });
    return byGeneration;
  }

  getGenerationFromGame(gameName) {
    const genMap = {
      'Pokemon Fire Red Leaf Green': 1,
      'Pokemon Heart Gold Soul Silver': 2,
      'Pokemon Ruby Sapphire Emerald': 3,
      'Pokemon Diamond Pearl Platinum': 4,
      'Pokemon Black White': 5,
      'Pokemon X Y': 6,
      'Pokemon Sun Moon': 7
    };
    return genMap[gameName] || 1;
  }
}