// Translation API Module
// Handles translation text processing and communication with background script

// Access functions from global scope directly

// Get translatable elements from the page
function getTranslatableElements() {
  // Take all content elements that might contain translatable text
  const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'CAPTION'];
  const elements = [];
  const excludedElements = [];
  
  blockTags.forEach(tag => {
    const elems = document.getElementsByTagName(tag);
    window.TransCraftDebug.debugLog(`Checking ${elems.length} ${tag} elements`);
    
    for (let elem of elems) {
      // Check if element has text content and hasn't been translated
      const text = elem.innerText?.trim();
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
      
      if (elem.querySelector('.ai-translation-block') || 
          elem.closest('.ai-translation-block') ||
          elem.classList.contains('ai-translation-block')) {
        excludedElements.push({...elemInfo, reason: 'Already has translation'});
        continue;
      }
        
      // Exclude navigation, ads, scripts, UI elements, and other common non-content elements
      const classList = elem.className.toLowerCase();
      const elementId = elem.id.toLowerCase();
      
      // Check if element is inside a button or form control (be more specific)
      const isUIElement = elem.closest('button, input, select, textarea, form, [role="button"]') ||
                         (elem.closest('[aria-label]') && elem.closest('button, [role="button"], input, select'));
      
      if (isUIElement) {
        excludedElements.push({...elemInfo, reason: 'UI element (button/form/control)'});
        continue;
      }
      
      // Stricter filtering conditions for classes and IDs
      if (classList.includes('nav') || classList.includes('menu') || 
          classList.includes('ad') || classList.includes('banner') ||
          classList.includes('script') || classList.includes('style') ||
          classList.includes('hidden') || classList.includes('invisible') ||
          classList.includes('button') || classList.includes('btn') ||
          classList.includes('control') || classList.includes('widget') ||
          elementId.includes('nav') || elementId.includes('menu') ||
          elementId.includes('ad') || elementId.includes('banner') ||
          elementId.includes('script') || elementId.includes('style') ||
          elementId.includes('button') || elementId.includes('btn')) {
        excludedElements.push({...elemInfo, reason: 'Excluded by class/id filters'});
        continue;
      }
        
      // Check if within script or style tags
      const parentScript = elem.closest('script, style, noscript');
      if (parentScript) {
        excludedElements.push({...elemInfo, reason: 'Inside script/style tag'});
        continue;
      }
      
      // Exclude translation extension's own UI elements
      const isTranslationUI = elem.closest('#ai-translation-floating-container') ||
                             elem.closest('#ai-translation-language-menu') ||
                             elem.closest('#ai-translation-error-modal');
      if (isTranslationUI) {
        excludedElements.push({...elemInfo, reason: 'Translation UI element'});
        continue;
      }
      
      elements.push(elem);
      window.TransCraftDebug.debugLog(`✅ Added element: ${elem.tagName} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)`);
    }
  });
  
  // Log excluded elements for debugging
  if (excludedElements.length > 0) {
    window.TransCraftDebug.debugLog(`🚫 Excluded ${excludedElements.length} elements:`);
    excludedElements.slice(0, 5).forEach(elem => {
      window.TransCraftDebug.debugLog(`   - ${elem.tag}: "${elem.text}" (${elem.reason})`);
    });
    if (excludedElements.length > 5) {
      window.TransCraftDebug.debugLog(`   ... and ${excludedElements.length - 5} more`);
    }
  }
  
  // Remove duplicate elements (more conservative approach)
  const uniqueElements = elements.filter((elem, index) => {
    // Only remove if it's exactly the same element or if a parent element has the exact same text
    const isDuplicate = elements.slice(0, index).some(otherElem => {
      if (otherElem === elem) return true;
      
      // Only consider it duplicate if the text content is identical and one contains the other
      const thisText = elem.innerText?.trim();
      const otherText = otherElem.innerText?.trim();
      
      return thisText === otherText && thisText && 
             (otherElem.contains(elem) || elem.contains(otherElem));
    });
    
    if (isDuplicate) {
      window.TransCraftDebug.debugLog(`🔄 Removed duplicate: ${elem.tagName} "${elem.innerText?.substring(0, 50)}..."`);
    }
    return !isDuplicate;
  });
  
  window.TransCraftDebug.debugLog(`📊 Final result: ${uniqueElements.length} translatable elements (filtered from ${elements.length} candidates)`);
  
  // Log element types breakdown
  const elementTypes = {};
  uniqueElements.forEach(elem => {
    elementTypes[elem.tagName] = (elementTypes[elem.tagName] || 0) + 1;
  });
  window.TransCraftDebug.debugLog(`📝 Element types found:`, elementTypes);
  
  // Log first few elements that will be translated
  uniqueElements.slice(0, 3).forEach((elem, idx) => {
    const text = elem.innerText?.trim();
    window.TransCraftDebug.debugLog(`${idx + 1}. ${elem.tagName}: "${text?.substring(0, 100)}${text?.length > 100 ? '...' : ''}" (${text?.length} chars)`);
  });
  
  return uniqueElements;
}

// Translate text using background script
async function translateText(text, apiConfig, timeoutMs = 60000) {
  try {
    // Ensure extension context is still valid
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