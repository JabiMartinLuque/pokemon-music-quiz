// Simple Router for Pokemon Quiz
export class SimpleRouter {
  constructor() {
    this.routes = {};
    this.currentMode = 'normal';
    this.onModeChange = null;
  }

  // Register route handlers
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to route
  navigate(path) {
    const mode = path === '/daily' ? 'daily' : 'normal';
    
    if (this.onModeChange && mode !== this.currentMode) {
      this.currentMode = mode;
      this.onModeChange(mode);
    }
    
    // Update URL without page reload
    if (window.location.pathname !== path) {
      window.history.pushState({ mode }, '', path);
    }
  }

  // Handle browser back/forward buttons
  handlePopState(event) {
    const mode = event.state?.mode || 'normal';
    if (this.onModeChange) {
      this.currentMode = mode;
      this.onModeChange(mode);
    }
  }

  // Initialize router
  initialize() {
    // Listen for back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });

    // Handle initial route
    const currentPath = window.location.pathname;
    const initialMode = currentPath.includes('daily') ? 'daily' : 'normal';
    this.currentMode = initialMode;
    
    return initialMode;
  }

  // Get current mode
  getCurrentMode() {
    return this.currentMode;
  }

  // Set mode change callback
  onModeChangeCallback(callback) {
    this.onModeChange = callback;
  }
}