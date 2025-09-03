// Debug and Utilities Module
// Handles debug logging and utility functions

// Global debug mode flag
let debugMode = false;

// Initialize debug mode from storage
async function initDebugMode() {
  try {
    const settings = await chrome.storage.sync.get(['debugMode']);
    debugMode = settings.debugMode || false;
  } catch (error) {
    console.warn('Failed to load debug mode setting:', error);
  }
}

// Set debug mode
function setDebugMode(enabled) {
  debugMode = enabled;
}

// Debug logging utilities
function debugLog(...args) {
  if (debugMode) {
    console.log('[TransCraft Debug]', ...args);
  }
}

function debugWarn(...args) {
  if (debugMode) {
    console.warn('[TransCraft Debug]', ...args);
  }
}

function debugError(...args) {
  if (debugMode) {
    console.error('[TransCraft Debug]', ...args);
  }
}

// Get localized message with fallback
function getLocalizedMessage(key, fallback = '') {
  if (window.i18nReady && window.i18n) {
    return window.i18n.getMessage(key);
  }
  return fallback;
}

// Initialize i18n for content scripts
async function initContentI18n() {
  try {
    await window.i18n.initI18n();
    window.i18nReady = true;
    debugLog('i18n initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize i18n, using fallback text:', error);
    window.i18nReady = false;
  }
}

// Show floating message utility
function showFloatingMessage(message, duration = 2000) {
  const messageContainer = document.getElementById('ai-translation-message-container') || 
    (() => {
      const container = document.createElement('div');
      container.id = 'ai-translation-message-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
      return container;
    })();

  const messageDiv = document.createElement('div');
  messageDiv.className = 'floating-message';
  messageDiv.style.cssText = `
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideInOut 0.3s ease, fadeOut 0.5s ease ${duration}ms forwards;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  messageDiv.textContent = message;

  // Add animation styles if not already present
  if (!document.getElementById('floating-message-styles')) {
    const style = document.createElement('style');
    style.id = 'floating-message-styles';
    style.textContent = `
      @keyframes slideInOut {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(20px); }
      }
    `;
    document.head.appendChild(style);
  }

  messageContainer.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
    if (messageContainer.children.length === 0) {
      messageContainer.remove();
    }
  }, duration + 500);
}

// Export functions to global scope for Chrome extension compatibility
window.TransCraftDebug = {
  initDebugMode,
  setDebugMode,
  debugLog,
  debugWarn,
  debugError,
  getLocalizedMessage,
  initContentI18n,
  showFloatingMessage
};