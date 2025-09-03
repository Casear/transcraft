// ============================================================================
// TRANSCRAFT CONTENT SCRIPT - MAIN ORCHESTRATOR
// AI-powered webpage translation with modular architecture
// ============================================================================

// Main initialization and coordination script
(async function() {
  'use strict';
  
  // Ensure all modules are loaded before proceeding
  const waitForModules = () => {
    return new Promise((resolve) => {
      const checkModules = () => {
        if (window.TransCraftState && 
            window.TransCraftDebug && 
            window.TransCraftLanguageDetection &&
            window.TransCraftTranslationAPI &&
            window.TransCraftModal &&
            window.TransCraftFloatingButton &&
            window.TransCraftAutoTranslate &&
            window.TransCraftTranslation) {
          resolve();
        } else {
          setTimeout(checkModules, 50);
        }
      };
      checkModules();
    });
  };
  
  // Wait for modules to load
  await waitForModules();
  
  // Initialize state
  window.TransCraftState.init();
  
  // Initialize debug mode and i18n
  await window.TransCraftDebug.initDebugMode();
  await window.TransCraftDebug.initContentI18n();
  
  const { debugLog, debugError } = window.TransCraftDebug;
  
  debugLog('TransCraft modular content script starting initialization...');
  
  // Load target language setting
  await window.TransCraftFloatingButton.loadTargetLanguage();
  
  // Initialize floating button
  window.TransCraftFloatingButton.initializeFloatingButton();
  
  // Initialize auto-translate functionality
  window.TransCraftAutoTranslate.initializeAutoTranslate();
  
  // Setup page change listener for SPAs
  window.TransCraftAutoTranslate.setupPageChangeListener();
  
  // Ensure floating button is initialized with proper retry mechanism
  let buttonInitRetryCount = 0;
  const maxButtonInitRetries = 20;
  const initAutoTranslateButton = () => {
    const translateSection = document.getElementById('translate-section');
    if (translateSection) {
      window.TransCraftFloatingButton.updateAutoTranslateButton();
      debugLog('Auto-translate button initialized successfully');
    } else if (buttonInitRetryCount < maxButtonInitRetries) {
      buttonInitRetryCount++;
      setTimeout(initAutoTranslateButton, 200);
      debugLog(`Retrying auto-translate button init (${buttonInitRetryCount}/${maxButtonInitRetries})`);
    } else {
      debugLog('Failed to initialize auto-translate button after all retries');
    }
  };
  
  // Initialize button state after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAutoTranslateButton, 500);
    });
  } else {
    setTimeout(initAutoTranslateButton, 500);
  }
  
  // Handle messages from background script and popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debugLog('Received message:', request);
    
    if (request.action === 'updateTargetLanguage') {
      window.TransCraftState.targetLanguage = request.targetLanguage;
      window.TransCraftFloatingButton.updateLanguageButtonText();
      
      // Re-translate if already translated
      if (window.TransCraftState.isTranslated) {
        window.TransCraftTranslationAPI.restoreOriginalText();
        setTimeout(() => {
          window.TransCraftTranslation.translatePage();
        }, 100);
      }
    } else if (request.action === 'updateExpertMode') {
      window.TransCraftState.expertMode = request.expertMode || 'general';
      
      // Re-translate if already translated to apply new expert mode
      if (window.TransCraftState.isTranslated) {
        window.TransCraftTranslationAPI.restoreOriginalText();
        setTimeout(() => {
          window.TransCraftTranslation.translatePage();
        }, 100);
      }
    }
    
    sendResponse({ success: true });
  });
  
  debugLog('TransCraft modular content script fully initialized');
  debugLog('Available modules:', {
    State: !!window.TransCraftState,
    Debug: !!window.TransCraftDebug,
    LanguageDetection: !!window.TransCraftLanguageDetection,
    TranslationAPI: !!window.TransCraftTranslationAPI,
    Modal: !!window.TransCraftModal,
    FloatingButton: !!window.TransCraftFloatingButton,
    AutoTranslate: !!window.TransCraftAutoTranslate,
    Translation: !!window.TransCraftTranslation
  });
  
})().catch(error => {
  console.error('TransCraft initialization error:', error);
});