// Quiz Engine
import { pokemonData } from './data.js';

export class QuizEngine {
  constructor() {
    this.currentGame = null;
    this.currentTrack = null;
    this.audioElement = null;
  }

  initialize() {
    this.audioElement = document.getElementById('track');
  }

  // Generate random track for normal mode
  generateRandomTrack() {
    const randomGameIndex = Math.floor(Math.random() * pokemonData.games.length);
    const randomGame = pokemonData.games[randomGameIndex];
    const randomTrackIndex = Math.floor(Math.random() * randomGame.tracks.length);
    const randomTrack = randomGame.tracks[randomTrackIndex];
    
    this.currentGame = randomGame;
    this.currentTrack = randomTrack;
    
    return { game: randomGame, track: randomTrack };
  }

  // Generate deterministic daily question based on date
  generateDailyQuestion() {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').join('');
    
    // Simple seeded random number generator
    let seedNum = parseInt(seed);
    function seededRandom() {
      seedNum = (seedNum * 9301 + 49297) % 233280;
      return seedNum / 233280;
    }

    const gameIndex = Math.floor(seededRandom() * pokemonData.games.length);
    const game = pokemonData.games[gameIndex];
    const trackIndex = Math.floor(seededRandom() * game.tracks.length);
    const track = game.tracks[trackIndex];
    
    this.currentGame = game;
    this.currentTrack = track;
    
    return { game, track };
  }

  // Play current track
  playCurrentTrack() {
    if (this.audioElement && this.currentTrack) {
      this.audioElement.src = this.currentTrack.url;
      this.audioElement.play().catch(e => {
        console.warn('Audio autoplay failed:', e);
      });
    }
  }

  // Create option buttons
  createOptionButtons(container, onAnswerCallback) {
    if (!container) return;
    
    container.innerHTML = '';
    container.className = 'quiz-options';
    
    const gameNames = pokemonData.games.map(g => g.name);
    
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

  // Get all available games
  getAvailableGames() {
    return pokemonData.games.map(g => g.name);
  }
}