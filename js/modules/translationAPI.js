// 翻譯 API 模組
// 處理翻譯文字處理和與背景腳本的通訊

// 直接從全域範圍存取函數

// 從頁面獲取可翻譯的元素
function getTranslatableElements() {
  // 獲取所有可能包含可翻譯文字的內容元素
  const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'CAPTION', 'DIV', 'SPAN', 'DT', 'DD', 'INPUT', 'OPTION'];
  const elements = [];
  const excludedElements = [];
  
  blockTags.forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    window.TransCraftDebug.debugLog(`Checking ${elems.length} ${tag} elements`);
    
    for (let elem of elems) {
      // 檢查元素是否有文字內容且尚未被翻譯
      // 對於 input 元素，使用 value 屬性；對於 option 元素，使用 textContent；其他使用 innerText
      // 特殊處理表格單元格以避免巢狀翻譯區塊
      let text;
      if (elem.tagName === 'INPUT' && (elem.type === 'button' || elem.type === 'submit')) {
        text = elem.value?.trim();
      } else if (elem.tagName === 'OPTION') {
        text = elem.textContent?.trim();
      } else if (elem.tagName === 'TD' || elem.tagName === 'TH') {
        // 對於表格單元格，獲取直接的文字內容並排除現有的翻譯區塊和腳本
        text = Array.from(elem.childNodes)
          .filter(node => {
            // 包含文字節點和非翻譯區塊或腳本的元素
            if (node.nodeType === Node.TEXT_NODE) {
              return true;
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
              return !node.classList?.contains('ai-translation-block') && 
                     node.tagName !== 'SCRIPT' && 
                     node.tagName !== 'STYLE';
            }
            return false;
          })
          .map(node => {
            // 對於元素節點，獲取內部文字但排除腳本
            if (node.nodeType === Node.ELEMENT_NODE) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = node.innerHTML;
              // 移除所有 script 和 style 標籤
              const scripts = tempDiv.querySelectorAll('script, style');
              scripts.forEach(script => script.remove());
              return tempDiv.textContent || tempDiv.innerText || '';
            }
            return node.textContent;
          })
          .join(' ')
          .trim();
      } else {
        // 對於其他元素，使用 innerText 但也檢查腳本內容
        text = elem.innerText?.trim();
        
        // 再次檢查：如果 innerText 仍包含類似腳本的內容，嘗試清理它
        if (text && elem.querySelector('script')) {
          const tempElement = elem.cloneNode(true);
          const scripts = tempElement.querySelectorAll('script, style');
          scripts.forEach(script => script.remove());
          text = tempElement.innerText?.trim();
        }
      }
      const elemInfo = {
        tag: elem.tagName,
        text: text?.substring(0, 100) + (text?.length > 100 ? '...' : ''),
        textLength: text?.length,
        classList: elem.className,
        id: elem.id
      };
      
      if (!text || text.length < 2) {
        excludedElements.push({...elemInfo, reason: 'Text too short or empty'});
        continue;
      }
      
      // 跳過 JavaScript 程式碼模式 - 更全面的檢測
      if (/^\s*(var\s+|let\s+|const\s+|function\s+|if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{|catch\s*\(|\/\*|\/\/|=\s*function|\.js|javascript:|console\.|window\.|document\.)/i.test(text) ||
          /^\s*[\{\}]+\s*$/.test(text) ||
          /^\s*(true|false|null|undefined|NaN)\s*;?\s*$/.test(text) ||
          /=\s*["\'][^"\']*["\'];?$/.test(text) ||
          /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(text) ||
          text.includes('entryMthd_') || 
          text.includes('lcode_') || 
          text.includes('baseVenueCd_')) {
        excludedElements.push({...elemInfo, reason: 'JavaScript code pattern'});
        continue;
      }
      
      if (elem.querySelector('.ai-translation-block') || 
          elem.closest('.ai-translation-block') ||
          elem.classList.contains('ai-translation-block')) {
        excludedElements.push({...elemInfo, reason: 'Already has translation'});
        continue;
      }
        
      // 排除導航、廣告、腳本、UI 元素和其他常見的非內容元素
      const classList = elem.className.toLowerCase();
      const elementId = elem.id.toLowerCase();
      
      // 檢查元素是否在按鈕或表單控制項內（更具體）
      // 例外：即使 TD 和 TH 元素在表單內也允許
      const isTableCell = elem.tagName === 'TD' || elem.tagName === 'TH';
      const isUIElement = !isTableCell && (
        elem.closest('button, input, select, textarea, [role="button"]') ||
        (elem.closest('[aria-label]') && elem.closest('button, [role="button"], input, select'))
      );
      
      if (isUIElement) {
        excludedElements.push({...elemInfo, reason: 'UI element (button/form/control)'});
        continue;
      }
      
      // 對於類別和 ID 的更嚴格過濾條件
      // 對表格單元格較不嚴格 - 它們通常包含重要內容
      const strictFilter = !isTableCell && (
        classList.includes('nav') || classList.includes('menu') || 
        classList.includes('ad') || classList.includes('banner') ||
        classList.includes('script') || classList.includes('style') ||
        classList.includes('hidden') || classList.includes('invisible') ||
        classList.includes('button') || classList.includes('btn') ||
        classList.includes('control') || classList.includes('widget') ||
        elementId.includes('nav') || elementId.includes('menu') ||
        elementId.includes('ad') || elementId.includes('banner') ||
        elementId.includes('script') || elementId.includes('style') ||
        elementId.includes('button') || elementId.includes('btn')
      );
      
      if (strictFilter) {
        excludedElements.push({...elemInfo, reason: 'Excluded by class/id filters'});
        continue;
      }
        
      // 檢查是否在 script 或 style 標籤內
      const parentScript = elem.closest('script, style, noscript');
      if (parentScript) {
        excludedElements.push({...elemInfo, reason: 'Inside script/style tag'});
        continue;
      }
      
      // 排除任何包含 script 或 style 標籤的元素
      const containsScript = elem.querySelector('script, style');
      if (containsScript) {
        excludedElements.push({...elemInfo, reason: 'Contains script/style tags'});
        continue;
      }
      
      // 排除翻譯擴充功能本身的 UI 元素
      const isTranslationUI = elem.closest('#ai-translation-floating-container') ||
                             elem.closest('#ai-translation-language-menu') ||
                             elem.closest('#ai-translation-error-modal');
      if (isTranslationUI) {
        excludedElements.push({...elemInfo, reason: 'Translation UI element'});
        continue;
      }
      
      // 對 DIV 和 SPAN 元素的額外過濾以避免過度包含
      if (elem.tagName === 'DIV' || elem.tagName === 'SPAN') {
        // 如果元素包含會被單獨翻譯的特定內容元素則跳過
        const contentChildren = elem.querySelectorAll('dt, dd, p, h1, h2, h3, h4, h5, h6, li, td, th');
        if (contentChildren.length > 1) {
          excludedElements.push({...elemInfo, reason: 'Container with multiple content children'});
          continue;
        }
        
        // 如果有很多區塊子元素也跳過（可能是容器）
        const blockChildren = elem.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, figcaption, caption, div');
        if (blockChildren.length > 3) {
          excludedElements.push({...elemInfo, reason: 'Container with many block children'});
          continue;
        }
        
        // 對 SPAN 元素更寬鬆的文字長度要求
        const minLength = elem.tagName === 'SPAN' ? 3 : 10;
        if (text.length < minLength) {
          excludedElements.push({...elemInfo, reason: `Text too short for ${elem.tagName}`});
          continue;
        }
        
        // 如果看起來純粹是數字則跳過（但允許日文單個「詞」）
        if (/^\s*\d+\s*$/.test(text)) {
          excludedElements.push({...elemInfo, reason: 'Pure number'});
          continue;
        }
        
        // 更具體檢查單個英文詞（但允許日文/中文字符）
        if (/^[a-zA-Z]+$/.test(text) && text.split(/\s+/).length === 1 && text.length < 4) {
          excludedElements.push({...elemInfo, reason: 'Short English word'});
          continue;
        }
        
        // 如果有特定的佈局/UI 類別則跳過（但允許內容類別）
        if ((classList.includes('container') || classList.includes('wrapper') || 
            classList.includes('row') || classList.includes('col') ||
            classList.includes('grid') || classList.includes('flex') ||
            classList.includes('layout') || classList.includes('sidebar') ||
            classList.includes('modal')) &&
            // 如果有特定內容類別則不排除
            !classList.includes('dispareacontent') && 
            !classList.includes('dispareaheading') &&
            !classList.includes('content') &&
            !classList.includes('main')) {
          excludedElements.push({...elemInfo, reason: 'Layout/structure element'});
          continue;
        }
        
        // 允許包含日文/中文字符的有意義的 SPAN 元素
        if (elem.tagName === 'SPAN' && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u0100-\u017F\u00C0-\u00FF]/.test(text)) {
          // 此 SPAN 包含 CJK 或重音字符，可能是有意義的內容
          window.TransCraftDebug.debugLog(`✅ Including meaningful SPAN: "${text.substring(0, 50)}..."`);
        }
      }
      
      // 對 DT 和 DD 元素（定義清單項目）的額外過濾
      if (elem.tagName === 'DT' || elem.tagName === 'DD') {
        // 這些通常是翻譯的好候選者，但如果太短則跳過
        if (text.length < 5) {
          excludedElements.push({...elemInfo, reason: 'Text too short for DT/DD'});
          continue;
        }
      }
      
      // 對 INPUT 元素的額外過濾
      if (elem.tagName === 'INPUT') {
        // 只翻譯按鈕和提交輸入類型
        if (elem.type !== 'button' && elem.type !== 'submit') {
          excludedElements.push({...elemInfo, reason: 'Not a button/submit input'});
          continue;
        }
        
        // 如果沒有值或值很短則跳過
        if (!elem.value || elem.value.trim().length < 2) {
          excludedElements.push({...elemInfo, reason: 'No value or too short for INPUT'});
          continue;
        }
        
        // 跳過常見的英文按鈕文字（由於這是日文網站，這些可能不需要翻譯）
        const commonEnglishButtons = ['OK', 'Cancel', 'Submit', 'Reset', 'Clear', 'Search', 'Go', 'Next', 'Back', 'Home'];
        if (commonEnglishButtons.includes(elem.value.trim())) {
          excludedElements.push({...elemInfo, reason: 'Common English button text'});
          continue;
        }
      }
      
      // 對 OPTION 元素的額外過濾
      if (elem.tagName === 'OPTION') {
        // 如果文字太短則跳過
        if (text.length < 2) {
          excludedElements.push({...elemInfo, reason: 'Text too short for OPTION'});
          continue;
        }
        
        // 如果是純數字或常見值則跳過
        if (/^\s*\d+\s*$/.test(text) || ['', '-', '--', '...'].includes(text)) {
          excludedElements.push({...elemInfo, reason: 'Non-meaningful option value'});
          continue;
        }
      }
      
      elements.push(elem);
      window.TransCraftDebug.debugLog(`✅ Added element: ${elem.tagName} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)`);
    }
  });
  
  // 記錄排除的元素以供調試
  if (excludedElements.length > 0) {
    window.TransCraftDebug.debugLog(`🚫 Excluded ${excludedElements.length} elements:`);
    excludedElements.slice(0, 5).forEach(elem => {
      window.TransCraftDebug.debugLog(`   - ${elem.tag}: "${elem.text}" (${elem.reason})`);
    });
    if (excludedElements.length > 5) {
      window.TransCraftDebug.debugLog(`   ... and ${excludedElements.length - 5} more`);
    }
  }
  
  // 移除重複和巢狀元素，優先考慮特定內容元素
  const uniqueElements = elements.filter((elem, index) => {
    // 檢查重複和巢狀元素
    const isDuplicate = elements.slice(0, index).some(otherElem => {
      if (otherElem === elem) return true;
      
      // 優先系統：優先選擇特定內容元素而非容器
      const contentTags = ['DT', 'DD', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH'];
      const containerTags = ['DIV', 'SECTION', 'ARTICLE'];
      
      const elemIsContent = contentTags.includes(elem.tagName);
      const otherIsContainer = containerTags.includes(otherElem.tagName);
      
      // 如果此元素被包含在另一個元素內
      if (otherElem.contains(elem)) {
        // 如果容器是通用容器而這是特定內容，保留內容
        if (otherIsContainer && elemIsContent) {
          // 不跳過此內容元素 - 應該優先選擇
          return false;
        }
        
        // 特殊情況：如果父元素是 TD/TH 而子元素是具有相似內容的 SPAN，跳過子元素
        if ((otherElem.tagName === 'TD' || otherElem.tagName === 'TH') && 
            (elem.tagName === 'SPAN' || elem.tagName === 'DIV')) {
          const parentText = otherElem.innerText?.trim();
          const childText = elem.innerText?.trim();
          // 如果子文字是父文字的重要部分，可能是巢狀內容
          if (childText && parentText && parentText.includes(childText)) {
            return true;
          }
        }
        return true;
      }
      
      // 如果此元素包含已被選擇的另一個元素
      if (elem.contains(otherElem)) {
        // 如果這是通用容器而另一個是特定內容，跳過此容器
        if (containerTags.includes(elem.tagName) && contentTags.includes(otherElem.tagName)) {
          return true; // Skip this container element
        }
        
        // 如果此元素包含多個已選擇的內容元素也跳過
        const containedContentElements = elements.slice(0, index).filter(other => 
          elem.contains(other) && contentTags.includes(other.tagName)
        );
        if (containedContentElements.length > 0) {
          return true; // 跳過此容器，因為其內容已被單獨翻譯
        }
      }
      
      // 只有當文字內容相同且一個包含另一個時才認為是重複
      const thisText = elem.innerText?.trim();
      const otherText = otherElem.innerText?.trim();
      
      return thisText === otherText && thisText && 
             (otherElem.contains(elem) || elem.contains(otherElem));
    });
    
    if (isDuplicate) {
      const parentInfo = elements.slice(0, index).find(other => other.contains(elem));
      window.TransCraftDebug.debugLog(`🔄 Removed duplicate/nested: ${elem.tagName} "${elem.innerText?.substring(0, 50)}..." ${parentInfo ? `(contained in ${parentInfo.tagName})` : ''}`);
    }
    return !isDuplicate;
  });
  
  window.TransCraftDebug.debugLog(`📊 Final result: ${uniqueElements.length} translatable elements (filtered from ${elements.length} candidates)`);
  
  // 記錄元素類型分解
  const elementTypes = {};
  uniqueElements.forEach(elem => {
    elementTypes[elem.tagName] = (elementTypes[elem.tagName] || 0) + 1;
  });
  window.TransCraftDebug.debugLog(`📝 Element types found:`, elementTypes);
  
  // 記錄將被翻譯的前幾個元素
  uniqueElements.slice(0, 3).forEach((elem, idx) => {
    const text = elem.innerText?.trim();
    window.TransCraftDebug.debugLog(`${idx + 1}. ${elem.tagName}: "${text?.substring(0, 100)}${text?.length > 100 ? '...' : ''}" (${text?.length} chars)`);
  });
  
  return uniqueElements;
}

