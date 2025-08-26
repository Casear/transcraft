let isTranslated = false;
let translationElements = new Map();
let targetLanguage = 'zh-TW';
let expertMode = 'general';
let floatingButton = null;
let isTranslating = false;
let isLanguageMenuOpen = false;
let debugMode = false;
let autoTranslateEnabled = false;
let currentDomain = window.location.hostname;
let i18nReady = false;

// Initialize i18n
async function initContentI18n() {
  try {
    await window.i18n.initI18n();
    i18nReady = true;
    debugLog('i18n initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize i18n, using fallback text:', error);
    i18nReady = false;
  }
}

// Get localized message with fallback
function getLocalizedMessage(key, fallback = '') {
  if (i18nReady && window.i18n) {
    return window.i18n.getMessage(key);
  }
  return fallback;
}

// Language detection functions
function detectLanguageByCharacteristics(text) {
  // Clean text for better detection
  const cleanText = text.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  if (cleanText.length < 10) return null; // Too short to detect reliably
  
  // Character-based detection
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const japaneseHiraganaKatakana = /[\u3040-\u309f\u30a0-\u30ff]/g;
  const koreanRegex = /[\uac00-\ud7af]/g;
  const arabicRegex = /[\u0600-\u06ff]/g;
  const thaiRegex = /[\u0e00-\u0e7f]/g;
  const russianRegex = /[\u0400-\u04ff]/g;
  
  const chineseCount = (text.match(chineseRegex) || []).length;
  const japaneseCount = (text.match(japaneseHiraganaKatakana) || []).length;
  const koreanCount = (text.match(koreanRegex) || []).length;
  const arabicCount = (text.match(arabicRegex) || []).length;
  const thaiCount = (text.match(thaiRegex) || []).length;
  const russianCount = (text.match(russianRegex) || []).length;
  
  const totalChars = cleanText.length;
  
  // If significant portion is Chinese characters
  if (chineseCount / totalChars > 0.3) {
    // Try to distinguish between zh-CN and zh-TW
    const traditionalIndicators = /[繁體複雜學習開關]/g;
    const simplifiedIndicators = /[简体复杂学习开关]/g;
    
    const traditionalCount = (text.match(traditionalIndicators) || []).length;
    const simplifiedCount = (text.match(simplifiedIndicators) || []).length;
    
    if (simplifiedCount > traditionalCount) {
      return 'zh-CN';
    } else {
      return 'zh-TW'; // Default to Traditional Chinese
    }
  }
  
  // Japanese has unique hiragana/katakana
  if (japaneseCount / totalChars > 0.1) {
    return 'ja';
  }
  
  if (koreanCount / totalChars > 0.3) return 'ko';
  if (arabicCount / totalChars > 0.3) return 'ar';
  if (thaiCount / totalChars > 0.3) return 'th';
  if (russianCount / totalChars > 0.3) return 'ru';
  
  // For European languages, use simple word patterns
  const lowerText = cleanText.toLowerCase();
  
  // Spanish indicators
  if (/\b(el|la|los|las|un|una|es|son|está|están|que|con|por|para|desde|hasta)\b/.test(lowerText)) {
    return 'es';
  }
  
  // French indicators  
  if (/\b(le|la|les|un|une|du|de|des|je|tu|il|elle|nous|vous|ils|elles|est|sont|avec|pour|dans)\b/.test(lowerText)) {
    return 'fr';
  }
  
  // German indicators
  if (/\b(der|die|das|ein|eine|ich|du|er|sie|es|wir|ihr|sie|ist|sind|und|oder|aber|mit|für|in|auf|zu)\b/.test(lowerText)) {
    return 'de';
  }
  
  // Default to English for Latin script
  return 'en';
}

async function detectLanguageWithBrowser(text) {
  // Try browser's built-in language detection if available
  if ('detectLanguage' in chrome.i18n) {
    try {
      const detectedLang = await chrome.i18n.detectLanguage(text);
      if (detectedLang && detectedLang.languages && detectedLang.languages.length > 0) {
        const mostLikely = detectedLang.languages[0];
        if (mostLikely.percentage > 70) { // Only trust high confidence results
          return mostLikely.language;
        }
      }
    } catch (error) {
      debugLog('Browser language detection failed:', error);
    }
  }
  return null;
}

async function detectLanguage(text) {
  // First try browser detection
  const browserDetection = await detectLanguageWithBrowser(text);
  if (browserDetection) {
    debugLog('Browser detected language:', browserDetection);
    return browserDetection;
  }
  
  // Fallback to character-based detection
  const characterDetection = detectLanguageByCharacteristics(text);
  debugLog('Character-based detection:', characterDetection);
  return characterDetection;
}

function shouldTranslate(sourceLanguage, targetLanguage) {
  if (!sourceLanguage || !targetLanguage) return true; // Proceed if uncertain
  
  // Normalize language codes
  const normalizeLanguage = (lang) => {
    if (lang.startsWith('zh')) {
      return lang; // Keep Chinese variants separate
    }
    return lang.split('-')[0]; // Remove region codes for other languages
  };
  
  const normalizedSource = normalizeLanguage(sourceLanguage);
  const normalizedTarget = normalizeLanguage(targetLanguage);
  
  return normalizedSource !== normalizedTarget;
}

// Debug logging utility
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

// Initialize settings from storage (async)
let settingsLoaded = false;

async function loadAutoTranslateSettings() {
  try {
    await initContentI18n();
    
    const result = await chrome.storage.sync.get(['debugMode', 'autoTranslateDomains']);
    debugMode = result.debugMode || false;
    if (debugMode) {
      console.log('[TransCraft Debug] Debug mode is ENABLED');
    }
    
    // Check if auto-translate is enabled for current domain
    const autoTranslateDomains = result.autoTranslateDomains || {};
    autoTranslateEnabled = autoTranslateDomains[currentDomain] || false;
    settingsLoaded = true;
    
    debugLog('Auto-translate settings loaded for', currentDomain, ':', autoTranslateEnabled);
    
    // Update UI when settings are loaded - retry multiple times to ensure button exists
    let retryCount = 0;
    const maxRetries = 10;
    const updateButtonWithRetry = () => {
      const translateSection = document.getElementById('translate-section');
      if (translateSection) {
        updateAutoTranslateButton();
        debugLog('Auto-translate button updated successfully');
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(updateButtonWithRetry, 200);
        debugLog(`Retrying auto-translate button update (${retryCount}/${maxRetries})`);
      } else {
        debugLog('Failed to find translate-section after all retries');
      }
    };
    updateButtonWithRetry();
    
    // Initial auto-translate check after settings are loaded (only if enabled)
    if (autoTranslateEnabled) {
      debugLog('Settings loaded and auto-translate enabled, performing initial check');
      checkAndAutoTranslate();
    }
    
  } catch (error) {
    debugLog('Failed to load auto-translate settings:', error);
    settingsLoaded = true; // Mark as loaded to prevent infinite waiting
  }
}

// Load settings immediately
loadAutoTranslateSettings();

// Listen for debug mode changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.debugMode) {
    debugMode = changes.debugMode.newValue;
    if (debugMode) {
      console.log('[TransCraft Debug] Debug mode has been ENABLED');
    } else {
      console.log('[TransCraft Debug] Debug mode has been DISABLED');
    }
  }
});

