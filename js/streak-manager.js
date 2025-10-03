// Daily Streak Manager
export class DailyStreakManager {
  constructor() {
    this.initializeStreak();
  }

  initializeStreak() {
    const today = this.getTodayString();
    const savedData = this.getSavedData();
    
    // Check if it's a new day
    if (savedData.lastCheckDate !== today) {
      // New day - reset daily completed status
      savedData.dailyCompleted = false;
      savedData.lastCheckDate = today;
      
      // Don't change streak here - only when completing daily
      this.saveData(savedData);
    }

    this.updateStreakDisplay();
  }

  getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  isConsecutiveDay(lastDate, today) {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffTime = current - last;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays === 1;
  }

  getSavedData() {
    const defaultData = {
      currentStreak: 0,
      bestStreak: 0,
      lastPlayDate: null,
      lastCheckDate: null,
      dailyCompleted: false,
      totalDailiesCompleted: 0
    };

    try {
      const saved = localStorage.getItem('pokemonQuizStreak');
      return saved ? {...defaultData, ...JSON.parse(saved)} : defaultData;
    } catch (e) {
      return defaultData;
    }
  }

  saveData(data) {
    localStorage.setItem('pokemonQuizStreak', JSON.stringify(data));
  }

  completeDailyChallenge(isCorrect) {
    const today = this.getTodayString();
    const savedData = this.getSavedData();
    
    console.log('Completing daily challenge:', {
      isCorrect,
      today,
      lastPlayDate: savedData.lastPlayDate,
      currentStreak: savedData.currentStreak
    });
    
    // Handle streak logic FIRST
    if (isCorrect) {
      // Correct answer
      if (savedData.lastPlayDate === null || savedData.lastPlayDate === today) {
        // First time ever or same day (shouldn't happen but safety check)
        savedData.currentStreak = 1;
      } else if (this.isConsecutiveDay(savedData.lastPlayDate, today)) {
        // Consecutive day
        savedData.currentStreak += 1;
      } else {
        // Gap in days - restart streak
        savedData.currentStreak = 1;
      }
      
      // Update best streak
      if (savedData.currentStreak > savedData.bestStreak) {
        savedData.bestStreak = savedData.currentStreak;
      }
    } else {
      // Wrong answer - reset streak
      savedData.currentStreak = 0;
    }
    
    // Mark daily as completed
    savedData.dailyCompleted = true;
    savedData.totalDailiesCompleted += 1;
    savedData.lastPlayDate = today;

    console.log('New streak data:', savedData);
    
    this.saveData(savedData);
    this.updateStreakDisplay();
    this.showStreakReward(savedData.currentStreak, isCorrect);
  }

  updateStreakDisplay() {
    const savedData = this.getSavedData();
    const currentStreakEl = document.getElementById('current-streak');
    const bestStreakEl = document.getElementById('best-streak');
    const statusEl = document.getElementById('daily-status');
    
    if (currentStreakEl) {
      currentStreakEl.textContent = `🔥 Streak: ${savedData.currentStreak} días`;
    }
    
    if (bestStreakEl) {
      bestStreakEl.textContent = `🏆 Mejor: ${savedData.bestStreak} días`;
    }
    
    if (statusEl) {
      if (savedData.dailyCompleted) {
        statusEl.innerHTML = '<span class="daily-complete">✅ Daily Challenge Completado! Vuelve mañana</span>';
      } else {
        statusEl.innerHTML = '<span class="daily-available">🎯 Daily Challenge disponible!</span>';
      }
    }
  }

  showStreakReward(streak, isCorrect) {
    let message = `¡Daily Challenge Completado! 🎉\n`;
    
    if (isCorrect) {
      message += '✅ ¡Respuesta Correcta!\n';
      if (streak === 1) {
        message += '\n🎯 ¡Primer día de tu streak!';
      } else if (streak % 7 === 0) {
        message += `\n🏆 ¡${streak} días consecutivos! ¡Recompensa semanal desbloqueada!`;
      } else if (streak % 30 === 0) {
        message += `\n👑 ¡${streak} días consecutivos! ¡Recompensa mensual épica!`;
      } else {
        message += `\n🔥 ¡Streak de ${streak} días!`;
      }
    } else {
      message += '❌ Respuesta incorrecta\n💔 Streak reiniciado a 0\n¡Inténtalo mañana!';
    }

    setTimeout(() => alert(message), 1000);
  }

  isDailyCompleted() {
    const savedData = this.getSavedData();
    return savedData.dailyCompleted;
  }

  getCurrentStreak() {
    const savedData = this.getSavedData();
    return savedData.currentStreak;
  }
}