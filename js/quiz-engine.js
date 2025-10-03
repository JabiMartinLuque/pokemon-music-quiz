// Quiz Engine
import { supabase } from './supabase-config.js';

export class QuizEngine {
  constructor() {
    this.currentGame = null;
    this.currentTrack = null;
    this.audioElement = null;
  }

  initialize() {
    this.audioElement = document.getElementById('track');
  }

  // Generate random track for normal mode using Supabase
  async generateRandomTrack() {
    try {
      // Get a random track from Supabase
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .limit(1000); // Get reasonable sample
      
      if (error || !tracks || tracks.length === 0) {
        console.error('Error loading tracks:', error);
        return null;
      }

      // Pick random track
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      
      // Create game object from track data
      const game = { name: randomTrack.game_name };
      const track = { 
        title: randomTrack.title,
        file: randomTrack.file_url 
      };
      
      this.currentGame = game;
      this.currentTrack = track;
      
      return { game, track };
    } catch (error) {
      console.error('Error generating random track:', error);
      return null;
    }
  }

  // Generate deterministic daily question based on date using Supabase
  async generateDailyQuestion() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const seed = today.split('-').join('');
      
      // Get all tracks from Supabase
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*');
      
      if (error || !tracks || tracks.length === 0) {
        console.error('Error loading tracks for daily question:', error);
        return null;
      }

      // Simple seeded random number generator
      let seedNum = parseInt(seed);
      function seededRandom() {
        seedNum = (seedNum * 9301 + 49297) % 233280;
        return seedNum / 233280;
      }

      // Pick deterministic track based on date
      const trackIndex = Math.floor(seededRandom() * tracks.length);
      const selectedTrack = tracks[trackIndex];
      
      // Create game and track objects
      const game = { name: selectedTrack.game_name };
      const track = { 
        title: selectedTrack.title,
        file: selectedTrack.file_url 
      };
      
      this.currentGame = game;
      this.currentTrack = track;
      
      return { game, track };
    } catch (error) {
      console.error('Error generating daily question:', error);
      return null;
    }
  }

  // Play current track
  playCurrentTrack() {
    if (this.audioElement && this.currentTrack) {
      this.audioElement.src = this.currentTrack.file;
      this.audioElement.play().catch(e => {
        console.warn('Audio autoplay failed:', e);
      });
    }
  }

  // Create option buttons using Supabase data
  async createOptionButtons(container, onAnswerCallback) {
    if (!container) return;
    
    container.innerHTML = '';
    container.className = 'quiz-options';
    
    const gameNames = await this.getAvailableGames();
    
    gameNames.forEach(gameName => {
      const button = document.createElement('button');
      button.textContent = gameName;
      button.onclick = () => onAnswerCallback(gameName);
      container.appendChild(button);
    });
  }

  // Check if answer is correct
  checkAnswer(selectedGame) {
    return selectedGame === this.currentGame.name;
  }

  // Get current game and track info
  getCurrentInfo() {
    return {
      game: this.currentGame,
      track: this.currentTrack
    };
  }

  // Get all available games from Supabase
  async getAvailableGames() {
    try {
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('game_name');
      
      if (error) {
        console.error('Error loading games:', error);
        return [];
      }

      // Get unique game names
      const uniqueGames = [...new Set(tracks.map(track => track.game_name))];
      return uniqueGames.sort();
    } catch (error) {
      console.error('Error getting available games:', error);
      return [];
    }
  }
}