// Save auto-translate state for current domain
async function saveAutoTranslateState(enabled) {
  const result = await chrome.storage.sync.get(['autoTranslateDomains']);
  const autoTranslateDomains = result.autoTranslateDomains || {};
  
  if (enabled) {
    autoTranslateDomains[currentDomain] = true;
  } else {
    delete autoTranslateDomains[currentDomain];
  }
  
  await chrome.storage.sync.set({ autoTranslateDomains });
  debugLog('Auto-translate state saved for', currentDomain, ':', enabled);
}

// Toggle auto-translate for current domain
async function toggleAutoTranslate() {
  autoTranslateEnabled = !autoTranslateEnabled;
  await saveAutoTranslateState(autoTranslateEnabled);
  
  debugLog('Auto-translate toggled for', currentDomain, ':', autoTranslateEnabled);
  
  // Update button state with retry mechanism
  let retryCount = 0;
  const maxRetries = 5;
  const updateButtonWithRetry = () => {
    const translateSection = document.getElementById('translate-section');
    if (translateSection) {
      updateAutoTranslateButton();
      debugLog('Auto-translate button updated after toggle');
    } else if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(updateButtonWithRetry, 100);
    }
  };
  updateButtonWithRetry();
  
  // Show status message
  const status = autoTranslateEnabled ? '已開啟' : '已關閉';
  showFloatingMessage(`${getLocalizedMessage('auto_translate', '自動翻譯')}${status}`);
}