// 使用背景腳本翻譯文字
async function translateText(text, apiConfig, timeoutMs = 60000) {
  try {
    // 確保擴充功能內容仍然有效
    if (!chrome.runtime?.id) {
      throw new Error('EXTENSION_CONTEXT_INVALID');
    }

    window.TransCraftDebug.debugLog('Sending translation request:', {
      textLength: text.length,
      api: apiConfig.selectedApi,
      model: apiConfig.selectedModel,
      timeout: timeoutMs
    });

    return new Promise((resolve, reject) => {
      let isResolved = false;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          const timeoutError = new Error(`TIMEOUT_ERROR: Translation request timed out after ${timeoutMs/1000} seconds`);
          window.TransCraftDebug.debugError('Translation timeout:', timeoutError);
          reject(timeoutError);
        }
      }, timeoutMs);

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        targetLanguage: apiConfig.targetLanguage,
        apiConfig: apiConfig
      }, (response) => {
        clearTimeout(timeoutId);
        
        if (!isResolved) {
          isResolved = true;
          
          if (chrome.runtime.lastError) {
            window.TransCraftDebug.debugError('Chrome runtime error:', chrome.runtime.lastError);
            if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
              reject(new Error('EXTENSION_CONTEXT_INVALID'));
            } else {
              reject(new Error('Translation failed: ' + chrome.runtime.lastError.message));
            }
            return;
          }
          
          if (!response) {
            reject(new Error('No response from background script'));
            return;
          }
          
          // Debug: Log the actual response structure
          window.TransCraftDebug.debugLog('Raw response received:', response);
          window.TransCraftDebug.debugLog('Translation request sent with targetLanguage:', apiConfig.targetLanguage);
          
          if (response.error) {
            window.TransCraftDebug.debugError('API error response:', response.error);
            
            // Handle specific error types
            if (response.error.includes('quota') || response.error.includes('limit exceeded')) {
              reject(new Error('QUOTA_EXCEEDED'));
            } else if (response.error.includes('API key') || response.error.includes('401') || response.error.includes('403')) {
              reject(new Error('API_KEY_ERROR'));
            } else if (response.error.includes('network') || response.error.includes('Failed to fetch')) {
              reject(new Error('NETWORK_ERROR'));
            } else {
              reject(new Error(response.error));
            }
          } else if (response.translatedText || response.translation) {
            const translatedText = response.translatedText || response.translation;
            window.TransCraftDebug.debugLog('Translation successful:', {
              originalLength: text.length,
              translatedLength: translatedText.length
            });
            resolve(translatedText);
          } else {
            window.TransCraftDebug.debugError('Invalid response format. Expected {error}, {translatedText}, or {translation}, got:', response);
            reject(new Error('Invalid response format'));
          }
        }
      });
    });
  } catch (error) {
    window.TransCraftDebug.debugError('Translation error:', error);
    throw error;
  }
}

