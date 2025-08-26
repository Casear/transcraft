let isTranslated = false;
let translationElements = new Map();
let targetLanguage = 'zh-TW';
let expertMode = 'general';
let floatingButton = null;
let isTranslating = false;
let isLanguageMenuOpen = false;

function getTranslatableElements() {
  // 取得所有包含文字的區塊級元素
  const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'CAPTION'];
  const elements = [];
  
  blockTags.forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    for (let elem of elems) {
      // 檢查元素是否有實質文字內容且尚未翻譯
      const text = elem.innerText?.trim();
      if (text && !elem.querySelector('.ai-translation-block') && !elem.closest('.ai-translation-block')) {
        // 排除已經包含翻譯的元素或是翻譯元素本身
        elements.push(elem);
      }
    }
  });
  
  // 處理只有文字節點的 DIV 和 SPAN
  ['DIV', 'SPAN', 'SECTION', 'ARTICLE'].forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    for (let elem of elems) {
      // 檢查是否只包含文字，沒有其他區塊級子元素
      const hasBlockChildren = elem.querySelector('p, h1, h2, h3, h4, h5, h6, div, section, article, ul, ol, table');
      const text = elem.innerText?.trim();
      
      if (!hasBlockChildren && text && text.length > 10 && !elem.querySelector('.ai-translation-block') && !elem.closest('.ai-translation-block')) {
        elements.push(elem);
      }
    }
  });
  
  return elements;
}

async function translateText(text, apiConfig) {
  try {
    // 確保擴充功能上下文仍然有效
    if (!chrome.runtime?.id) {
      throw new Error('EXTENSION_CONTEXT_INVALID');
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      targetLanguage: targetLanguage,
      apiConfig: apiConfig,
      expertMode: expertMode
    });
    
    if (!response) {
      throw new Error('NETWORK_ERROR');
    }
    
    if (response.error) {
      // 檢查不同類型的錯誤
      const errorMsg = response.error;
      if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('exceeded')) {
        throw new Error('QUOTA_EXCEEDED');
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('connection')) {
        throw new Error('NETWORK_ERROR');
      } else if (errorMsg.includes('API key') || errorMsg.includes('authentication') || errorMsg.includes('unauthorized')) {
        throw new Error('API_KEY_ERROR');
      } else {
        throw new Error('API_ERROR');
      }
    }
    
    return response.translation || null;
  } catch (error) {
    // 重新拋出錯誤，讓上層處理
    throw error;
  }
}

async function translatePage() {
  if (isTranslating) return;
  
  if (isTranslated) {
    restoreOriginalText();
    updateFloatingButton('ready');
    return;
  }

  const elements = getTranslatableElements();
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel']);
  
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    alert('請先在擴充功能設定中配置 API Key');
    return;
  }

  isTranslating = true;
  updateFloatingButton('translating');

  // 獲取批次設定
  const batchSettings = await chrome.storage.sync.get(['maxBatchLength', 'maxBatchElements']);
  const maxBatchLength = batchSettings.maxBatchLength || 8000; // 預設最大8000字元
  const maxBatchElements = batchSettings.maxBatchElements || 20; // 預設最大20個元素
  
  let successCount = 0;
  let processedElements = 0;
  
  // 動態批次處理
  while (processedElements < elements.length) {
    const batch = [];
    const texts = [];
    const validElements = [];
    let currentBatchLength = 0;
    
    // 動態決定批次大小
    for (let i = processedElements; i < elements.length && batch.length < maxBatchElements; i++) {
      const element = elements[i];
      const text = element.innerText.trim();
      
      if (text) {
        // 計算加入這個元素後的總長度（包括分隔符）
        const separatorLength = texts.length > 0 ? '\n\n<<TRANSLATE_SEPARATOR>>\n\n'.length : 0;
        const newLength = currentBatchLength + separatorLength + text.length;
        
        // 如果加入這個元素會超過長度限制，且已經有其他元素，則結束此批次
        if (newLength > maxBatchLength && texts.length > 0) {
          break;
        }
        
        // 如果單個元素就超過限制，仍然處理它（避免無限循環）
        texts.push(text);
        validElements.push(element);
        batch.push(element);
        currentBatchLength = newLength;
      }
      
      processedElements++;
      
      // 如果單個元素就達到長度限制，立即處理
      if (currentBatchLength >= maxBatchLength) {
        break;
      }
    }
    
    if (texts.length > 0) {
      // 將文字組合，用特殊分隔符分開
      const combinedText = texts.join('\n\n<<TRANSLATE_SEPARATOR>>\n\n');
      
      try {
        const translatedText = await translateText(combinedText, apiConfig);
        
        if (translatedText) {
          const translations = translatedText.split(/\n\n<<TRANSLATE_SEPARATOR>>\n\n/);
          
          // 為每個元素添加翻譯
          validElements.forEach((element, index) => {
            if (translations[index]) {
              addTranslationToElement(element, translations[index]);
              successCount++;
            }
          });
        }
      } catch (error) {
        // 處理不同類型的錯誤
        isTranslating = false;
        
        switch (error.message) {
          case 'QUOTA_EXCEEDED':
            showErrorModal('配額已用完', '請檢查您的 API 帳單設定，或嘗試使用其他 AI 服務。');
            updateFloatingButton('ready');
            break;
          case 'NETWORK_ERROR':
            showErrorModal('網路連線錯誤', '請檢查您的網路狀態，確保網路連線正常。');
            updateFloatingButton('ready');
            break;
          case 'API_KEY_ERROR':
            showErrorModal('API Key 錯誤', '請檢查您的 API Key 設定是否正確。');
            updateFloatingButton('ready');
            break;
          case 'EXTENSION_CONTEXT_INVALID':
            showErrorModal('擴充功能已更新', '請重新整理頁面後再試。');
            updateFloatingButton('ready');
            break;
          default:
            showErrorModal('翻譯失敗', '發生未知錯誤，請稍後再試或檢查網路連線。');
            updateFloatingButton('ready');
        }
        return;
      }
    }
    
    // 更新進度
    const progress = Math.min(100, (processedElements / elements.length) * 100);
    updateLoadingProgress(progress);
  }

  isTranslated = true;
  isTranslating = false;
  updateFloatingButton('translated');
  
  // 顯示翻譯統計
  console.log(`翻譯完成: 成功翻譯 ${successCount} / ${elements.length} 個元素`);
}

