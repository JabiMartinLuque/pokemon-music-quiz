// Main App Logic
import { DailyStreakManager } from './streak-manager.js';
import { QuizEngine } from './quiz-engine.js';
import { SimpleRouter } from './router.js';
import { FavoritesManager } from './favorites-manager.js';
import { AuthManager } from './auth-manager.js';
import { StatsManager } from './stats-manager.js';

class PokemonMusicQuiz {
  constructor() {
    this.streakManager = new DailyStreakManager();
    this.quizEngine = new QuizEngine();
    this.router = new SimpleRouter();
    this.favoritesManager = new FavoritesManager();
    this.authManager = new AuthManager();
    this.statsManager = new StatsManager();
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
    this.setupAuthListeners();
    
    // Listen for auth changes
    this.authManager.onAuthStateChange((user) => {
      this.updateUserInterface(user);
      // Refresh favorites when user changes
      this.favoritesManager.currentUser = user;
      if (user) {
        this.favoritesManager.loadFavorites();
      }
    });
    
    // Initialize with current mode
    this.switchMode(initialMode);
    
    // Update UI with current user
    this.updateUserInterface(this.authManager.getCurrentUser());
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

  async loadDailyQuestion() {
    try {
      // Generate daily question
      await this.quizEngine.generateDailyQuestion();
      
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
      await this.quizEngine.createOptionButtons(this.elements.options, (answer) => this.checkAnswer(answer));
    } catch (error) {
      console.error('Error loading daily question:', error);
      if (this.elements.result) {
        this.elements.result.innerHTML = `
          <div class="error-message">
            <h3>Error cargando pregunta diaria</h3>
            <p>Por favor, intenta de nuevo más tarde</p>
          </div>
        `;
      }
    }
  }

  async nextTrack() {
    if (this.currentMode !== 'normal') return;
    
    try {
      // Clear previous result
      if (this.elements.result) {
        this.elements.result.innerHTML = '';
      }
      
      // Generate random track
      await this.quizEngine.generateRandomTrack();
      
      // Play track and create options
      this.quizEngine.playCurrentTrack();
      await this.quizEngine.createOptionButtons(this.elements.options, (answer) => this.checkAnswer(answer));
    } catch (error) {
      console.error('Error loading next track:', error);
      if (this.elements.result) {
        this.elements.result.innerHTML = `
          <div class="error-message">
            <h3>Error cargando canción</h3>
            <p>Por favor, intenta de nuevo</p>
          </div>
        `;
      }
    }
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
    
    // Update stats for daily mode
    this.updateUserStats(isCorrect, this.streakManager.getDailyStreak());
    
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
      const isFav = this.favoritesManager.isFavorite(track.title, game.name);
      const favButton = `
        <button id="fav-btn-${Date.now()}" data-track="${track.title}" data-game="${game.name}"
                class="favorite-btn ${isFav ? 'active' : ''}">
          ${isFav ? '⭐ Favorito' : '☆ Añadir a Favoritos'}
        </button>
      `;
      
      if (isCorrect) {
        this.elements.result.innerHTML = `
          <div class="result-correct">
            <h3>¡Correcto! 🎉</h3>
            <p><strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
            ${favButton}
          </div>
        `;
      } else {
        this.elements.result.innerHTML = `
          <div class="result-incorrect">
            <h3>Incorrecto ❌</h3>
            <p>Era: <strong>${game.name}</strong></p>
            <p>🎵 ${track.title}</p>
            ${favButton}
          </div>
        `;
      }
      
      // Add event listener to favorite button after DOM update
      setTimeout(() => {
        const favBtn = this.elements.result.querySelector('.favorite-btn');
        if (favBtn) {
          favBtn.onclick = (e) => {
            e.preventDefault();
            const trackName = favBtn.dataset.track;
            const gameName = favBtn.dataset.game;
            console.log('🎯 Favorite button clicked:', trackName, '|', gameName);
            this.toggleFavorite(trackName, gameName);
          };
        }
      }, 10);
    }
    
    // Update stats for normal mode
    this.updateUserStats(isCorrect, 0); // Normal mode doesn't use streak
  }

  // Toggle favorite track
  async toggleFavorite(trackName, gameName) {
    const generation = this.favoritesManager.getGenerationFromGame(gameName);
    
    if (this.favoritesManager.isFavorite(trackName, gameName)) {
      await this.favoritesManager.removeFavorite(trackName, gameName);
    } else {
      await this.favoritesManager.addFavorite(trackName, gameName, generation);
    }
    
    // Refresh the result display
    const { game, track } = this.quizEngine.getCurrentInfo();
    this.handleNormalAnswer(true, game, track); // Refresh display
  }

  // Setup auth event listeners
  setupAuthListeners() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authCancel = document.getElementById('auth-cancel');
    const authToggleLink = document.getElementById('auth-toggle-link');