// 顯示浮動消息
function showFloatingMessage(message, duration = 2000) {
  // 創建消息元素
  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    pointer-events: none;
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 300px;
    word-wrap: break-word;
  `;
  messageEl.textContent = message;
  
  // 添加到頁面
  document.body.appendChild(messageEl);
  
  // 觸發動畫
  setTimeout(() => {
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateY(0)';
  }, 10);
  
  // 自動移除
  setTimeout(() => {
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, duration);
}

function getTranslatableElements() {
  // 取得所有包含文字的區塊級元素
  const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'CAPTION'];
  const elements = [];
  
  blockTags.forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    for (let elem of elems) {
      // 檢查元素是否有實質文字內容且尚未翻譯
      const text = elem.innerText?.trim();
      if (text && text.length > 3 && 
          !elem.querySelector('.ai-translation-block') && 
          !elem.closest('.ai-translation-block') &&
          !elem.classList.contains('ai-translation-block')) {
        
        // 排除導航、廣告、腳本等常見元素
        const classList = elem.className.toLowerCase();
        const elementId = elem.id.toLowerCase();
        
        // 更嚴格的過濾條件
        if (!classList.includes('nav') && !classList.includes('menu') && 
            !classList.includes('ad') && !classList.includes('banner') &&
            !classList.includes('script') && !classList.includes('style') &&
            !classList.includes('hidden') && !classList.includes('invisible') &&
            !elementId.includes('nav') && !elementId.includes('menu') &&
            !elementId.includes('ad') && !elementId.includes('banner') &&
            !elementId.includes('script') && !elementId.includes('style')) {
          
          // 檢查是否為腳本或樣式標籤內容
          const parentScript = elem.closest('script, style, noscript');
          if (!parentScript) {
            // 排除翻譯擴展的UI元素
            const isTranslationUI = elem.closest('#ai-translation-floating-container') ||
                                   elem.closest('#ai-translation-language-menu') ||
                                   elem.closest('#ai-translation-error-modal');
            if (!isTranslationUI) {
              elements.push(elem);
            }
          }
        }
      }
    }
  });
  
  // 處理只有文字節點的 DIV 和 SPAN (改進邏輯)
  ['DIV', 'SPAN', 'SECTION', 'ARTICLE'].forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    for (let elem of elems) {
      // 檢查元素內容
      const text = elem.innerText?.trim();
      const hasSignificantText = text && text.length > 15; // 增加最小長度要求
      
      if (!hasSignificantText) continue;
      
      // 更嚴格的翻譯檢查
      if (elem.querySelector('.ai-translation-block') || 
          elem.closest('.ai-translation-block') ||
          elem.classList.contains('ai-translation-block')) continue;
      
      // 排除導航、廣告、腳本等
      const classList = elem.className.toLowerCase();
      const elementId = elem.id.toLowerCase();
      
      if (classList.includes('nav') || classList.includes('menu') || 
          classList.includes('ad') || classList.includes('banner') ||
          classList.includes('footer') || classList.includes('header') ||
          classList.includes('script') || classList.includes('style') ||
          classList.includes('modal') || classList.includes('popup') ||
          classList.includes('toast') || classList.includes('dropdown') ||
          elementId.includes('nav') || elementId.includes('menu') ||
          elementId.includes('ad') || elementId.includes('banner') ||
          elementId.includes('script') || elementId.includes('style') ||
          elementId.includes('modal') || elementId.includes('popup')) {
        continue;
      }
      
      // 檢查是否在腳本或樣式標籤內
      const parentScript = elem.closest('script, style, noscript');
      if (parentScript) continue;
      
      // 排除翻譯擴展的UI元素
      const isTranslationUI = elem.closest('#ai-translation-floating-container') ||
                             elem.closest('#ai-translation-language-menu') ||
                             elem.closest('#ai-translation-error-modal');
      if (isTranslationUI) continue;
      
      // 檢查是否包含其他區塊級子元素
      const hasBlockChildren = elem.querySelector('p, h1, h2, h3, h4, h5, h6, div[class], section, article, ul, ol, table');
      
      // 如果沒有區塊級子元素，或者子元素很少，則處理此元素
      if (!hasBlockChildren || elem.children.length <= 2) {
        // 額外檢查：避免選擇已經被其他元素覆蓋的文本
        let shouldAdd = true;
        for (const existingElem of elements) {
          if (existingElem.contains(elem) || elem.contains(existingElem)) {
            shouldAdd = false;
            break;
          }
        }
        
        if (shouldAdd) {
          elements.push(elem);
        }
      }
      
      // 特殊處理：如果是小說網站的內容區域，但避免重複處理
      if ((window.location.hostname.includes('syosetu.com') || 
          window.location.hostname.includes('novel') ||
          classList.includes('novel') || classList.includes('content') ||
          elementId.includes('novel') || elementId.includes('content')) &&
          !hasBlockChildren && elem.children.length <= 3) {
        
        // 對於小說網站，更謹慎地收集文本元素
        const textNodes = [];
        const walker = document.createTreeWalker(
          elem,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              const text = node.textContent.trim();
              // 檢查父元素是否已被處理或包含翻譯
              const parent = node.parentElement;
              if (parent && (parent.querySelector('.ai-translation-block') || 
                           parent.closest('.ai-translation-block') ||
                           parent.classList.contains('ai-translation-block'))) {
                return NodeFilter.FILTER_REJECT;
              }
              return text.length > 10 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          }
        );
        
        let textNode;
        while (textNode = walker.nextNode()) {
          const parentElem = textNode.parentElement;
          if (parentElem && 
              !parentElem.querySelector('.ai-translation-block') && 
              !parentElem.closest('.ai-translation-block') &&
              !parentElem.classList.contains('ai-translation-block')) {
            
            // 避免重複添加
            let alreadyExists = false;
            for (const existing of [...elements, ...textNodes]) {
              if (existing === parentElem || 
                  existing.contains(parentElem) || 
                  parentElem.contains(existing)) {
                alreadyExists = true;
                break;
              }
            }
            
            if (!alreadyExists) {
              textNodes.push(parentElem);
            }
          }
        }
        
        // 添加找到的文本節點父元素
        textNodes.forEach(node => {
          elements.push(node);
        });
      }
    }
  });
  
  // 高級去重：移除嵌套和重疊的元素
  const filteredElements = [];
  
  for (const elem of elements) {
    let shouldInclude = true;
    
    // 檢查是否與已存在的元素重疊
    for (const existing of filteredElements) {
      // 如果當前元素包含在已存在元素中，跳過
      if (existing.contains(elem)) {
        shouldInclude = false;
        break;
      }
      // 如果當前元素包含已存在元素，移除已存在元素
      if (elem.contains(existing)) {
        const index = filteredElements.indexOf(existing);
        if (index > -1) {
          filteredElements.splice(index, 1);
        }
      }
    }
    
    if (shouldInclude) {
      filteredElements.push(elem);
    }
  }
  
  // 最終去重並按 DOM 順序排列
  const uniqueElements = [...new Set(filteredElements)];
  uniqueElements.sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  
  debugLog(`Found ${uniqueElements.length} translatable elements (filtered from ${elements.length})`);
  return uniqueElements;
}

async function translateText(text, apiConfig, timeoutMs = 60000) {
  try {
    // 確保擴充功能上下文仍然有效
    if (!chrome.runtime?.id) {
      throw new Error('EXTENSION_CONTEXT_INVALID');
    }
    
    // Debug log request
    debugLog('Translation Request:', {
      textLength: text.length,
      textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      targetLanguage: targetLanguage,
      apiConfig: {
        selectedApi: apiConfig.selectedApi,
        selectedModel: apiConfig.selectedModel
      },
      expertMode: expertMode,
      timeout: timeoutMs
    });
    
    const startTime = Date.now();
    
    const response = await new Promise((resolve, reject) => {
      let isResolved = false;
      
      // 設定超時機制（使用傳入的 timeout 值）
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          const timeoutError = new Error(`TIMEOUT_ERROR: Translation request timed out after ${timeoutMs/1000} seconds`);
          debugError('Translation timeout:', timeoutError);
          reject(timeoutError);
        }
      }, timeoutMs);
      
      try {
        chrome.runtime.sendMessage({
          action: 'translate',
          text: text,
          targetLanguage: targetLanguage,
          apiConfig: apiConfig,
          expertMode: expertMode
        }, (response) => {
          clearTimeout(timeoutId);
          
          if (isResolved) return; // 避免重複處理
          isResolved = true;
          
          // 檢查Chrome runtime錯誤
          if (chrome.runtime.lastError) {
            const errorMessage = chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError) || 'EXTENSION_CONTEXT_INVALID';
            debugError('Chrome runtime error:', errorMessage);
            reject(new Error(errorMessage));
            return;
          }
          
          // 檢查響應是否有效
          if (!response) {
            const networkError = new Error('NETWORK_ERROR: No response received');
            debugError('Network error:', networkError);
            reject(networkError);
            return;
          }
          
          resolve(response);
        });
      } catch (error) {
        clearTimeout(timeoutId);
        if (!isResolved) {
          isResolved = true;
          debugError('Error sending message:', error);
          reject(error);
        }
      }
    });
    
    const elapsedTime = Date.now() - startTime;
    
    if (response.error) {
      debugError('Translation API Error:', response.error);
      // 直接拋出原始錯誤訊息，保留詳細信息
      throw new Error(response.error);
    }
    
    // Debug log response
    debugLog('Translation Response:', {
      elapsedTime: `${elapsedTime}ms`,
      translationLength: response.translation?.length || 0,
      translationPreview: response.translation?.substring(0, 100) + 
        (response.translation?.length > 100 ? '...' : '')
    });
    
    return response.translation || null;
  } catch (error) {
    debugError('Translation failed:', error.message);
    // 重新拋出錯誤，讓上層處理
    throw error;
  }
}

async function translatePage() {
  if (isTranslating) return;
  
  // 確保語言菜單已關閉
  if (isLanguageMenuOpen) {
    debugLog('Closing language menu before translation');
    closeLanguageMenu();
  }
  
  if (isTranslated) {
    restoreOriginalText();
    updateFloatingButton('ready');
    return;
  }

  const elements = getTranslatableElements();
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel', 'enableLanguageDetection']);
  
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    alert('請先在擴充功能設定中配置 API Key');
    return;
  }

  // Language detection before translation
  let skipCount = 0;
  if (apiConfig.enableLanguageDetection !== false) { // Enabled by default
    debugLog('Language detection enabled, checking content...');
    
    // Sample some text from the page for language detection
    const sampleTexts = elements.slice(0, 5).map(el => el.textContent).filter(text => text.trim().length > 20);
    if (sampleTexts.length > 0) {
      const sampleText = sampleTexts.join(' ').substring(0, 1000);
      const detectedLanguage = await detectLanguage(sampleText);
      
      debugLog('Detected language:', detectedLanguage, 'Target language:', targetLanguage);
      
      if (detectedLanguage && !shouldTranslate(detectedLanguage, targetLanguage)) {
        const langNames = {
          'en': 'English',
          'zh-TW': '繁體中文',
          'zh-CN': '簡體中文',
          'ja': '日本語',
          'ko': '한국어',
          'es': 'Español',
          'fr': 'Français',
          'de': 'Deutsch'
        };
        
        const sourceLangName = langNames[detectedLanguage] || detectedLanguage;
        const targetLangName = langNames[targetLanguage] || targetLanguage;
        
        showErrorModal(
          getLocalizedMessage('translation_skipped', '翻譯已跳過'),
          `${getLocalizedMessage('content_already_in_target_language', '內容已經是目標語言')}: ${targetLangName}<br>${getLocalizedMessage('detected_language', '檢測到的語言')}: ${sourceLangName}`,
          3000
        );
        return;
      }
    }
  }

  isTranslating = true;
  updateFloatingButton('translating');

  // 獲取批次設定
  const batchSettings = await chrome.storage.sync.get(['maxBatchLength', 'maxBatchElements', 'requestTimeout']);
  const maxBatchLength = batchSettings.maxBatchLength || 8000; // 預設最大8000字元
  const maxBatchElements = batchSettings.maxBatchElements || 20; // 預設最大20個元素
  const requestTimeout = (batchSettings.requestTimeout || 60) * 1000; // 轉換為毫秒，預設60秒
  
  // 先為所有元素添加載入佔位符
  const elementIdMap = new Map(); // 儲存元素和其ID的對應關係
  elements.forEach(element => {
    const elementId = addLoadingPlaceholder(element);
    if (elementId) {
      elementIdMap.set(element, elementId);
    }
  });
  
  debugLog(`Added ${elementIdMap.size} loading placeholders`);
  
  let successCount = 0;
  let processedElements = 0;
  let errors = []; // 收集所有錯誤，最後統一顯示
  
  // 動態批次處理
  while (processedElements < elements.length) {
    const batch = [];
    const texts = [];
    const validElements = [];
    let currentBatchLength = 0;
    let batchProcessedCount = 0; // 追蹤本批次處理的元素數量
    
    // 動態決定批次大小
    for (let i = processedElements; i < elements.length && batch.length < maxBatchElements; i++) {
      const element = elements[i];
      
      // 獲取文本時排除翻譯區塊的內容
      let text = '';
      const tempElement = element.cloneNode(true);
      // 移除所有翻譯區塊
      const translationBlocks = tempElement.querySelectorAll('.ai-translation-block');
      translationBlocks.forEach(block => block.remove());
      text = tempElement.innerText.trim();
      
      batchProcessedCount++; // 記錄檢查過的元素數量
      
      if (text) {
        // 計算加入這個元素後的總長度（包括分隔符）
        const separatorLength = texts.length > 0 ? '\n\n<<TRANSLATE_SEPARATOR>>\n\n'.length : 0;
        const newLength = currentBatchLength + separatorLength + text.length;
        
        // 如果加入這個元素會超過長度限制，且已經有其他元素，則結束此批次
        if (newLength > maxBatchLength && texts.length > 0) {
          batchProcessedCount--; // 這個元素沒有被加入批次，不算處理
          break;
        }
        
        // 如果單個元素就超過限制，仍然處理它（避免無限循環）
        texts.push(text);
        validElements.push(element);
        batch.push(element);
        currentBatchLength = newLength;
      }
      
      // 如果單個元素就達到長度限制，立即處理
      if (currentBatchLength >= maxBatchLength) {
        break;
      }
    }
    
    if (texts.length > 0) {
      // 將文字組合，用特殊分隔符分開
      const combinedText = texts.join('\n\n<<TRANSLATE_SEPARATOR>>\n\n');
      
      try {
        const translatedText = await translateText(combinedText, apiConfig, requestTimeout);
        
        if (translatedText) {
          // 調試：記錄原始翻譯文本
          debugLog('原始翻譯文本:', translatedText);
          debugLog('查找分隔符:', translatedText.includes('<<TRANSLATE_SEPARATOR>>'))
          
          // 使用多種分隔符模式進行匹配
          let translations;
          
          if (translatedText.includes('<<TRANSLATE_SEPARATOR>>')) {
            // 嘗試不同的分隔符模式
            translations = translatedText.split(/\n*<<TRANSLATE_SEPARATOR>>\n*/);
          } else if (translatedText.includes('TRANSLATE_SEPARATOR')) {
            // 處理可能缺少 << >> 的情況
            translations = translatedText.split(/\n*TRANSLATE_SEPARATOR\n*/);
          } else {
            // 如果沒有找到分隔符，嘗試其他分隔方式
            // 檢查是否有多個段落或其他模式
            const paragraphs = translatedText.split(/\n\n+/);
            translations = paragraphs.length === validElements.length ? paragraphs : [translatedText];
          }
          
          // 過濾空的翻譯段落
          translations = translations.filter(t => t && t.trim());
          
          // 調試：記錄處理後的翻譯數量
          debugLog(`批次處理: 原始元素 ${validElements.length} 個, 翻譯結果 ${translations.length} 個`);
          debugLog('翻譯段落:', translations)
          
          // 更新載入佔位符為實際翻譯
          const maxIndex = Math.min(validElements.length, translations.length);
          for (let index = 0; index < maxIndex; index++) {
            const element = validElements[index];
            const translation = translations[index];
            const elementId = elementIdMap.get(element);
            
            if (translation && translation.trim() && elementId) {
              const cleanedTranslation = translation.trim();
              if (updatePlaceholderWithTranslation(elementId, cleanedTranslation)) {
                successCount++;
              } else {
                // 如果更新失敗，移除佔位符
                removeLoadingPlaceholder(elementId);
                debugWarn(`Failed to update translation for element ${index}`);
              }
            } else {
              if (elementId) {
                removeLoadingPlaceholder(elementId);
              }
              debugWarn(`元素 ${index} 的翻譯為空`);
            }
          }
          
          // 處理翻譯數量不匹配的情況
          if (translations.length < validElements.length) {
            debugWarn(`翻譯數量不足: 需要 ${validElements.length} 個，得到 ${translations.length} 個`);
            // 移除未獲得翻譯的元素的佔位符
            for (let index = translations.length; index < validElements.length; index++) {
              const element = validElements[index];
              const elementId = elementIdMap.get(element);
              if (elementId) {
                removeLoadingPlaceholder(elementId);
              }
            }
          } else if (translations.length > validElements.length) {
            debugWarn(`翻譯數量過多: 需要 ${validElements.length} 個，得到 ${translations.length} 個`);
          }
        }
      } catch (error) {
        // 根據錯誤類型決定日誌級別
        const errorMsg = error.message;
        if (errorMsg.includes('暫時被上游限制') || errorMsg.includes('請求頻率過高') || 
            errorMsg.includes('rate-limited') || errorMsg.includes('temporarily') ||
            errorMsg.includes('暫時被限制') || errorMsg.includes('限制使用') ||
            errorMsg.includes('API Key 無效') || errorMsg.includes('已過期') ||
            errorMsg.includes('餘額不足') || errorMsg.includes('權限不足') ||
            errorMsg.includes('服務暫時不可用') || errorMsg.includes('配額') ||
            errorMsg.includes('quota') || errorMsg.includes('exceeded') ||
            errorMsg.includes('TIMEOUT_ERROR') || errorMsg.includes('timed out') ||
            errorMsg.includes('token 限制') || errorMsg.includes('安全原因')) {
          console.warn('Batch translation known issue:', errorMsg);
        } else {
          console.error('Batch translation unexpected error:', error);
        }
        
        // 只在嚴重錯誤時停止處理
        if (errorMsg === 'EXTENSION_CONTEXT_INVALID' || 
            errorMsg === 'API_KEY_ERROR' || 
            errorMsg.includes('No endpoints found matching your data policy')) {
          
          // 移除所有載入佔位符
          for (const [element, elementId] of elementIdMap.entries()) {
            removeLoadingPlaceholder(elementId);
          }
          
          isTranslating = false;
          
          if (errorMsg.includes('No endpoints found matching your data policy')) {
            showErrorModal('OpenRouter 數據政策限制', '請到 OpenRouter 隱私設定頁面啟用「Allow training on prompts」選項。<br><a href="https://openrouter.ai/settings/privacy" target="_blank">點此前往設定</a>');
          } else if (errorMsg.includes('No endpoints found')) {
            showErrorModal('OpenRouter 模型不可用', '請檢查您的隱私設定或選擇其他模型。<br><a href="https://openrouter.ai/settings/privacy" target="_blank">隱私設定</a>');
          } else if (errorMsg === 'API_KEY_ERROR') {
            showErrorModal('API Key 錯誤', '請檢查您的 API Key 設定是否正確。');
          } else if (errorMsg === 'EXTENSION_CONTEXT_INVALID') {
            showErrorModal('擴充功能已更新', '請重新整理頁面後再試。');
          }
          
          updateFloatingButton('ready');
          return;
        }
        
        // 立即顯示第一個錯誤並停止翻譯
        console.warn('Translation error for this batch:', errorMsg);
        
        let errorTitle, errorDetail, errorSolution;
        
        if (errorMsg === 'QUOTA_EXCEEDED') {
          errorTitle = 'API 使用配額已達上限';
          errorDetail = '您的 API 使用額度已用完，無法繼續翻譯。<br>請到 API 提供商網站檢查使用情況或升級方案。';
          errorSolution = '前往 API 設定頁面檢查配額狀況';
        } else if (errorMsg === 'NETWORK_ERROR') {
          errorTitle = '網路連線問題';
          errorDetail = '無法連接到翻譯服務，請檢查您的網路連線是否正常。';
          errorSolution = '請檢查網路連線後重試';
        } else if (errorMsg.includes('暫時被上游限制') || errorMsg.includes('請求頻率過高') || 
                   errorMsg.includes('rate-limited') || errorMsg.includes('temporarily') ||
                   errorMsg.includes('暫時被限制') || errorMsg.includes('限制使用')) {
          // 提取模型名稱
          const modelMatch = errorMsg.match(/(\S+\/[^暫\s]+)/);
          const modelName = modelMatch ? modelMatch[1] : '當前模型';
          
          errorTitle = `${modelName} 使用頻率受限`;
          errorDetail = '該免費模型暫時被上游服務商限制，無法處理更多請求。';
          errorSolution = '請等待 1-5 分鐘後重試，或切換到其他模型';
        } else if (errorMsg.includes('API Key 無效') || errorMsg.includes('已過期')) {
          errorTitle = 'API 金鑰認證失敗';
          errorDetail = '您的 API 金鑰無效或已過期，無法通過身份驗證。';
          errorSolution = '請到擴展設定中檢查並更新 API 金鑰';
        } else if (errorMsg.includes('餘額不足') || errorMsg.includes('權限不足')) {
          errorTitle = '帳戶餘額或權限不足';
          errorDetail = '您的 API 帳戶餘額不足或沒有使用該服務的權限。';
          errorSolution = '請前往 API 提供商網站充值或檢查權限設定';
        } else if (errorMsg.includes('服務暫時不可用')) {
          errorTitle = 'AI 翻譯服務暫時中斷';
          errorDetail = 'API 服務商的伺服器暫時無法提供服務，這通常是臨時性問題。';
          errorSolution = '請等待幾分鐘後重試，或切換到其他 AI 服務';
        } else if (errorMsg.includes('token 限制')) {
          errorTitle = '翻譯內容超過長度限制';
          errorDetail = '當前批次的內容太長，超過了 AI 模型的處理能力上限。';
          errorSolution = '請到設定中減少「批次最大字元數」或「批次最大元素數」，建議設為 4000 字元或 10 個元素';
        } else if (errorMsg.includes('安全原因')) {
          errorTitle = '內容被安全系統阻擋';
          errorDetail = 'AI 服務的安全系統認為此內容可能包含不適當的內容。';
          errorSolution = '請檢查頁面內容，或嘗試使用其他翻譯服務';
        } else if (errorMsg.includes('TIMEOUT_ERROR') || errorMsg.includes('timed out')) {
          // 從錯誤訊息中提取 timeout 時間，如果無法提取則使用預設值
          const timeoutMatch = errorMsg.match(/after (\d+) seconds/);
          const timeoutSeconds = timeoutMatch ? timeoutMatch[1] : Math.floor(requestTimeout / 1000);
          
          errorTitle = '翻譯請求超時';
          errorDetail = `翻譯請求在 ${timeoutSeconds} 秒內沒有收到回應，可能是網路連線不穩定或 API 服務回應緩慢。`;
          errorSolution = '請檢查網路連線狀況，稍後重試或切換到其他 AI 服務';
        } else if (errorMsg.includes('API error') || errorMsg.includes('API_ERROR')) {
          const shortMsg = errorMsg.split('\n')[0]; // 只取第一行（友好消息）
          errorTitle = 'API 通訊發生錯誤';
          errorDetail = shortMsg;
          errorSolution = '請稍後重試，若問題持續請切換其他 AI 服務';
        } else {
          // 對於未知錯誤，嘗試提取可理解的部分
          let displayMessage = '翻譯過程出現問題';
          let extractedInfo = '';
          
          // 嘗試提取模型名稱
          const modelMatch = errorMsg.match(/(\S+\/\S+):?\s*(.*?)$/);
          if (modelMatch) {
            const modelName = modelMatch[1];
            const errorInfo = modelMatch[2] || errorMsg;
            extractedInfo = `模型 ${modelName} 暫時無法使用`;
            if (errorInfo.includes('rate-limited') || errorInfo.includes('限制')) {
              extractedInfo = `模型 ${modelName} 暫時被限制使用`;
            } else if (errorInfo.includes('unavailable') || errorInfo.includes('不可用')) {
              extractedInfo = `模型 ${modelName} 暫時不可用`;
            }
          }
          
          // 檢查是否包含常見錯誤關鍵詞
          if (errorMsg.includes('timeout') || errorMsg.includes('超時')) {
            extractedInfo = '請求超時，請稍後重試';
          } else if (errorMsg.includes('connection') || errorMsg.includes('連線')) {
            extractedInfo = '連線問題，請檢查網路';
          } else if (errorMsg.includes('invalid') && errorMsg.includes('key')) {
            extractedInfo = 'API 金鑰可能有問題';
          } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
            extractedInfo = 'API 使用額度可能已達上限';
          } else if (errorMsg.includes('token 限制')) {
            extractedInfo = '翻譯內容過長，超出模型處理限制';
          } else if (errorMsg.includes('安全原因')) {
            extractedInfo = '內容被 AI 安全系統阻擋';
          }
          
          errorTitle = displayMessage;
          errorDetail = extractedInfo || errorMsg.substring(0, 100);
          errorSolution = '請重新嘗試，若問題持續請聯繫技術支援';
        }
        
        // 移除當前批次的載入佔位符
        for (const element of validElements) {
          const elementId = elementIdMap.get(element);
          if (elementId) {
            removeLoadingPlaceholder(elementId);
          }
        }
        
        // 移除所有剩餘的載入佔位符
        for (let i = processedElements + batchProcessedCount; i < elements.length; i++) {
          const element = elements[i];
          const elementId = elementIdMap.get(element);
          if (elementId) {
            removeLoadingPlaceholder(elementId);
          }
        }
        
        // 立即顯示錯誤並停止翻譯
        isTranslating = false;
        updateFloatingButton('ready');
        
        const errorMessage = `<strong>${errorTitle}</strong><br><br>${errorDetail}<br><br><em>建議解決方案：</em><br>${errorSolution}`;
        showErrorModal('翻譯中斷', errorMessage, 10000);
        return;
      }
    } else if (batchProcessedCount > 0) {
      // 如果沒有有效文本但檢查了一些元素，仍然需要推進進度以避免無限循環
      debugLog(`跳過 ${batchProcessedCount} 個空白或無效元素`)
    } else {
      // 如果沒有處理任何元素，可能是邏輯錯誤，強制跳出避免無限循環
      console.warn('批次處理中沒有檢查任何元素，強制退出避免無限循環');
      break;
    }
    
    // 更新 processedElements，確保正確追蹤已處理的元素數量
    processedElements += batchProcessedCount;
    
    // 更新進度
    const progress = Math.min(100, (processedElements / elements.length) * 100);
    updateLoadingProgress(progress);
  }

  isTranslated = true;
  isTranslating = false;
  // 確保進度達到100%
  updateLoadingProgress(100);
  // 短暫延遲後切換到完成狀態
  setTimeout(() => {
    updateFloatingButton('translated');
  }, 500);
  
  // 顯示翻譯統計
  debugLog(`翻譯完成: 成功翻譯 ${successCount} / ${elements.length} 個元素`)
  
  // 統一顯示錯誤摘要
  if (errors.length > 0) {
    showTranslationErrorSummary(errors, successCount, elements.length);
  } else if (successCount < elements.length) {
    // 如果沒有收集到具體錯誤但有失敗，顯示一般提示
    const failedCount = elements.length - successCount;
    showErrorModal(
      getLocalizedMessage('translation_failed', '部分內容未翻譯'), 
      getLocalizedMessage('translation_partial_error', `成功翻譯 ${successCount} 個元素，${failedCount} 個元素翻譯失敗。<br>可能是因為網路問題或 API 限制。`).replace('$1', successCount).replace('$2', failedCount), 
      4000);
  }
}

// 添加載入中的佔位符
function addLoadingPlaceholder(element) {
  // 檢查是否已經有翻譯區塊
  if (element.querySelector(':scope > .ai-translation-block')) {
    return null;
  }
  
  // 創建載入中的區塊
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'ai-translation-block loading';
  loadingDiv.innerHTML = '<span class="ai-translation-loading-text">翻譯中 <span class="loading-spinner"></span></span>';
  
  // 添加唯一識別符
  const elementId = `translation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  loadingDiv.setAttribute('data-element-id', elementId);
  element.setAttribute('data-translation-id', elementId);
  
  // 根據元素類型調整樣式
  const tagName = element.tagName;
  if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
    loadingDiv.classList.add('ai-translation-heading');
  } else if (tagName === 'LI') {
    loadingDiv.classList.add('ai-translation-list-item');
  } else if (['TD', 'TH'].includes(tagName)) {
    loadingDiv.classList.add('ai-translation-table-cell');
  }
  
  // 確保翻譯顯示在原文下方
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === 'inline') {
    element.style.display = 'inline-block';
  }
  
  try {
    element.appendChild(loadingDiv);
    translationElements.set(loadingDiv, element);
    return elementId;
  } catch (error) {
    debugError('Failed to add loading placeholder:', error);
    return null;
  }
}

