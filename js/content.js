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
            elements.push(elem);
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
  
  console.log(`Found ${uniqueElements.length} translatable elements (filtered from ${elements.length})`);
  return uniqueElements;
}

async function translateText(text, apiConfig) {
  try {
    // 確保擴充功能上下文仍然有效
    if (!chrome.runtime?.id) {
      throw new Error('EXTENSION_CONTEXT_INVALID');
    }
    
    const response = await new Promise((resolve, reject) => {
      let isResolved = false;
      
      // 設定超時機制 (30秒)
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('TIMEOUT_ERROR: Translation request timed out'));
        }
      }, 30000);
      
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
            console.error('Chrome runtime error:', errorMessage);
            reject(new Error(errorMessage));
            return;
          }
          
          // 檢查響應是否有效
          if (!response) {
            reject(new Error('NETWORK_ERROR: No response received'));
            return;
          }
          
          resolve(response);
        });
      } catch (error) {
        clearTimeout(timeoutId);
        if (!isResolved) {
          isResolved = true;
          console.error('Error sending message:', error);
          reject(error);
        }
      }
    });
    
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
          // 調試：記錄原始翻譯文本
          console.log('原始翻譯文本:', translatedText);
          console.log('查找分隔符:', translatedText.includes('<<TRANSLATE_SEPARATOR>>'));
          
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
          console.log(`批次處理: 原始元素 ${validElements.length} 個, 翻譯結果 ${translations.length} 個`);
          console.log('翻譯段落:', translations);
          
          // 為每個元素添加翻譯
          const maxIndex = Math.min(validElements.length, translations.length);
          for (let index = 0; index < maxIndex; index++) {
            const element = validElements[index];
            const translation = translations[index];
            
            if (translation && translation.trim()) {
              const cleanedTranslation = translation.trim();
              addTranslationToElement(element, cleanedTranslation);
              successCount++;
            } else {
              console.warn(`元素 ${index} 的翻譯為空`);
            }
          }
          
          // 處理翻譯數量不匹配的情況
          if (translations.length < validElements.length) {
            console.warn(`翻譯數量不足: 需要 ${validElements.length} 個，得到 ${translations.length} 個`);
            // 如果只有一個翻譯但有多個元素，嘗試將翻譯分配給第一個元素
            if (translations.length === 1 && validElements.length > 1) {
              console.log('嘗試將單個翻譯分配給第一個元素');
              const firstElement = validElements[0];
              const singleTranslation = translations[0].trim();
              if (singleTranslation && !firstElement.querySelector('.ai-translation-block')) {
                addTranslationToElement(firstElement, singleTranslation);
                successCount++;
              }
            }
          } else if (translations.length > validElements.length) {
            console.warn(`翻譯數量過多: 需要 ${validElements.length} 個，得到 ${translations.length} 個`);
          }
        }
      } catch (error) {
        // 記錄錯誤但繼續處理剩餘批次
        console.error('Batch translation error:', error);
        
        const errorMsg = error.message;
        
        // 只在嚴重錯誤時停止處理
        if (errorMsg === 'EXTENSION_CONTEXT_INVALID' || 
            errorMsg === 'API_KEY_ERROR' || 
            errorMsg.includes('No endpoints found matching your data policy')) {
          
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
        
        // 對於網路或配額錯誤，顯示警告但繼續處理
        if (errorMsg === 'QUOTA_EXCEEDED') {
          console.warn('Quota exceeded, some content may not be translated');
          showErrorModal('配額已用完', '部分內容可能未翻譯。請檢查您的 API 帳單設定。', 3000);
        } else if (errorMsg === 'NETWORK_ERROR') {
          console.warn('Network error, retrying remaining content');
          showErrorModal('網路暫時不穩', '繼續翻譯剩餘內容...', 2000);
        } else {
          console.warn('Translation error for this batch:', errorMsg);
        }
        
        // 繼續處理下一個批次
      }
    }
    
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
  console.log(`翻譯完成: 成功翻譯 ${successCount} / ${elements.length} 個元素`);
  
  // 如果有部分失敗，顯示警告
  if (successCount < elements.length) {
    const failedCount = elements.length - successCount;
    showErrorModal('部分內容未翻譯', 
      `成功翻譯 ${successCount} 個元素，${failedCount} 個元素翻譯失敗。<br>可能是因為網路問題或 API 限制。`, 
      4000);
  }
}

function addTranslationToElement(element, translationText) {
  // 更嚴格的重複檢查
  if (element.querySelector('.ai-translation-block') || 
      element.closest('.ai-translation-block') ||
      element.classList.contains('ai-translation-block')) {
    console.warn('Element already has translation, skipping:', element);
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
      floatingButton.setAttribute('title', '翻譯中...');
      // 初始化進度環
      updateFloatingButtonProgress(0);
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
  // 檢查是否在YouTube頁面，如果是則不顯示浮動按鈕（使用專門的YouTube字幕翻譯）
  if (window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch') {
    console.log('YouTube video detected, floating button disabled');
    return;
  }

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