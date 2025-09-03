// Floating Button Module
// Handles floating button UI, language menu, and button interactions

// Access functions from global scope directly

let floatingButton = null;
let isLanguageMenuOpen = false;

// Create floating button
function createFloatingButton() {
  if (floatingButton) return;
  
  // Create floating button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'ai-translation-floating-container';
  
  // Combined button
  floatingButton = document.createElement('div');
  floatingButton.id = 'ai-translation-floating-button';
  floatingButton.innerHTML = `
    <div class="floating-button-content">
      <!-- Left side translation area -->
      <div class="button-left-section" id="translate-section">
        <svg class="button-icon translate-icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.89-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z"/>
        </svg>
        <svg class="button-icon loading-icon" viewBox="0 0 24 24" style="display: none;">
          <circle class="progress-ring" cx="12" cy="12" r="10" fill="none" stroke-width="2"/>
          <circle class="progress-ring-fill" cx="12" cy="12" r="10" fill="none" stroke-width="2"/>
        </svg>
        <svg class="button-icon error-icon" viewBox="0 0 24 24" style="display: none;">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <div class="progress-text" style="display: none;"></div>
      </div>
      
      <!-- Language detection display area -->
      <div class="detected-language-section" id="detected-language-section" style="display: none;">
        <span class="detected-language-text" id="detected-language-text"></span>
      </div>
      
      <!-- Divider -->
      <div class="button-divider"></div>
      
      <!-- Right side language area -->
      <div class="button-right-section" id="language-section">
        <span class="language-text" id="current-language">中</span>
        <svg class="language-arrow" viewBox="0 0 24 24" width="10" height="10">
          <path d="M7 10l5 5 5-5z" fill="white"/>
        </svg>
      </div>
    </div>
  `;
  
  // Language selection menu
  const languageMenu = document.createElement('div');
  languageMenu.id = 'ai-translation-language-menu';
  languageMenu.innerHTML = `
    <div class="language-menu-content">
      <div class="language-option" data-lang="zh-TW" data-text="中">🇹🇼 繁體中文</div>
      <div class="language-option" data-lang="zh-CN" data-text="简">🇨🇳 簡體中文</div>
      <div class="language-option" data-lang="en" data-text="EN">🇺🇸 English</div>
      <div class="language-option" data-lang="ja" data-text="日">🇯🇵 日本語</div>
      <div class="language-option" data-lang="ko" data-text="한">🇰🇷 한국어</div>
      <div class="language-option" data-lang="es" data-text="ES">🇪🇸 Español</div>
      <div class="language-option" data-lang="fr" data-text="FR">🇫🇷 Français</div>
      <div class="language-option" data-lang="de" data-text="DE">🇩🇪 Deutsch</div>
    </div>
  `;
  
  // Assemble container
  buttonContainer.appendChild(languageMenu);
  buttonContainer.appendChild(floatingButton);
  document.body.appendChild(buttonContainer);
  
  // Add event listeners
  const translateSection = document.getElementById('translate-section');
  const languageSection = document.getElementById('language-section');
  
  translateSection.addEventListener('click', handleTranslateClick);
  translateSection.addEventListener('contextmenu', handleTranslateSectionRightClick);
  languageSection.addEventListener('click', toggleLanguageMenu);
  
  // Language option click events
  languageMenu.addEventListener('click', (e) => {
    const option = e.target.closest('.language-option');
    if (option) {
      selectLanguage(option.dataset.lang, option.dataset.text);
    }
  });
}

// Handle translate button click
async function handleTranslateClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  try {
    if (window.TransCraftTranslation && window.TransCraftTranslation.translatePage) {
      await window.TransCraftTranslation.translatePage();
    }
  } catch (error) {
    window.TransCraftDebug.debugLog('Translation error from button click:', error);
  }
}

// Handle right-click on translate section (toggle auto-translate)
async function handleTranslateSectionRightClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (window.TransCraftAutoTranslate && window.TransCraftAutoTranslate.toggleAutoTranslate) {
    await window.TransCraftAutoTranslate.toggleAutoTranslate();
  }
}

// Update floating button status
function updateFloatingButton(status) {
  if (!floatingButton) return;
  
  const translateIcon = floatingButton.querySelector('.translate-icon');
  const loadingIcon = floatingButton.querySelector('.loading-icon');
  const progressText = floatingButton.querySelector('.progress-text');
  const translateSection = floatingButton.querySelector('.button-left-section');
  
  // Reset all icons and states
  translateIcon.style.display = 'none';
  loadingIcon.style.display = 'none';
  loadingIcon.classList.remove('show');
  progressText.style.display = 'none';
  
  // Remove all state classes
  floatingButton.classList.remove('translating');
  translateSection.classList.remove('translating');
  
  switch(status) {
    case 'ready':
      translateIcon.style.display = 'block';
      floatingButton.classList.remove('translated');
      break;
    case 'translating':
      loadingIcon.style.display = 'block';
      progressText.style.display = 'block';
      progressText.textContent = '0%';
      floatingButton.classList.add('translating');
      translateSection.classList.add('translating');
      setTimeout(() => {
        loadingIcon.classList.add('show');
      }, 10);
      break;
    case 'translated':
      translateIcon.style.display = 'block';
      floatingButton.classList.add('translated');
      break;
  }
}