// 更新載入佔位符為實際翻譯
function updatePlaceholderWithTranslation(elementId, translationText) {
  const element = document.querySelector(`[data-translation-id="${elementId}"]`);
  const loadingDiv = document.querySelector(`.ai-translation-block[data-element-id="${elementId}"]`);
  
  if (!element || !loadingDiv) {
    debugWarn('Cannot find element or loading div for ID:', elementId);
    return false;
  }
  
  // 移除 loading 類別
  loadingDiv.classList.remove('loading');
  
  // 完全清空內容並設置新的翻譯文本
  loadingDiv.innerHTML = ''; // 清空包括"翻譯中"和spinner的所有內容
  loadingDiv.textContent = translationText.trim();
  
  // 確保沒有殘留的載入元素
  const loadingElements = loadingDiv.querySelectorAll('.ai-translation-loading-text, .loading-spinner');
  loadingElements.forEach(el => el.remove());
  
  debugLog('Updated translation for element:', element.tagName, 'Translation:', translationText.substring(0, 50) + '...');
  return true;
}

// 移除載入佔位符（失敗時）
function removeLoadingPlaceholder(elementId) {
  const element = document.querySelector(`[data-translation-id="${elementId}"]`);
  const loadingDiv = document.querySelector(`.ai-translation-block[data-element-id="${elementId}"]`);
  
  if (element) {
    element.removeAttribute('data-translation-id');
  }
  
  if (loadingDiv) {
    translationElements.delete(loadingDiv);
    loadingDiv.remove();
    debugLog('Removed loading placeholder for failed translation');
  }
}

