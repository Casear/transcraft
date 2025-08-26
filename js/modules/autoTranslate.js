// Auto-translate Module
// Handles automatic translation functionality and domain-based settings

// Access functions from global scope directly

let currentDomain = window.location.hostname.replace('www.', '');
let settingsLoaded = false;

// Load auto-translate settings
async function loadAutoTranslateSettings() {
  try {
    await window.TransCraftDebug.initContentI18n();
    
    const result = await chrome.storage.sync.get(['debugMode', 'autoTranslateDomains']);
    
    // Set debug mode
    window.TransCraftDebug.setDebugMode(result.debugMode || false);
    
    // Set auto-translate state for current domain
    const autoTranslateDomains = result.autoTranslateDomains || {};
    window.TransCraftState.autoTranslateEnabled = autoTranslateDomains[currentDomain] || false;
    settingsLoaded = true;
    
    window.TransCraftDebug.debugLog('Auto-translate settings loaded for', currentDomain, ':', window.TransCraftState.autoTranslateEnabled);
    
    // Update UI when settings are loaded - retry multiple times to ensure button exists
    let retryCount = 0;
    const maxRetries = 10;
    const updateButtonWithRetry = () => {
      const translateSection = document.getElementById('translate-section');
      if (translateSection) {
        window.TransCraftFloatingButton.updateAutoTranslateButton();
        window.TransCraftDebug.debugLog('Auto-translate button updated successfully');
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(updateButtonWithRetry, 200);
        window.TransCraftDebug.debugLog(`Retrying auto-translate button update (${retryCount}/${maxRetries})`);
      } else {
        window.TransCraftDebug.debugLog('Failed to find translate-section after all retries');
      }
    };
    updateButtonWithRetry();
    
    // Initial auto-translate check after settings are loaded (only if enabled)
    if (window.TransCraftState.autoTranslateEnabled) {
      window.TransCraftDebug.debugLog('Settings loaded and auto-translate enabled, performing initial check');
      checkAndAutoTranslate();
    }
    
  } catch (error) {
    window.TransCraftDebug.debugError('Error loading auto-translate settings:', error);
  }
}

// Initialize settings from storage - this will be called from orchestrator

// Save auto-translate state
async function saveAutoTranslateState(enabled) {
  const result = await chrome.storage.sync.get(['autoTranslateDomains']);
  const autoTranslateDomains = result.autoTranslateDomains || {};
  
  if (enabled) {
    autoTranslateDomains[currentDomain] = true;
  } else {
    delete autoTranslateDomains[currentDomain];
  }
  
  await chrome.storage.sync.set({ autoTranslateDomains });
  window.TransCraftDebug.debugLog('Auto-translate state saved for', currentDomain, ':', enabled);
}

// Toggle auto-translate
async function toggleAutoTranslate() {
  window.TransCraftState.autoTranslateEnabled = !window.TransCraftState.autoTranslateEnabled;
  await saveAutoTranslateState(window.TransCraftState.autoTranslateEnabled);
  
  window.TransCraftDebug.debugLog('Auto-translate toggled for', currentDomain, ':', window.TransCraftState.autoTranslateEnabled);
  
  // Update button state with retry mechanism
  let retryCount = 0;
  const maxRetries = 5;
  const updateButtonWithRetry = () => {
    const translateSection = document.getElementById('translate-section');
    if (translateSection) {
      window.TransCraftFloatingButton.updateAutoTranslateButton();
      window.TransCraftDebug.debugLog('Auto-translate button updated after toggle');
    } else if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(updateButtonWithRetry, 100);
    }
  };
  updateButtonWithRetry();
  
  // If enabled, check for auto-translate immediately
  if (window.TransCraftState.autoTranslateEnabled) {
    setTimeout(() => {
      checkAndAutoTranslate();
    }, 1000);
  }
}