// Update floating button progress
function updateFloatingButtonProgress(percentage) {
  const progressText = floatingButton?.querySelector('.progress-text');
  const progressRingFill = floatingButton?.querySelector('.progress-ring-fill');
  
  if (progressText && progressRingFill) {
    progressText.textContent = `${Math.round(percentage)}%`;
    
    // Update progress ring
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100 * circumference);
    progressRingFill.style.strokeDashoffset = offset;
  }
}

// Toggle language menu
function toggleLanguageMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (isLanguageMenuOpen) {
    closeLanguageMenu();
  } else {
    openLanguageMenu();
  }
}

// Open language menu
function openLanguageMenu() {
  const menu = document.getElementById('ai-translation-language-menu');
  if (menu) {
    menu.style.display = 'block';
    setTimeout(() => {
      menu.classList.add('show');
    }, 10);
    isLanguageMenuOpen = true;
    
    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', closeLanguageMenuOnClickOutside);
    }, 100);
  }
}

// Close language menu
function closeLanguageMenu() {
  const menu = document.getElementById('ai-translation-language-menu');
  if (menu) {
    menu.classList.remove('show');
    setTimeout(() => {
      menu.style.display = 'none';
    }, 300);
    isLanguageMenuOpen = false;
    document.removeEventListener('click', closeLanguageMenuOnClickOutside);
  }
}

// Close menu on click outside
function closeLanguageMenuOnClickOutside(e) {
  const menu = document.getElementById('ai-translation-language-menu');
  const languageSection = document.getElementById('language-section');
  
  if (menu && !menu.contains(e.target) && !languageSection.contains(e.target)) {
    closeLanguageMenu();
  }
}

// Select language
async function selectLanguage(langCode, langText) {
  // Update state
  window.TransCraftState.targetLanguage = langCode;
  updateLanguageButtonText();
  closeLanguageMenu();
  
  // Save to storage
  await chrome.storage.sync.set({ targetLanguage: langCode });
  window.TransCraftDebug.debugLog('Language changed to:', langCode);
  
  // Show feedback
  window.TransCraftDebug.showFloatingMessage(`已切換到${langText}`);
  
  // Re-translate if already translated
  if (window.TransCraftState.isTranslated) {
    window.TransCraftTranslationAPI.restoreOriginalText();
    setTimeout(() => {
      if (window.TransCraftTranslation && window.TransCraftTranslation.translatePage) {
        window.TransCraftTranslation.translatePage();
      }
    }, 100);
  }
}

// Load target language setting
async function loadTargetLanguage() {
  const settings = await chrome.storage.sync.get(['targetLanguage']);
  if (settings.targetLanguage) {
    window.TransCraftState.targetLanguage = settings.targetLanguage;
  }
  
  window.TransCraftDebug.debugLog('Target language loaded:', window.TransCraftState.targetLanguage);
  
  // Update button display
  updateLanguageButtonText();
}

// Update language button text
function updateLanguageButtonText() {
  const languageMap = {
    'zh-TW': '中',
    'zh-CN': '简',
    'en': 'EN',
    'ja': '日',
    'ko': '한',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE'
  };
  
  const languageTextElement = document.getElementById('current-language');
  if (languageTextElement) {
    languageTextElement.textContent = languageMap[window.TransCraftState.targetLanguage] || '中';
  }
}

// Display detected language
function displayDetectedLanguage(detectedLang) {
  const detectedLangSection = document.getElementById('detected-language-section');
  const detectedLangText = document.getElementById('detected-language-text');
  
  if (!detectedLangSection || !detectedLangText) return;
  
  const langMap = {
    'en': 'EN',
    'zh': '中',
    'zh-CN': '简',
    'zh-TW': '繁',
    'ja': '日',
    'ko': '한',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE'
  };
  
  if (detectedLang) {
    const displayText = langMap[detectedLang] || detectedLang.toUpperCase();
    detectedLangText.textContent = displayText;
    detectedLangSection.style.display = 'flex';
    detectedLangSection.title = `檢測到: ${detectedLang}`;
  } else {
    detectedLangSection.style.display = 'none';
  }
}

// Update auto-translate button state
function updateAutoTranslateButton() {
  const translateSection = document.getElementById('translate-section');
  
  if (!translateSection) {
    window.TransCraftDebug.debugLog('translateSection not found, will retry later');
    return;
  }
  
  if (window.TransCraftState.autoTranslateEnabled) {
    translateSection.classList.add('auto-translate-enabled');
    translateSection.title = window.TransCraftDebug.getLocalizedMessage('auto_translate_enabled', '左鍵：翻譯頁面 | 右鍵：關閉自動翻譯');
    window.TransCraftDebug.debugLog('Auto-translate indicator enabled');
  } else {
    translateSection.classList.remove('auto-translate-enabled');
    translateSection.title = window.TransCraftDebug.getLocalizedMessage('click_to_translate', '左鍵：翻譯頁面 | 右鍵：開啟自動翻譯');
    window.TransCraftDebug.debugLog('Auto-translate indicator disabled');
  }
}

// Initialize floating button
function initializeFloatingButton() {
  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }
}

// Export functions to global scope
window.TransCraftFloatingButton = {
  createFloatingButton,
  handleTranslateClick,
  handleTranslateSectionRightClick,
  updateFloatingButton,
  updateFloatingButtonProgress,
  toggleLanguageMenu,
  openLanguageMenu,
  closeLanguageMenu,
  selectLanguage,
  loadTargetLanguage,
  updateLanguageButtonText,
  displayDetectedLanguage,
  updateAutoTranslateButton,
  initializeFloatingButton
};