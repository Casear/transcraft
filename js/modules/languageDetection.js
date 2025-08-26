// Language Detection Module
// Handles comprehensive language detection using multiple methods

// Access functions from global scope directly

function detectLanguageByCharacteristics(text) {
  window.TransCraftDebug.debugLog('🔍 Starting character-based language detection');
  window.TransCraftDebug.debugLog('📝 Sample text (first 200 chars):', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
  
  // Clean text for better detection
  const cleanText = text.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  window.TransCraftDebug.debugLog('🧹 Cleaned text length:', cleanText.length, 'characters');
  
  if (cleanText.length < 10) {
    window.TransCraftDebug.debugLog('❌ Text too short for reliable detection (<10 chars)');
    return null;
  }
  
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
  
  window.TransCraftDebug.debugLog('📊 Character analysis:', {
    totalChars,
    chinese: `${chineseCount} (${(chineseCount/totalChars*100).toFixed(1)}%)`,
    japaneseKana: `${japaneseCount} (${(japaneseCount/totalChars*100).toFixed(1)}%)`,
    korean: `${koreanCount} (${(koreanCount/totalChars*100).toFixed(1)}%)`,
    arabic: `${arabicCount} (${(arabicCount/totalChars*100).toFixed(1)}%)`,
    thai: `${thaiCount} (${(thaiCount/totalChars*100).toFixed(1)}%)`,
    russian: `${russianCount} (${(russianCount/totalChars*100).toFixed(1)}%)`
  });
  
  // If significant portion is Chinese characters
  if (chineseCount / totalChars > 0.2) { // Lower threshold for mixed content
    window.TransCraftDebug.debugLog('🈶 Chinese detected (>20%), analyzing Traditional vs Simplified...');
    
    // Enhanced Traditional/Simplified Chinese detection
    const traditionalIndicators = /[繁體複雜學習開關們這樣時間問題說話語言國家經濟發展變化]/g;
    const simplifiedIndicators = /[简体复杂学习开关们这样时间问题说话语言国家经济发展变化]/g;
    
    // Check for traditional-only and simplified-only characters
    const traditionalOnlyChars = /[繁體複雜學習開關]/g;
    const simplifiedOnlyChars = /[简体复杂学习开关]/g;
    
    const traditionalMatch = text.match(traditionalIndicators) || [];
    const simplifiedMatch = text.match(simplifiedIndicators) || [];
    const traditionalOnlyCount = (text.match(traditionalOnlyChars) || []).length;
    const simplifiedOnlyCount = (text.match(simplifiedOnlyChars) || []).length;
    
    const traditionalCount = traditionalMatch.length;
    const simplifiedCount = simplifiedMatch.length;
    
    window.TransCraftDebug.debugLog('🔤 Chinese variant analysis:', {
      traditionalCount,
      simplifiedCount,
      traditionalOnlyCount,
      simplifiedOnlyCount,
      traditionalExamples: traditionalMatch.slice(0, 3),
      simplifiedExamples: simplifiedMatch.slice(0, 3)
    });
    
    // Strong indicators for simplified
    if (simplifiedOnlyCount > 0 || (simplifiedCount > traditionalCount * 1.5)) {
      window.TransCraftDebug.debugLog('✅ Detected as zh-CN (Simplified Chinese) - Strong simplified indicators');
      return 'zh-CN';
    }
    // Strong indicators for traditional
    else if (traditionalOnlyCount > 0 || (traditionalCount > simplifiedCount * 1.5)) {
      window.TransCraftDebug.debugLog('✅ Detected as zh-TW (Traditional Chinese) - Strong traditional indicators');
      return 'zh-TW';
    }
    
    // Check HTML lang attribute or URL patterns as additional context
    const htmlLang = document.documentElement.lang?.toLowerCase() || '';
    const hostname = window.location.hostname.toLowerCase();
    const isTraditionalContext = htmlLang.includes('tw') || htmlLang.includes('hk') || 
                                hostname.includes('.tw') || hostname.includes('.hk');
    const isSimplifiedContext = htmlLang.includes('cn') || hostname.includes('.cn');
    
    window.TransCraftDebug.debugLog('🌐 Context analysis:', {
      htmlLang,
      hostname,
      isTraditionalContext,
      isSimplifiedContext
    });
    
    if (isSimplifiedContext) {
      window.TransCraftDebug.debugLog('✅ Detected as zh-CN (Simplified Chinese) - Context indicators (.cn domain or lang=zh-cn)');
      return 'zh-CN';
    }
    if (isTraditionalContext) {
      window.TransCraftDebug.debugLog('✅ Detected as zh-TW (Traditional Chinese) - Context indicators (.tw/.hk domain or lang=zh-tw)');
      return 'zh-TW';
    }
    
    // Default based on common patterns
    const result = traditionalCount >= simplifiedCount ? 'zh-TW' : 'zh-CN';
    window.TransCraftDebug.debugLog(`✅ Detected as ${result} - Based on character frequency (traditional:${traditionalCount} vs simplified:${simplifiedCount})`);
    return result;
  }
  
  // Japanese detection - prioritize kana presence over percentage
  if (japaneseCount > 0) {
    window.TransCraftDebug.debugLog('🈷️ Japanese kana characters found, checking threshold...');
    // If there are Japanese kana characters, it's likely Japanese
    // even with a lower percentage due to kanji overlap with Chinese
    if (japaneseCount / totalChars > 0.05 || japaneseCount > 10) {
      window.TransCraftDebug.debugLog(`✅ Detected as ja (Japanese) - Kana chars: ${japaneseCount} (${(japaneseCount/totalChars*100).toFixed(1)}%) or >10 absolute count`);
      return 'ja';
    }
  }
  
  // Korean detection
  if (koreanCount / totalChars > 0.3) {
    window.TransCraftDebug.debugLog(`✅ Detected as ko (Korean) - ${(koreanCount/totalChars*100).toFixed(1)}% Korean characters`);
    return 'ko';
  }
  
  // Thai detection
  if (thaiCount / totalChars > 0.3) {
    window.TransCraftDebug.debugLog(`✅ Detected as th (Thai) - ${(thaiCount/totalChars*100).toFixed(1)}% Thai characters`);
    return 'th';
  }
  
  // Arabic detection
  if (arabicCount / totalChars > 0.3) {
    window.TransCraftDebug.debugLog(`✅ Detected as ar (Arabic) - ${(arabicCount/totalChars*100).toFixed(1)}% Arabic characters`);
    return 'ar';
  }
  
  // Russian detection
  if (russianCount / totalChars > 0.3) {
    window.TransCraftDebug.debugLog(`✅ Detected as ru (Russian) - ${(russianCount/totalChars*100).toFixed(1)}% Cyrillic characters`);
    return 'ru';
  }
  
  // Check for Latin-based languages (after Asian language detection)
  const latinRegex = /[a-zA-Z]/g;
  const latinCount = (cleanText.match(latinRegex) || []).length;
  
  if (latinCount / totalChars > 0.7) {
    window.TransCraftDebug.debugLog(`🔤 Latin alphabet detected (${(latinCount/totalChars*100).toFixed(1)}%), analyzing patterns...`);
    
    // Enhanced language detection based on common words
    const wordPatterns = {
      en: /\b(the|is|are|was|were|have|has|been|being|and|or|but|in|on|at|to|for|of|with|from|about|that|this|these|those|what|where|when|why|how)\b/gi,
      es: /\b(el|la|los|las|de|del|y|que|es|en|un|una|por|para|con|sin|sobre|pero|más|muy|todo|todos|esta|este|estos|estas)\b/gi,
      fr: /\b(le|la|les|de|du|des|et|que|est|dans|un|une|pour|avec|sans|sur|mais|plus|très|tout|tous|cette|cet|ces)\b/gi,
      de: /\b(der|die|das|den|dem|des|und|ist|sind|war|waren|haben|hat|hatte|in|auf|an|zu|für|von|mit|aus|bei|nach)\b/gi,
      it: /\b(il|lo|la|i|gli|le|di|del|della|e|che|è|sono|in|un|uno|una|per|con|senza|su|ma|più|molto|tutto|tutti)\b/gi,
      pt: /\b(o|a|os|as|de|do|da|dos|das|e|que|é|são|em|um|uma|para|por|com|sem|sobre|mas|mais|muito|todo|todos)\b/gi
    };
    
    const matches = {};
    for (const [lang, pattern] of Object.entries(wordPatterns)) {
      matches[lang] = (text.toLowerCase().match(pattern) || []).length;
    }
    
    window.TransCraftDebug.debugLog('🗣️ Language word pattern matches:', matches);
    
    // Find the language with most matches
    let detectedLang = 'en';
    let maxMatches = matches.en || 0;
    
    for (const [lang, count] of Object.entries(matches)) {
      if (count > maxMatches) {
        maxMatches = count;
        detectedLang = lang;
      }
    }
    
    // Require at least 3 word matches for confidence
    if (maxMatches >= 3) {
      window.TransCraftDebug.debugLog(`✅ Detected as ${detectedLang} - Based on ${maxMatches} common word matches`);
      return detectedLang;
    }
    
    // Default to English for Latin text with insufficient patterns
    window.TransCraftDebug.debugLog('✅ Detected as en (English) - Default for Latin text with insufficient specific patterns');
    return 'en';
  }
  
  window.TransCraftDebug.debugLog('❌ No language detected - insufficient pattern matches');
  return null;
}

async function detectLanguageWithBrowser(text) {
  window.TransCraftDebug.debugLog('🌐 Attempting browser-based language detection...');
  window.TransCraftDebug.debugLog('📝 Browser detection sample (first 100 chars):', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  
  // Try browser's built-in language detection if available
  if ('detectLanguage' in chrome.i18n) {
    try {
      const detectedLang = await chrome.i18n.detectLanguage(text);
      window.TransCraftDebug.debugLog('🔍 Browser detection raw result:', detectedLang);
      
      if (detectedLang && detectedLang.languages && detectedLang.languages.length > 0) {
        window.TransCraftDebug.debugLog('📋 All detected languages:', detectedLang.languages.map(lang => 
          `${lang.language}: ${lang.percentage}%`
        ));
        
        const mostLikely = detectedLang.languages[0];
        if (mostLikely.percentage > 70) { // Only trust high confidence results
          window.TransCraftDebug.debugLog(`✅ Browser detected ${mostLikely.language} with ${mostLikely.percentage}% confidence (>70% threshold)`);
          return mostLikely.language;
        } else {
          window.TransCraftDebug.debugLog(`❌ Browser detection confidence too low: ${mostLikely.language} at ${mostLikely.percentage}% (need >70%)`);
        }
      } else {
        window.TransCraftDebug.debugLog('❌ Browser detection returned no results');
      }
    } catch (error) {
      window.TransCraftDebug.debugLog('❌ Browser language detection failed:', error);
    }
  } else {
    window.TransCraftDebug.debugLog('❌ Browser language detection API not available');
  }
  
  window.TransCraftDebug.debugLog('🔄 Falling back to character-based detection...');
  return null;
}

async function detectLanguage(text) {
  window.TransCraftDebug.debugLog('🚀 Starting comprehensive language detection process');
  window.TransCraftDebug.debugLog('📏 Input text length:', text.length, 'characters');
  
  // First try browser detection
  const browserDetection = await detectLanguageWithBrowser(text);
  if (browserDetection) {
    // If browser detected generic 'zh', use character analysis to determine variant
    if (browserDetection === 'zh') {
      window.TransCraftDebug.debugLog('🔍 Browser detected generic Chinese, analyzing variant...');
      const characterDetection = detectLanguageByCharacteristics(text);
      if (characterDetection && characterDetection.startsWith('zh-')) {
        window.TransCraftDebug.debugLog(`🎯 Final result: ${characterDetection} (Browser + Character analysis)`);
        return characterDetection;
      }
    }
    window.TransCraftDebug.debugLog(`🎯 Final result: ${browserDetection} (Browser detection)`);
    return browserDetection;
  }
  
  // Fallback to character-based detection
  const characterDetection = detectLanguageByCharacteristics(text);
  if (characterDetection) {
    window.TransCraftDebug.debugLog(`🎯 Final result: ${characterDetection} (Character-based detection)`);
  } else {
    window.TransCraftDebug.debugLog('🎯 Final result: null (No language detected)');
  }
  
  return characterDetection;
}

function shouldTranslate(sourceLanguage, targetLanguage) {
  if (!sourceLanguage || !targetLanguage) {
    window.TransCraftDebug.debugLog('Language detection uncertain, proceeding with translation');
    return true; // Proceed if uncertain
  }
  
  // Normalize language codes with enhanced Chinese handling
  const normalizeLanguage = (lang) => {
    if (lang.startsWith('zh')) {
      return lang; // Keep Chinese variants separate (zh-TW ≠ zh-CN)
    }
    return lang.split('-')[0]; // Remove region codes for other languages (en-US → en)
  };
  
  const normalizedSource = normalizeLanguage(sourceLanguage);
  const normalizedTarget = normalizeLanguage(targetLanguage);
  
  const shouldTranslateResult = normalizedSource !== normalizedTarget;
  
  window.TransCraftDebug.debugLog(`Translation decision: ${sourceLanguage} → ${targetLanguage}`, {
    normalizedSource,
    normalizedTarget,
    shouldTranslate: shouldTranslateResult
  });
  
  return shouldTranslateResult;
}

// Export functions to global scope
window.TransCraftLanguageDetection = {
  detectLanguageByCharacteristics,
  detectLanguageWithBrowser,
  detectLanguage,
  shouldTranslate
};