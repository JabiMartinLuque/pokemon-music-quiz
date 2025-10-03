// Main App Logic
import { DailyStreakManager } from './streak-manager.js';
import { QuizEngine } from './quiz-engine.js';
import { SimpleRouter } from './router.js';

class PokemonMusicQuiz {
  constructor() {
    this.streakManager = new DailyStreakManager();
    this.quizEngine = new QuizEngine();
    this.router = new SimpleRouter();
    this.currentMode = 'normal';
    this.dailyAnswered = false;
    
    // DOM elements
    this.elements = {
      result: null,
      options: null,
      nextTrackBtn: null,
      normalModeBtn: null,
      dailyModeBtn: null,
      modeIndicator: null
    };
  }

  initialize() {
    // Initialize engines
    this.quizEngine.initialize();
    
    // Get DOM elements
    this.elements.result = document.getElementById('result');
    this.elements.options = document.getElementById('options');
    this.elements.nextTrackBtn = document.getElementById('next-track-btn');
    this.elements.normalModeBtn = document.getElementById('normal-mode-btn');
    this.elements.dailyModeBtn = document.getElementById('daily-mode-btn');
    this.elements.modeIndicator = document.getElementById('mode-indicator');
    
    // Set up router
    this.router.onModeChangeCallback((mode) => this.switchMode(mode));
    const initialMode = this.router.initialize();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize with current mode
    this.switchMode(initialMode);
  }

  setupEventListeners() {
    // Next track button
    if (this.elements.nextTrackBtn) {
      this.elements.nextTrackBtn.onclick = () => this.nextTrack();
    }
    
    // Mode buttons
    if (this.elements.normalModeBtn) {
      this.elements.normalModeBtn.onclick = () => this.navigateToMode('normal');
    }
    
    if (this.elements.dailyModeBtn) {
      this.elements.dailyModeBtn.onclick = () => this.navigateToMode('daily');
    }
  }

  navigateToMode(mode) {
    const path = mode === 'daily' ? '/daily' : '/';
    this.router.navigate(path);
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.dailyAnswered = false;
    
    // Update navigation buttons
    this.updateNavigationButtons(mode);
    
    // Clear previous results
    if (this.elements.result) {
      this.elements.result.innerHTML = '';
    }
    
    if (mode === 'daily') {
      this.startDailyMode();
    } else {
      this.startNormalMode();
    }
  }

  updateNavigationButtons(mode) {
    // Update mode indicator
    if (this.elements.modeIndicator) {
      if (mode === 'normal') {
        this.elements.modeIndicator.textContent = '🎵 Modo Práctica Libre';
        this.elements.modeIndicator.className = 'mode-indicator normal-active';
      } else {
        this.elements.modeIndicator.textContent = '🎯 Modo Daily Challenge';
        this.elements.modeIndicator.className = 'mode-indicator daily-active';
      }
    }
    
    // Update button states
    if (this.elements.normalModeBtn && this.elements.dailyModeBtn) {
      this.elements.normalModeBtn.classList.remove('active', 'normal-mode-active', 'daily-mode-active');
      this.elements.dailyModeBtn.classList.remove('active', 'normal-mode-active', 'daily-mode-active');
      
      if (mode === 'normal') {
        this.elements.normalModeBtn.classList.add('active', 'normal-mode-active');
      } else {
        this.elements.dailyModeBtn.classList.add('active', 'daily-mode-active');
      }
    }
  }

  startNormalMode() {
    // Show next track button
    if (this.elements.nextTrackBtn) {
      this.elements.nextTrackBtn.classList.remove('hidden');
    }
    
    // Start first track
    this.nextTrack();
  }

  startDailyMode() {
    // Hide next track button
    if (this.elements.nextTrackBtn) {
      this.elements.nextTrackBtn.classList.add('hidden');
    }
    
    // Check if daily is already completed
    if (this.streakManager.isDailyCompleted()) {
      this.showDailyCompleted();
      return;
    }
    
    // Generate and load daily question
    this.loadDailyQuestion();
  }

  showDailyCompleted() {
    const currentStreak = this.streakManager.getCurrentStreak();
    
    if (this.elements.result) {
      this.elements.result.innerHTML = `
        <div class="daily-completed">
          <h2>✅ Daily Challenge Completado</h2>
          <p>¡Vuelve mañana para el siguiente desafío!</p>
          <p>Streak actual: ${currentStreak} días</p>
        </div>
      `;
    }
    
    if (this.elements.options) {
      this.elements.options.innerHTML = '';
    }
  }

  loadDailyQuestion() {
    // Generate daily question
    this.quizEngine.generateDailyQuestion();
    
    // Update UI
    if (this.elements.result) {
      this.elements.result.innerHTML = `
        <div class="daily-question">
          <h2>🎯 Daily Challenge</h2>
          <p>¡Una canción, una oportunidad!</p>
          <p>Mantén tu streak respondiendo correctamente</p>
        </div>
      `;
    }
    
    // Play track and create options
    this.quizEngine.playCurrentTrack();
    this.quizEngine.createOptionButtons(this.elements.options, (answer) => this.checkAnswer(answer));
  }

  nextTrack() {
    if (this.currentMode !== 'normal') return;
    
    // Clear previous result
    if (this.elements.result) {
      this.elements.result.innerHTML = '';
    }
    
    // Generate random track
    this.quizEngine.generateRandomTrack();
    
    // Play track and create options
    this.quizEngine.playCurrentTrack();
    this.quizEngine.createOptionButtons(this.elements.options, (answer) => this.checkAnswer(answer));
  }

  checkAnswer(selectedGame) {
    const isCorrect = this.quizEngine.checkAnswer(selectedGame);
    const { game, track } = this.quizEngine.getCurrentInfo();
    
    if (this.currentMode === 'daily') {
      this.handleDailyAnswer(isCorrect, game, track);
    } else {
      this.handleNormalAnswer(isCorrect, game, track);
    }
  }

  handleDailyAnswer(isCorrect, game, track) {
    this.dailyAnswered = true;
    
    if (this.elements.result) {
      if (isCorrect) {
        this.elements.result.innerHTML = `
          <div class="daily-result success">
            <h2>✅ ¡Correcto!</h2>
            <p><strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
            <p>🔥 ¡Streak mantenido!</p>
          </div>
        `;
      } else {
        this.elements.result.innerHTML = `
          <div class="daily-result failure">
            <h2>❌ Incorrecto</h2>
            <p>Era: <strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
            <p>💔 Streak reiniciado</p>
          </div>
        `;
      }
    }
    
    // Complete daily challenge
    this.streakManager.completeDailyChallenge(isCorrect);
    
    // Show return button
    if (this.elements.options) {
      this.elements.options.innerHTML = `
        <button onclick="window.app.navigateToMode('normal')" class="next-track-btn">
          🔄 Volver al Modo Normal
        </button>
      `;
    }
  }

  handleNormalAnswer(isCorrect, game, track) {
    if (this.elements.result) {
      if (isCorrect) {
        this.elements.result.innerHTML = `
          <div class="result-correct">
            <h3>¡Correcto! 🎉</h3>
            <p><strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
          </div>
        `;
      } else {
        this.elements.result.innerHTML = `
          <div class="result-incorrect">
            <h3>Incorrecto ❌</h3>
            <p>Era: <strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
          </div>
        `;
      }
    }
  }
}

// Export the class for module import
export { PokemonMusicQuiz };