function addTranslationToElement(element, translationText) {
  // 創建翻譯區塊
  const translationDiv = document.createElement('div');
  translationDiv.className = 'ai-translation-block';
  translationDiv.textContent = translationText;
  
  // 根據元素類型調整樣式
  const tagName = element.tagName;
  if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
    translationDiv.classList.add('ai-translation-heading');
  } else if (tagName === 'LI') {
    translationDiv.classList.add('ai-translation-list-item');
  } else if (['TD', 'TH'].includes(tagName)) {
    translationDiv.classList.add('ai-translation-table-cell');
  }
  
  // 插入翻譯
  element.appendChild(translationDiv);
  
  // 儲存元素以便還原
  translationElements.set(translationDiv, element);
}

function restoreOriginalText() {
  // 移除所有翻譯區塊
  translationElements.forEach((parentElement, translationDiv) => {
    if (translationDiv.parentNode) {
      translationDiv.remove();
    }
  });
  translationElements.clear();
  isTranslated = false;
}

function updateLoadingProgress(percentage) {
  // 只更新浮動按鈕的進度
  updateFloatingButtonProgress(percentage);
}

// 顯示錯誤模態視窗
function showErrorModal(title, message) {
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
  
  // 3秒後自動關閉
  setTimeout(closeModal, 5000);
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
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
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
}

// 處理翻譯點擊
async function handleTranslateClick(e) {
  e.stopPropagation();
  if (isTranslating) return;
  
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys']);
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    // 如果未設置 API，打開設定頁面
    chrome.runtime.sendMessage({ action: 'openOptions' });
    return;
  }
  
  translatePage();
}

// 更新浮動按鈕狀態
function updateFloatingButton(status) {
  if (!floatingButton) return;
  
  const translateIcon = floatingButton.querySelector('.translate-icon');
  const loadingIcon = floatingButton.querySelector('.loading-icon');
  const progressText = floatingButton.querySelector('.progress-text');
  const translateSection = floatingButton.querySelector('.button-left-section');
  
  // 重置所有圖標
  translateIcon.style.display = 'none';
  loadingIcon.style.display = 'none';
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
      progressText.style.display = 'block';
      floatingButton.classList.add('translating');
      translateSection.classList.add('translating');
      floatingButton.setAttribute('title', '翻譯中...');
      break;
    case 'translated':
      translateIcon.style.display = 'block';
      floatingButton.setAttribute('title', '點擊恢復原文');
      break;
  }
}

// 更新浮動按鈕進度
function updateFloatingButtonProgress(percentage) {
  if (!floatingButton) return;
  
  const progressRingFill = floatingButton.querySelector('.progress-ring-fill');
  const progressText = floatingButton.querySelector('.progress-text');
  
  if (progressRingFill) {
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100 * circumference);
    progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRingFill.style.strokeDashoffset = offset;
  }
  
  if (progressText) {
    progressText.textContent = `${Math.round(percentage)}%`;
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