// Check and auto-translate
async function checkAndAutoTranslate() {
  if (!window.TransCraftState.autoTranslateEnabled || 
      window.TransCraftState.isTranslating || 
      window.TransCraftState.autoTranslateCompleted || 
      window.TransCraftState.isTranslated) {
    window.TransCraftDebug.debugLog('Auto-translate check skipped:', {
      autoTranslateEnabled: window.TransCraftState.autoTranslateEnabled,
      isTranslating: window.TransCraftState.isTranslating,
      autoTranslateCompleted: window.TransCraftState.autoTranslateCompleted,
      isTranslated: window.TransCraftState.isTranslated
    });
    return;
  }
  
  window.TransCraftDebug.debugLog('Auto-translate is enabled for', currentDomain, ', checking if page should be translated');
  
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if API is configured
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'enableLanguageDetection']);
  
  // Add current target language from state
  apiConfig.targetLanguage = window.TransCraftState.targetLanguage;
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    window.TransCraftDebug.debugLog('⚠️ Auto-translate skipped: No API configuration');
    return;
  }
  
  if (apiConfig.enableLanguageDetection !== false) {
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
    if (elements.length === 0) {
      window.TransCraftDebug.debugLog('⚠️ Auto-translate skipped: No translatable elements found');
      return;
    }
    
    window.TransCraftDebug.debugLog('🔍 Auto-translate: Performing language detection on', elements.length, 'elements');
    
    const sampleTexts = [];
    const maxSamples = 5;
    const minTextLength = 20;
    
    for (let i = 0; i < Math.min(elements.length, maxSamples); i++) {
      const index = Math.floor((elements.length / maxSamples) * i);
      const text = elements[index]?.textContent?.trim();
      if (text && text.length > minTextLength) {
        sampleTexts.push(text);
        window.TransCraftDebug.debugLog(`📝 Auto-translate Sample ${i + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)`);
      }
    }
    
    window.TransCraftDebug.debugLog(`✅ Auto-translate: Collected ${sampleTexts.length} valid samples`);
    
    if (sampleTexts.length > 0) {
      const combinedText = sampleTexts.join(' ');
      const settings = await chrome.storage.sync.get(['languageDetectionChars']);
      const detectionChars = settings.languageDetectionChars || 600;
      const sampleText = combinedText.substring(0, detectionChars);
      
      window.TransCraftDebug.debugLog(`🔤 Auto-translate: Combined text ${combinedText.length} → ${sampleText.length} chars`);
      
      const detectedLanguage = await window.TransCraftLanguageDetection.detectLanguage(sampleText);
      
      if (detectedLanguage && !window.TransCraftLanguageDetection.shouldTranslate(detectedLanguage, window.TransCraftState.targetLanguage)) {
        window.TransCraftDebug.debugLog('⏭️ Auto-translate skipped: content is already in target language', detectedLanguage);
        return;
      }
    }
  }
  
  window.TransCraftDebug.debugLog('Starting auto-translation for', window.TransCraftTranslationAPI.getTranslatableElements().length, 'elements');
  
  // Start translation using the main translation module
  if (window.TransCraftTranslation && window.TransCraftTranslation.translatePage) {
    window.TransCraftTranslation.translatePage();
  }
}

// Initialize auto-translate with multiple retry attempts
async function initializeAutoTranslate() {
  const maxInitRetries = 10;
  let initRetryCount = 0;
  
  const initWithRetry = async () => {
    try {
      await loadAutoTranslateSettings();
      window.TransCraftDebug.debugLog('Auto-translate initialized successfully');
    } catch (error) {
      if (initRetryCount < maxInitRetries) {
        initRetryCount++;
        setTimeout(initWithRetry, 1000);
        window.TransCraftDebug.debugLog(`Retrying auto-translate init (${initRetryCount}/${maxInitRetries})`);
      } else {
        window.TransCraftDebug.debugLog('Failed to initialize auto-translate after all retries');
      }
    }
  };
  
  // Start initialization
  initWithRetry();
}

// Listen for page URL changes (for SPAs)
function setupPageChangeListener() {
  let lastUrl = location.href;
  
  const checkForPageChange = () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      window.TransCraftDebug.debugLog('Page URL changed, reinitializing auto-translate');
      
      // Reset state for new page
      window.TransCraftState.isTranslated = false;
      window.TransCraftState.autoTranslateCompleted = false;
      
      setTimeout(() => {
        if (window.TransCraftState.autoTranslateEnabled) {
          checkAndAutoTranslate();
        }
      }, 2000); // Wait longer for SPA content to load
    }
  };
  
  // Check for URL changes periodically
  setInterval(checkForPageChange, 1000);
  
  // Also listen for popstate events (browser back/forward)
  window.addEventListener('popstate', () => {
    setTimeout(checkForPageChange, 100);
  });
}

// Export functions to global scope
window.TransCraftAutoTranslate = {
  loadAutoTranslateSettings,
  saveAutoTranslateState,
  toggleAutoTranslate,
  checkAndAutoTranslate,
  initializeAutoTranslate,
  setupPageChangeListener
};