function addTranslationToElement(element, translationText) {
  // 精確的重複檢查，避免誤判
  if (element.classList.contains('ai-translation-block')) {
    console.warn('Element is a translation block itself, skipping:', element);
    return;
  }
  
  // 檢查元素內部是否已經直接包含翻譯區塊
  const existingTranslations = element.querySelectorAll(':scope > .ai-translation-block');
  if (existingTranslations.length > 0) {
    console.warn('Element already has direct translation children, skipping:', element);
    return;
  }
  
  // 檢查翻譯文本是否有效
  if (!translationText || typeof translationText !== 'string' || !translationText.trim()) {
    console.warn('Invalid translation text:', translationText);
    return;
  }
  
  // 創建翻譯區塊
  const translationDiv = document.createElement('div');
  translationDiv.className = 'ai-translation-block';
  translationDiv.textContent = translationText.trim();
  
  // 添加數據標識以便追蹤
  translationDiv.setAttribute('data-original-element-id', element.tagName + '_' + Date.now());
  
  // 根據元素類型調整樣式
  const tagName = element.tagName;
  if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
    translationDiv.classList.add('ai-translation-heading');
  } else if (tagName === 'LI') {
    translationDiv.classList.add('ai-translation-list-item');
  } else if (['TD', 'TH'].includes(tagName)) {
    translationDiv.classList.add('ai-translation-table-cell');
  }
  
  // 確保翻譯顯示在原文下方
  // 對於行內元素，將其轉換為塊級顯示
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === 'inline') {
    element.style.display = 'inline-block';
  }
  
  try {
    // 插入翻譯到元素內部的最後
    element.appendChild(translationDiv);
    
    // 儲存元素以便還原
    translationElements.set(translationDiv, element);
    
    console.log('Translation added successfully to:', element.tagName);
  } catch (error) {
    console.error('Failed to add translation to element:', error, element);
  }
}

