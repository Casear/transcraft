// Translation Module
// Handles the main translation process and coordination

// Access functions from global scope directly

// Main translation function
async function translatePage(forceTranslation = false) {
  if (window.TransCraftState.isTranslating) return;
  
  // Close language menu if open
  const languageMenu = document.getElementById('ai-translation-language-menu');
  if (languageMenu && languageMenu.classList.contains('show')) {
    window.TransCraftFloatingButton.closeLanguageMenu();
  }
  
  if (window.TransCraftState.isTranslated) {
    window.TransCraftTranslationAPI.restoreOriginalText();
    window.TransCraftFloatingButton.updateFloatingButton('ready');
    return;
  }

  const elements = window.TransCraftTranslationAPI.getTranslatableElements();
  const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel', 'enableLanguageDetection']);
  
  // Add current target language from state
  apiConfig.targetLanguage = window.TransCraftState.targetLanguage;
  
  window.TransCraftDebug.debugLog('Translation request with target language:', apiConfig.targetLanguage);
  
  if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
    alert('請先在擴充功能設定中配置 API Key');
    return;
  }

  // Language detection before translation
  let skipCount = 0;
  if (apiConfig.enableLanguageDetection !== false && !forceTranslation) { // Enabled by default and not force translation
    window.TransCraftDebug.debugLog('Language detection enabled, checking content...');
    
    // Enhanced sampling strategy for better language detection
    window.TransCraftDebug.debugLog('📊 Starting text sampling for language detection...');
    const sampleTexts = [];
    const maxSamples = 10;
    const minTextLength = 20;
    
    window.TransCraftDebug.debugLog(`🔍 Analyzing ${elements.length} translatable elements for sampling`);
    
    // Take diverse samples from different parts of the page
    for (let i = 0; i < Math.min(elements.length, maxSamples); i++) {
      const index = Math.floor((elements.length / maxSamples) * i);
      const text = elements[index]?.textContent?.trim();
      if (text && text.length > minTextLength) {
        sampleTexts.push(text);
        window.TransCraftDebug.debugLog(`📝 Sample ${i + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)`);
      } else {
        window.TransCraftDebug.debugLog(`❌ Sample ${i + 1}: Skipped - too short or empty (${text?.length || 0} chars)`);
      }
    }
    
    window.TransCraftDebug.debugLog(`✅ Collected ${sampleTexts.length} valid samples out of ${Math.min(elements.length, maxSamples)} attempts`);
    
    if (sampleTexts.length > 0) {
      // Take more text for better detection, but limit total size
      const combinedText = sampleTexts.join(' ');
      const settings = await chrome.storage.sync.get(['languageDetectionChars']);
      const detectionChars = settings.languageDetectionChars || 600;
      const sampleText = combinedText.substring(0, detectionChars);
      
      window.TransCraftDebug.debugLog(`🔤 Combined sample text: ${combinedText.length} chars → trimmed to ${sampleText.length} chars`);
      window.TransCraftDebug.debugLog(`📋 Final sample for detection: "${sampleText.substring(0, 100)}${sampleText.length > 100 ? '...' : ''}"`);
      
      const detectedLanguage = await window.TransCraftLanguageDetection.detectLanguage(sampleText);
      
      window.TransCraftDebug.debugLog('Detected language:', detectedLanguage, 'Target language:', window.TransCraftState.targetLanguage);
      
      // Display detected language
      window.TransCraftFloatingButton.displayDetectedLanguage(detectedLanguage);
      
      if (detectedLanguage && !window.TransCraftLanguageDetection.shouldTranslate(detectedLanguage, window.TransCraftState.targetLanguage)) {
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
        const targetLangName = langNames[window.TransCraftState.targetLanguage] || window.TransCraftState.targetLanguage;
        
        window.TransCraftModal.showSameLanguageModal(sourceLangName, targetLangName, detectedLanguage, () => {
          // Force translation callback
          translatePage(true);
        });
        return;
      }
    }
  }

  window.TransCraftState.isTranslating = true;
  window.TransCraftFloatingButton.updateFloatingButton('translating');

  // Get batch settings
  const batchSettings = await chrome.storage.sync.get(['maxBatchLength', 'maxBatchElements', 'requestTimeout']);
  const maxBatchLength = batchSettings.maxBatchLength || 8000; // Default max 8000 chars
  const maxBatchElements = batchSettings.maxBatchElements || 20; // Default max 20 elements
  const requestTimeout = (batchSettings.requestTimeout || 60) * 1000; // Convert to milliseconds, default 60 seconds
  
  // First extract original text content before adding placeholders
  const originalTexts = elements.map(element => element.textContent?.trim()).filter(text => text);
  
  // Debug: Log details about found elements
  window.TransCraftDebug.debugLog(`🔍 TRANSLATION PROCESSING: ${elements.length} elements found, ${originalTexts.length} have text`);
  
  // Then add loading placeholders for all elements
  const elementIdMap = new Map(); // Store element and ID mapping
  let placeholderIds = [];
  elements.forEach((element) => {
    const elementId = window.TransCraftTranslationAPI.addLoadingPlaceholder(element);
    if (elementId) {
      elementIdMap.set(elementId, element);
      placeholderIds.push(elementId);
    }
  });

  // Process in batches
  const errors = [];
  let processedElements = 0;
  let successCount = 0;
  
  while (processedElements < originalTexts.length) {
    const batchTexts = [];
    const batchElementIds = [];
    let batchLength = 0;
    let batchProcessedCount = 0;
    
    // Build batch within limits
    for (let i = processedElements; i < originalTexts.length && batchTexts.length < maxBatchElements; i++) {
      const element = elements[i];
      const text = originalTexts[i];
      const elementId = placeholderIds[i];
      
      batchProcessedCount++;
      
      if (text && (batchLength + text.length <= maxBatchLength || batchTexts.length === 0)) {
        // Add to batch if within size limit, or if first element (to avoid infinite loop)
        batchTexts.push(text);
        batchElementIds.push(elementId);
        batchLength += text.length;
        
        window.TransCraftDebug.debugLog(`Added element ${i + 1}/${originalTexts.length} to batch (${text.length} chars, batch total: ${batchLength})`);
      } else {
        // Stop adding to this batch
        batchProcessedCount--; // Don't count this element as processed yet
        break;
      }
    }
    
    if (batchTexts.length > 0) {
      const combinedText = batchTexts.join('\n<<TRANSLATE_SEPARATOR>>\n');
      
      try {
        window.TransCraftDebug.debugLog(`Processing batch: ${batchTexts.length} elements, ${batchLength} characters`);
        window.TransCraftDebug.debugLog(`Batch content preview: "${combinedText.substring(0, 200)}${combinedText.length > 200 ? '...' : ''}"`);
        
        
        const translatedText = await window.TransCraftTranslationAPI.translateText(combinedText, apiConfig, requestTimeout);
        
        // Split the translations
        const translations = translatedText.split(/\n?<<TRANSLATE_SEPARATOR>>\n?/).filter(t => t.trim());
        
        window.TransCraftDebug.debugLog(`Received ${translations.length} translations for ${batchTexts.length} elements`);
        
        // Apply translations to elements
        translations.forEach((translation, index) => {
          if (index < batchElementIds.length) {
            const elementId = batchElementIds[index];
            const element = elementIdMap.get(elementId);
            
            
            // Update placeholder first
            window.TransCraftTranslationAPI.updatePlaceholderWithTranslation(elementId, translation);
            
            // Then add to element tracking
            if (element) {
              window.TransCraftTranslationAPI.addTranslationToElement(element, translation);
            }
            successCount++;
            window.TransCraftDebug.debugLog(`Applied translation ${index + 1}/${translations.length}: "${translation.substring(0, 100)}${translation.length > 100 ? '...' : ''}"`);
          }
        });
        
      } catch (error) {
        window.TransCraftDebug.debugError('Translation error:', error);
        const errorMsg = error.message || error.toString();
        
        // Remove loading placeholders for failed elements
        batchElementIds.forEach(elementId => {
          window.TransCraftTranslationAPI.removeLoadingPlaceholder(elementId);
        });
        
        // Track errors
        batchTexts.forEach((text, index) => {
          if (index < batchElementIds.length) {
            const element = elementIdMap.get(batchElementIds[index]);
            if (element) {
              errors.push({
                type: errorMsg.includes('QUOTA_EXCEEDED') ? 'QUOTA_EXCEEDED' :
                      errorMsg.includes('NETWORK_ERROR') ? 'NETWORK_ERROR' :
                      errorMsg.includes('API_KEY_ERROR') ? 'API_KEY_ERROR' :
                      errorMsg.includes('EXTENSION_CONTEXT_INVALID') ? 'EXTENSION_CONTEXT_INVALID' : 'UNKNOWN',
                element: element
              });
            }
          }
        });
        
        // If this is the first batch and it failed, show specific error
        if (errors.length === batchTexts.length && successCount === 0) {
          window.TransCraftState.isTranslating = false;
          
          if (errorMsg.includes('No endpoints found matching your data policy')) {
            window.TransCraftModal.showErrorModal('OpenRouter 數據政策限制', '請到 OpenRouter 隱私設定頁面啟用「Allow training on prompts」選項。<br><a href="https://openrouter.ai/settings/privacy" target="_blank">點此前往設定</a>');
          } else if (errorMsg.includes('No endpoints found')) {
            window.TransCraftModal.showErrorModal('OpenRouter 模型不可用', '請檢查您的隱私設定或選擇其他模型。<br><a href="https://openrouter.ai/settings/privacy" target="_blank">隱私設定</a>');
          } else if (errorMsg === 'API_KEY_ERROR') {
            window.TransCraftModal.showErrorModal('API Key 錯誤', '請檢查您的 API Key 設定是否正確。');
          } else if (errorMsg === 'EXTENSION_CONTEXT_INVALID') {
            window.TransCraftModal.showErrorModal('擴充功能已更新', '請重新整理頁面後再試。');
          }
          
          window.TransCraftFloatingButton.updateFloatingButton('ready');
          return;
        }
        
        // Continue with next batch even if this one failed
        window.TransCraftDebug.debugLog(`Batch failed, continuing with next batch. Current success: ${successCount}, errors: ${errors.length}`);
      }
    } else if (batchProcessedCount > 0) {
      // If no valid text but checked some elements, still need to advance progress to avoid infinite loop
      window.TransCraftDebug.debugLog(`Skipped ${batchProcessedCount} empty or invalid elements`)
    } else {
      // If no elements were processed, might be logic error, force exit to avoid infinite loop
      console.warn('No elements processed in batch, forcing exit to avoid infinite loop');
      break;
    }
    
    // Update processedElements, ensure correct tracking of processed element count
    processedElements += batchProcessedCount;
    
    // Update progress
    const progress = Math.min(100, (processedElements / originalTexts.length) * 100);
    window.TransCraftTranslationAPI.updateLoadingProgress(progress);
  }

  window.TransCraftState.isTranslated = true;
  window.TransCraftState.isTranslating = false;
  window.TransCraftFloatingButton.updateFloatingButton('translated');
  window.TransCraftState.autoTranslateCompleted = true;

  // Show results
  if (errors.length > 0) {
    window.TransCraftModal.showTranslationErrorSummary(errors, successCount, originalTexts.length);
  } else if (successCount < originalTexts.length) {
    // If no specific errors but some failures, show general message
    const failedCount = originalTexts.length - successCount;
    window.TransCraftModal.showErrorModal(
      window.TransCraftDebug.getLocalizedMessage('translation_failed', '部分內容未翻譯'), 
      window.TransCraftDebug.getLocalizedMessage('translation_partial_error', `成功翻譯 ${successCount} 個元素，${failedCount} 個元素翻譯失敗。<br>可能是因為網路問題或 API 限制。`).replace('$1', successCount).replace('$2', failedCount), 
      4000);
  }
}

// Export functions to global scope
window.TransCraftTranslation = {
  translatePage
};