// Add loading placeholder to element
function addLoadingPlaceholder(element) {
  // Check if translation block already exists
  if (element.querySelector(':scope > .ai-translation-block')) {
    return null;
  }
  
  // Create loading block
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'ai-translation-block loading';
  loadingDiv.innerHTML = '<span class="ai-translation-loading-text">翻譯中 <span class="loading-spinner"></span></span>';
  
  // Add unique identifier
  const elementId = `translation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  loadingDiv.dataset.elementId = elementId;
  
  element.appendChild(loadingDiv);
  return elementId;
}

// Update placeholder with translation
function updatePlaceholderWithTranslation(elementId, translationText) {
  const placeholders = document.querySelectorAll(`.ai-translation-block[data-element-id="${elementId}"]`);
  placeholders.forEach(placeholder => {
    placeholder.classList.remove('loading');
    placeholder.innerHTML = translationText;
  });
}

// Remove loading placeholder
function removeLoadingPlaceholder(elementId) {
  const placeholders = document.querySelectorAll(`.ai-translation-block[data-element-id="${elementId}"]`);
  placeholders.forEach(placeholder => {
    placeholder.remove();
  });
}

// Add translation to element
function addTranslationToElement(element, translationText) {
  // Special handling for INPUT elements (they cannot contain child elements)
  if (element.tagName === 'INPUT') {
    // Store original value
    if (!element.hasAttribute('data-original-value')) {
      element.setAttribute('data-original-value', element.value);
    }
    
    // Check if translation already exists
    const existingTranslation = element.parentNode?.querySelector('.ai-translation-input-block[data-input-id="' + (element.id || element.name) + '"]');
    if (existingTranslation) {
      existingTranslation.innerHTML = translationText;
    } else {
      // Create translation div next to the input
      const translationDiv = document.createElement('div');
      translationDiv.className = 'ai-translation-block ai-translation-input-block';
      translationDiv.setAttribute('data-input-id', element.id || element.name || '');
      translationDiv.innerHTML = translationText;
      
      // Insert after the input element
      element.parentNode.insertBefore(translationDiv, element.nextSibling);
      
      // Store mapping for cleanup
      window.TransCraftState.translationElements.set(translationDiv, element);
    }
    return;
  }
  
  // Special handling for OPTION elements (they cannot contain child elements)
  if (element.tagName === 'OPTION') {
    // Store original text
    if (!element.hasAttribute('data-original-text')) {
      element.setAttribute('data-original-text', element.textContent);
    }
    
    // Create translation as title attribute or replace text content
    const originalText = element.textContent;
    element.textContent = `${originalText} (${translationText})`;
    
    // Store mapping for cleanup
    window.TransCraftState.translationElements.set(element, element);
    return;
  }
  
  // Regular handling for other elements
  // Check if translation already exists
  const existingTranslation = element.querySelector(':scope > .ai-translation-block:not(.loading)');
  if (existingTranslation) {
    existingTranslation.innerHTML = translationText;
  } else {
    // Create new translation div
    const translationDiv = document.createElement('div');
    translationDiv.className = 'ai-translation-block';
    
    // Add specific styling based on element type
    if (element.tagName.match(/^H[1-6]$/)) {
      translationDiv.classList.add('ai-translation-heading');
    } else if (element.tagName === 'LI') {
      translationDiv.classList.add('ai-translation-list-item');
    } else if (element.tagName.match(/^(TD|TH)$/)) {
      translationDiv.classList.add('ai-translation-table-cell');
    }
    
    translationDiv.innerHTML = translationText;
    element.appendChild(translationDiv);
    
    // Store mapping for cleanup
    window.TransCraftState.translationElements.set(translationDiv, element);
  }
}

// Restore original text by removing all translations
function restoreOriginalText() {
  try {
    // Method 1: Use translationElements Map to remove
    window.TransCraftState.translationElements.forEach((parentElement, translationDiv) => {
      if (translationDiv && translationDiv.parentNode) {
        translationDiv.remove();
      }
    });
    window.TransCraftState.translationElements.clear();
    
    // Method 2: Find and remove all translation blocks on the page (as backup)
    const remainingTranslations = document.querySelectorAll('.ai-translation-block');
    remainingTranslations.forEach(elem => {
      try {
        elem.remove();
      } catch (error) {
        console.warn('Failed to remove translation element:', error);
      }
    });
    
    // Method 3: Restore original values for INPUT elements
    const inputsWithOriginalValues = document.querySelectorAll('input[data-original-value]');
    inputsWithOriginalValues.forEach(input => {
      try {
        input.value = input.getAttribute('data-original-value');
        input.removeAttribute('data-original-value');
      } catch (error) {
        console.warn('Failed to restore input value:', error);
      }
    });
    
    // Method 4: Restore original text for OPTION elements
    const optionsWithOriginalText = document.querySelectorAll('option[data-original-text]');
    optionsWithOriginalText.forEach(option => {
      try {
        option.textContent = option.getAttribute('data-original-text');
        option.removeAttribute('data-original-text');
      } catch (error) {
        console.warn('Failed to restore option text:', error);
      }
    });
    
    // Reset state
    window.TransCraftState.isTranslated = false;
    
    console.log(`Removed all translations. Remaining elements: ${document.querySelectorAll('.ai-translation-block').length}`);
    
    // Hide detected language when restoring
    if (window.TransCraftFloatingButton && window.TransCraftFloatingButton.displayDetectedLanguage) {
      window.TransCraftFloatingButton.displayDetectedLanguage(null);
    }
    
  } catch (error) {
    console.error('Error during translation restoration:', error);
  }
}

// Update loading progress
function updateLoadingProgress(percentage) {
  if (window.TransCraftFloatingButton && window.TransCraftFloatingButton.updateFloatingButtonProgress) {
    window.TransCraftFloatingButton.updateFloatingButtonProgress(percentage);
  }
}

// Export functions to global scope
window.TransCraftTranslationAPI = {
  getTranslatableElements,
  translateText,
  addLoadingPlaceholder,
  updatePlaceholderWithTranslation,
  removeLoadingPlaceholder,
  addTranslationToElement,
  restoreOriginalText,
  updateLoadingProgress
};