    if (loginBtn) {
      loginBtn.onclick = () => this.showAuthModal();
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => this.handleLogout();
    }

    if (authCancel) {
      authCancel.onclick = () => this.hideAuthModal();
    }

    if (authForm) {
      authForm.onsubmit = (e) => this.handleAuthSubmit(e);
    }

    if (authToggleLink) {
      authToggleLink.onclick = () => this.toggleAuthMode();
    }

    // Close modal on backdrop click
    if (authModal) {
      authModal.onclick = (e) => {
        if (e.target === authModal) {
          this.hideAuthModal();
        }
      };
    }
  }

  // Show auth modal
  showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('show');
      this.authMode = 'login';
      this.updateAuthModal();
    }
  }

  // Hide auth modal
  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('show');
      this.clearAuthForm();
    }
  }

  // Toggle between login and signup
  toggleAuthMode() {
    this.authMode = this.authMode === 'login' ? 'signup' : 'login';
    this.updateAuthModal();
  }

  // Update auth modal UI
  updateAuthModal() {
    const title = document.getElementById('auth-title');
    const submit = document.getElementById('auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleLink = document.getElementById('auth-toggle-link');

    if (this.authMode === 'login') {
      title.textContent = 'Iniciar Sesión';
      submit.textContent = 'Entrar';
      toggleText.textContent = '¿No tienes cuenta?';
      toggleLink.textContent = 'Regístrate';
    } else {
      title.textContent = 'Crear Cuenta';
      submit.textContent = 'Registrarse';
      toggleText.textContent = '¿Ya tienes cuenta?';
      toggleLink.textContent = 'Inicia sesión';
    }
  }

  // Handle auth form submission
  async handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const messageEl = document.getElementById('auth-message');

    if (!email || !password) {
      this.showAuthMessage('Por favor completa todos los campos', 'error');
      return;
    }

    this.showAuthMessage('Procesando...', 'info');

    try {
      let result;
      if (this.authMode === 'login') {
        result = await this.authManager.signIn(email, password);
      } else {
        result = await this.authManager.signUp(email, password);
      }

      if (result.success) {
        this.showAuthMessage(
          this.authMode === 'login' ? '¡Bienvenido!' : '¡Cuenta creada! Revisa tu email.',
          'success'
        );
        setTimeout(() => this.hideAuthModal(), 1500);
      } else {
        this.showAuthMessage(result.error || 'Error desconocido', 'error');
      }
    } catch (error) {
      this.showAuthMessage('Error de conexión', 'error');
    }
  }

  // Handle logout
  async handleLogout() {
    const result = await this.authManager.signOut();
    if (result.success) {
      console.log('✅ Logout successful');
    }
  }

  // Show auth message
  showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `auth-message auth-${type}`;
    }
  }

  // Clear auth form
  clearAuthForm() {
    const form = document.getElementById('auth-form');
    if (form) {
      form.reset();
    }
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
      messageEl.textContent = '';
      messageEl.className = 'auth-message';
    }
  }

  // Update user interface
  updateUserInterface(user) {
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
      // User is logged in
      if (userInfo) userInfo.textContent = `👤 ${user.email}`;
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      
      // Load and display user stats
      this.loadUserStats(user.id);
    } else {
      // User is not logged in
      if (userInfo) userInfo.textContent = '🎵 Modo invitado';
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  // Update user statistics
  async updateUserStats(isCorrect, currentStreak = 0) {
    const user = this.authManager.getCurrentUser();
    if (!user) return; // Don't track stats for guests

    try {
      const gameResult = {
        correctAnswers: isCorrect ? 1 : 0,
        bestStreak: currentStreak
      };

      await this.statsManager.updateStats(user.id, gameResult);
      
      // Update streak if it's a new best
      if (currentStreak > 0) {
        await this.statsManager.updateStreak(user.id, currentStreak);
      }
      
      // Refresh stats display
      this.displayUserStats();
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Load user statistics
  async loadUserStats(userId) {
    try {
      await this.statsManager.getUserStats(userId);
      this.displayUserStats();
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  // Display user statistics in the UI
  displayUserStats() {
    const statsContainer = document.getElementById('user-stats');
    if (!statsContainer) return;

    const stats = this.statsManager.getFormattedStats();
    if (!stats) {
      statsContainer.innerHTML = '';
      return;
    }

    statsContainer.innerHTML = `
      <div class="stats-display">
        <div class="stat-item">
          <span class="stat-label">Partidas:</span>
          <span class="stat-value">${stats.totalPlays}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Aciertos:</span>
          <span class="stat-value">${stats.correctAnswers}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Precisión:</span>
          <span class="stat-value">${stats.accuracy}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Mejor Racha:</span>
          <span class="stat-value">${stats.bestStreak}</span>
        </div>
      </div>
    `;
  }
}

// Export the class for module import
export { PokemonMusicQuiz };