function restoreOriginalText() {
  try {
    // 方法1：使用 translationElements Map 移除
    translationElements.forEach((parentElement, translationDiv) => {
      if (translationDiv && translationDiv.parentNode) {
        translationDiv.remove();
      }
    });
    translationElements.clear();
    
    // 方法2：查找並移除頁面上所有翻譯區塊（保險起見）
    const remainingTranslations = document.querySelectorAll('.ai-translation-block');
    remainingTranslations.forEach(elem => {
      try {
        elem.remove();
      } catch (error) {
        console.warn('Failed to remove translation element:', error);
      }
    });
    
    // 重置狀態
    isTranslated = false;
    
    console.log(`Removed all translations. Remaining elements: ${document.querySelectorAll('.ai-translation-block').length}`);
    
  } catch (error) {
    console.error('Error during translation restoration:', error);
    
    // 降級處理：強制查找並移除所有翻譯區塊
    const allTranslations = document.querySelectorAll('.ai-translation-block');
    allTranslations.forEach(elem => elem.remove());
    
    // 重置所有狀態
    translationElements.clear();
    isTranslated = false;
  }
}

function updateLoadingProgress(percentage) {
  // 只更新浮動按鈕的進度
  updateFloatingButtonProgress(percentage);
}

// 顯示翻譯錯誤摘要
function showTranslationErrorSummary(errors, successCount, totalCount) {
  // 統計錯誤類型
  const errorCounts = {};
  const uniqueErrors = [];
  
  errors.forEach(error => {
    if (!errorCounts[error.type]) {
      errorCounts[error.type] = 0;
      uniqueErrors.push(error);
    }
    errorCounts[error.type]++;
  });
  
  // 生成錯誤摘要
  const failedCount = totalCount - successCount;
  let title = '翻譯完成，部分內容有問題';
  let summaryLines = [`成功翻譯 ${successCount} 個，失敗 ${failedCount} 個元素`];
  
  // 按優先級排序錯誤類型
  const errorPriority = {
    'rate_limit': 1,
    'api_key': 2,
    'account': 3,
    'quota': 4,
    'service': 5,
    'network': 6,
    'api_error': 7,
    'unknown': 8
  };
  
  uniqueErrors.sort((a, b) => (errorPriority[a.type] || 9) - (errorPriority[b.type] || 9));
  
  // 顯示最主要的錯誤（最多3個）
  const maxErrorsToShow = 3;
  for (let i = 0; i < Math.min(uniqueErrors.length, maxErrorsToShow); i++) {
    const error = uniqueErrors[i];
    const count = errorCounts[error.type];
    const countText = count > 1 ? ` (${count}次)` : '';
    summaryLines.push(`• ${error.message}${countText}`);
  }
  
  // 如果有更多錯誤，顯示省略信息
  if (uniqueErrors.length > maxErrorsToShow) {
    summaryLines.push(`• 還有 ${uniqueErrors.length - maxErrorsToShow} 種其他問題...`);
  }
  
  // 添加建議
  const primaryError = uniqueErrors[0];
  if (primaryError.type === 'rate_limit') {
    summaryLines.push('', '建議：請稍後重試或切換其他模型');
  } else if (primaryError.type === 'api_key') {
    summaryLines.push('', '建議：請檢查 API Key 設定');
  } else if (primaryError.type === 'account') {
    summaryLines.push('', '建議：請檢查帳戶餘額或權限');
  } else if (primaryError.type === 'quota') {
    summaryLines.push('', '建議：請檢查 API 配額設定');
  }
  
  const message = summaryLines.join('<br>');
  const autoCloseMs = Math.max(6000, Math.min(12000, summaryLines.length * 1000));
  
  showErrorModal(title, message, autoCloseMs);
}

