// Global State Management Module
// Centralized state management for the extension

// Initialize global state
window.TransCraftState = {
  // Translation state
  isTranslated: false,
  isTranslating: false,
  autoTranslateCompleted: false,
  
  // Settings
  targetLanguage: 'zh-TW',
  expertMode: 'general',
  debugMode: false,
  autoTranslateEnabled: false,
  
  // UI state
  isLanguageMenuOpen: false,
  i18nReady: false,
  
  // Data storage
  translationElements: new Map(), // Map of translation divs to their parent elements
  
  // Domain info
  currentDomain: window.location.hostname.replace('www.', '')
};

// State management functions
window.TransCraftState.setState = function(newState) {
  Object.assign(this, newState);
};

window.TransCraftState.getState = function() {
  return {
    isTranslated: this.isTranslated,
    isTranslating: this.isTranslating,
    autoTranslateCompleted: this.autoTranslateCompleted,
    targetLanguage: this.targetLanguage,
    expertMode: this.expertMode,
    debugMode: this.debugMode,
    autoTranslateEnabled: this.autoTranslateEnabled,
    isLanguageMenuOpen: this.isLanguageMenuOpen,
    i18nReady: this.i18nReady,
    currentDomain: this.currentDomain
  };
};

window.TransCraftState.reset = function() {
  this.isTranslated = false;
  this.isTranslating = false;
  this.autoTranslateCompleted = false;
  this.translationElements.clear();
};

// Export state object
window.TransCraftState.init = function() {
  console.log('TransCraft state initialized for domain:', this.currentDomain);
};