// 顯示錯誤模態視窗
function showErrorModal(title, message, autoCloseMs = 5000) {
  // 移除現有的錯誤模態視窗
  const existingModal = document.getElementById('ai-translation-error-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'ai-translation-error-modal';
  modal.innerHTML = `
    <div class="error-modal-overlay">
      <div class="error-modal-content">
        <div class="error-modal-header">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">${title}</h3>
        </div>
        <div class="error-modal-body">
          <p class="error-message">${message}</p>
        </div>
        <div class="error-modal-footer">
          <button class="error-modal-close-btn">確定</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 添加關閉事件
  const closeBtn = modal.querySelector('.error-modal-close-btn');
  const overlay = modal.querySelector('.error-modal-overlay');
  
  const closeModal = () => {
    modal.remove();
  };
  
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // 自動關閉
  setTimeout(closeModal, autoCloseMs);
}

// 創建浮動按鈕
function createFloatingButton() {
  if (floatingButton) return;
  
  // 創建浮動按鈕容器
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'ai-translation-floating-container';
  
  // 合併按鈕
  floatingButton = document.createElement('div');
  floatingButton.id = 'ai-translation-floating-button';
  floatingButton.innerHTML = `
    <div class="floating-button-content">
      <!-- 左側翻譯區域 -->
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
      
      <!-- 分割線 -->
      <div class="button-divider"></div>
      
      <!-- 右側語言區域 -->
      <div class="button-right-section" id="language-section">
        <span class="language-text" id="current-language">中</span>
        <svg class="language-arrow" viewBox="0 0 24 24" width="10" height="10">
          <path d="M7 10l5 5 5-5z" fill="white"/>
        </svg>
      </div>
    </div>
  `;
  
  // 語言選擇菜單
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
  
  // 組裝容器
  buttonContainer.appendChild(languageMenu);
  buttonContainer.appendChild(floatingButton);
  document.body.appendChild(buttonContainer);
  
  // 添加事件監聽器
  const translateSection = document.getElementById('translate-section');
  const languageSection = document.getElementById('language-section');
  
  translateSection.addEventListener('click', handleTranslateClick);
  translateSection.addEventListener('contextmenu', handleTranslateSectionRightClick);
  languageSection.addEventListener('click', toggleLanguageMenu);
  
  // 語言選項點擊事件
  languageMenu.addEventListener('click', (e) => {
    const option = e.target.closest('.language-option');
    if (option) {
      selectLanguage(option.dataset.lang, option.dataset.text);
    }
  });
  
  // 點擊外部關閉菜單
  document.addEventListener('click', (e) => {
    if (!buttonContainer.contains(e.target)) {
      closeLanguageMenu();
    }
  });
  
  // 設置初始語言
  loadTargetLanguage();
  
  // 設置初始自動翻譯狀態
  updateAutoTranslateButton();
}

// 處理翻譯點擊
async function handleTranslateClick(e) {
  e.stopPropagation();
  if (isTranslating) return;
  
  // 如果語言菜單是開啟的，先關閉它
  if (isLanguageMenuOpen) {
    debugLog('Language menu is open, closing before translation');
    closeLanguageMenu();
    // 給一個短暫的延遲讓菜單關閉動畫完成
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys']);
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    // 如果未設置 API，打開設定頁面
    chrome.runtime.sendMessage({ action: 'openOptions' });
    return;
  }
  
  translatePage();
}

// 處理翻譯區域右鍵點擊（切換自動翻譯）
async function handleTranslateSectionRightClick(e) {
  e.preventDefault();
  e.stopPropagation();
  await toggleAutoTranslate();
}

// 更新自動翻譯狀態顯示
function updateAutoTranslateButton() {
  const translateSection = document.getElementById('translate-section');
  
  if (!translateSection) {
    debugLog('translateSection not found, will retry later');
    return;
  }
  
  if (autoTranslateEnabled) {
    translateSection.classList.add('auto-translate-enabled');
    translateSection.title = getLocalizedMessage('auto_translate_enabled', '左鍵：翻譯頁面 | 右鍵：關閉自動翻譯');
    debugLog('Auto-translate indicator enabled');
  } else {
    translateSection.classList.remove('auto-translate-enabled');
    translateSection.title = getLocalizedMessage('auto_translate_disabled', '左鍵：翻譯頁面 | 右鍵：開啟自動翻譯');
    debugLog('Auto-translate indicator disabled');
  }
}

// 更新浮動按鈕狀態
function updateFloatingButton(status) {
  if (!floatingButton) return;
  
  const translateIcon = floatingButton.querySelector('.translate-icon');
  const loadingIcon = floatingButton.querySelector('.loading-icon');
  const progressText = floatingButton.querySelector('.progress-text');
  const translateSection = floatingButton.querySelector('.button-left-section');
  
  // 重置所有圖標和狀態
  translateIcon.style.display = 'none';
  loadingIcon.style.display = 'none';
  loadingIcon.classList.remove('show');
  progressText.style.display = 'none';
  
  // 移除所有狀態類別
  floatingButton.classList.remove('translating');
  translateSection.classList.remove('translating');
  floatingButton.removeAttribute('title');
  
  switch (status) {
    case 'ready':
      translateIcon.style.display = 'block';
      floatingButton.setAttribute('title', '點擊翻譯頁面 | 選擇語言');
      break;
    case 'translating':
      loadingIcon.style.display = 'block';
      loadingIcon.classList.add('show');
      progressText.style.display = 'block';
      floatingButton.classList.add('translating');
      translateSection.classList.add('translating');
      floatingButton.setAttribute('title', getLocalizedMessage('translating', '翻譯中...'));
      // 初始化進度環
      updateFloatingButtonProgress(0);
      break;
    case 'translated':
      translateIcon.style.display = 'block';
      floatingButton.setAttribute('title', getLocalizedMessage('restore_original', '點擊恢復原文'));
      break;
  }
}

// 更新浮動按鈕進度
function updateFloatingButtonProgress(percentage) {
  if (!floatingButton) return;
  
  const progressRingFill = floatingButton.querySelector('.progress-ring-fill');
  const progressText = floatingButton.querySelector('.progress-text');
  
  // 確保百分比在有效範圍內
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  if (progressRingFill) {
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedPercentage / 100 * circumference);
    progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRingFill.style.strokeDashoffset = offset;
  }
  
  if (progressText) {
    progressText.textContent = `${Math.round(clampedPercentage)}%`;
  }
}

// 語言選擇相關函數
function toggleLanguageMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('ai-translation-language-menu');
  const arrow = document.querySelector('.language-arrow');
  
  if (isLanguageMenuOpen) {
    closeLanguageMenu();
  } else {
    openLanguageMenu();
  }
}

function openLanguageMenu() {
  const menu = document.getElementById('ai-translation-language-menu');
  const arrow = document.querySelector('.language-arrow');
  
  if (menu) {
    menu.classList.add('show');
    isLanguageMenuOpen = true;
    
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }
    
    // 高亮當前語言
    const currentOption = menu.querySelector(`[data-lang="${targetLanguage}"]`);
    if (currentOption) {
      // 移除之前的高亮
      menu.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
      // 高亮當前選項
      currentOption.classList.add('active');
    }
  }
}

function closeLanguageMenu() {
  const menu = document.getElementById('ai-translation-language-menu');
  const arrow = document.querySelector('.language-arrow');
  
  if (menu) {
    menu.classList.remove('show');
    isLanguageMenuOpen = false;
    
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

async function selectLanguage(langCode, langText) {
  targetLanguage = langCode;
  
  // 更新按鈕文字
  const languageTextElement = document.getElementById('current-language');
  if (languageTextElement) {
    languageTextElement.textContent = langText;
  }
  
  // 儲存到設定
  await chrome.storage.sync.set({ targetLanguage: langCode });
  
  // 關閉菜單
  closeLanguageMenu();
  
  // 如果已經翻譯過，重新翻譯
  if (isTranslated) {
    restoreOriginalText();
    setTimeout(() => {
      translatePage();
    }, 100);
  }
}

// 載入目標語言設定
async function loadTargetLanguage() {
  const settings = await chrome.storage.sync.get(['targetLanguage']);
  if (settings.targetLanguage) {
    targetLanguage = settings.targetLanguage;
  }
  
  // 更新按鈕顯示
  updateLanguageButtonText();
}

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
    languageTextElement.textContent = languageMap[targetLanguage] || '中';
  }
}

// 初始化浮動按鈕
function initializeFloatingButton() {
  // 等待頁面完全載入
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }
}

// 初始化
initializeFloatingButton();

// 確保在DOM完全創建後更新自動翻譯狀態 - 增加多次重試
let buttonInitRetryCount = 0;
const maxButtonInitRetries = 20;
const initAutoTranslateButton = () => {
  const translateSection = document.getElementById('translate-section');
  if (translateSection) {
    updateAutoTranslateButton();
    debugLog('Auto-translate button initialized successfully');
  } else if (buttonInitRetryCount < maxButtonInitRetries) {
    buttonInitRetryCount++;
    setTimeout(initAutoTranslateButton, 200);
    debugLog(`Retrying auto-translate button init (${buttonInitRetryCount}/${maxButtonInitRetries})`);
  } else {
    debugLog('Failed to initialize auto-translate button after all retries');
  }
};
initAutoTranslateButton();

// 追蹤自動翻譯檢查狀態，避免重複觸發
let autoTranslateCheckInProgress = false;
let lastAutoTranslateCheck = 0;

// 自動翻譯邏輯
async function checkAndAutoTranslate() {
  // 防止重複觸發（在3秒內）
  const now = Date.now();
  if (now - lastAutoTranslateCheck < 3000) {
    debugLog('Auto-translate check too frequent, skipping');
    return;
  }
  
  if (autoTranslateCheckInProgress) {
    debugLog('Auto-translate check already in progress, skipping');
    return;
  }
  
  autoTranslateCheckInProgress = true;
  lastAutoTranslateCheck = now;
  
  try {
    // Wait for settings to be loaded
    let waitCount = 0;
    const maxWait = 50; // 10 seconds max
    while (!settingsLoaded && waitCount < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 200));
      waitCount++;
      debugLog(`Waiting for settings to load... (${waitCount}/${maxWait})`);
    }
    
    if (!settingsLoaded) {
      debugLog('Settings failed to load, skipping auto-translate');
      return;
    }
    
    if (!autoTranslateEnabled) {
      debugLog('Auto-translate disabled for', currentDomain);
      return;
    }
    
    // 檢查是否已經在翻譯或已翻譯
    if (isTranslating) {
      debugLog('Translation already in progress, skipping auto-translate');
      return;
    }
    
    if (isTranslated) {
      debugLog('Page already translated, skipping auto-translate');
      return;
    }
    
    debugLog('Auto-translate is enabled for', currentDomain, ', checking if page should be translated');
    
    // 等待一秒讓頁面加載完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 檢查是否已經有API配置
    const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'enableLanguageDetection']);
    if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
      debugLog('No API configuration found, skipping auto-translate');
      return;
    }
    
    // 檢查頁面是否有可翻譯內容
    const elements = getTranslatableElements();
    if (elements.length === 0) {
      debugLog('No translatable elements found, skipping auto-translate');
      return;
    }
    
    // 如果啟用語言檢測，先檢查是否需要翻譯
    if (apiConfig.enableLanguageDetection !== false) {
      const sampleTexts = elements.slice(0, 5).map(el => el.textContent).filter(text => text.trim().length > 20);
      if (sampleTexts.length > 0) {
        const sampleText = sampleTexts.join(' ').substring(0, 1000);
        const detectedLanguage = await detectLanguage(sampleText);
        
        if (detectedLanguage && !shouldTranslate(detectedLanguage, targetLanguage)) {
          debugLog('Auto-translate skipped: content is already in target language', detectedLanguage);
          return;
        }
      }
    }
    
    debugLog('Starting auto-translation for', elements.length, 'elements');
    translatePage();
    
  } finally {
    autoTranslateCheckInProgress = false;
  }
}

// 監聽頁面導航變化 (適用於SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    debugLog('Page navigation detected:', url);
    
    // 重置翻譯狀態
    isTranslated = false;
    translationElements.clear();
    
    // 如果還在同一個domain，檢查自動翻譯
    if (location.hostname === currentDomain) {
      checkAndAutoTranslate();
    }
  }
}).observe(document, { subtree: true, childList: true });

// 多個載入事件監聽器以確保在各種情況下都能觸發自動翻譯

// DOM內容載入完成
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOMContentLoaded event triggered');
  checkAndAutoTranslate();
});

// 頁面完全載入完成
window.addEventListener('load', () => {
  debugLog('Window load event triggered');
  checkAndAutoTranslate();
});

// 如果頁面已經加載完成，立即檢查
if (document.readyState === 'complete') {
  debugLog('Page already loaded, checking auto-translate immediately');
  checkAndAutoTranslate();
} else if (document.readyState === 'interactive') {
  debugLog('Page DOM is ready, checking auto-translate');
  checkAndAutoTranslate();
}

// 額外的延遲檢查，確保在動態內容載入後也能觸發
setTimeout(() => {
  debugLog('Delayed auto-translate check');
  checkAndAutoTranslate();
}, 3000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleTranslation') {
    targetLanguage = request.targetLanguage || 'zh-TW';
    expertMode = request.expertMode || 'general';
    translatePage();
  } else if (request.action === 'getTranslationStatus') {
    sendResponse({ isTranslated: isTranslated });
  } else if (request.action === 'updateLanguage') {
    targetLanguage = request.targetLanguage || 'zh-TW';
    updateLanguageButtonText();
    
    // 如果已经翻译过，重新翻译以应用新语言
    if (isTranslated) {
      restoreOriginalText();
      setTimeout(() => {
        translatePage();
      }, 100);
    }
  } else if (request.action === 'updateExpertMode') {
    expertMode = request.expertMode || 'general';
    
    // 如果已经翻译过，重新翻译以应用新的专家模式
    if (isTranslated) {
      restoreOriginalText();
      setTimeout(() => {
        translatePage();
      }, 100);
    }
  }
});