const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  ollama: 'http://localhost:11434/api/chat'
};

// Model capabilities mapping (same as in options.js) - Updated for 2025
const MODEL_CAPABILITIES = {
  openai: {
    'gpt-4.1': { contextWindow: 1000000, maxOutputTokens: 4096 },
    'gpt-4.1-mini': { contextWindow: 1000000, maxOutputTokens: 4096 },
    'gpt-4.1-nano': { contextWindow: 1000000, maxOutputTokens: 4096 },
    'gpt-4o': { contextWindow: 128000, maxOutputTokens: 4096 },
    'gpt-4o-mini': { contextWindow: 128000, maxOutputTokens: 4096 },
    'gpt-4-turbo': { contextWindow: 128000, maxOutputTokens: 4096 },
    'gpt-4': { contextWindow: 8192, maxOutputTokens: 4096 }
  },
  claude: {
    'claude-4-opus-4.1': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'claude-4-sonnet': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'claude-3-7-sonnet': { contextWindow: 200000, maxOutputTokens: 128000 },
    'claude-3-5-sonnet-20241022': { contextWindow: 200000, maxOutputTokens: 8192 },
    'claude-3-5-haiku-20241022': { contextWindow: 200000, maxOutputTokens: 8192 }
  },
  gemini: {
    'gemini-2.5-pro': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'gemini-2.5-flash': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'gemini-2.0-pro': { contextWindow: 2000000, maxOutputTokens: 8192 },
    'gemini-2.0-flash': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'gemini-2.0-flash-lite': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'gemini-1.5-pro-002': { contextWindow: 2000000, maxOutputTokens: 8192 },
    'gemini-1.5-flash-002': { contextWindow: 1000000, maxOutputTokens: 8192 }
  },
  openrouter: {
    'meta-llama/llama-4-maverick:free': { contextWindow: 256000, maxOutputTokens: 8192 },
    'meta-llama/llama-4-scout:free': { contextWindow: 512000, maxOutputTokens: 8192 },
    'deepseek/deepseek-r1:free': { contextWindow: 128000, maxOutputTokens: 8192 },
    'deepseek/deepseek-r1-distill-llama-70b:free': { contextWindow: 131072, maxOutputTokens: 8192 },
    'deepseek/deepseek-chat-v3-0324:free': { contextWindow: 128000, maxOutputTokens: 8192 },
    'google/gemma-3-27b-it:free': { contextWindow: 128000, maxOutputTokens: 8192 },
    'meta-llama/llama-3.3-70b-instruct:free': { contextWindow: 128000, maxOutputTokens: 8192 },
    'google/gemini-2.5-pro-exp-03-25:free': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'qwen/qwq-32b:free': { contextWindow: 131072, maxOutputTokens: 8192 },
    'anthropic/claude-3-5-sonnet': { contextWindow: 200000, maxOutputTokens: 8192 },
    'openai/gpt-4.1-mini': { contextWindow: 1000000, maxOutputTokens: 4096 },
    'google/gemini-2.5-flash': { contextWindow: 1000000, maxOutputTokens: 8192 },
    'mistralai/mistral-small-3.1-2503': { contextWindow: 128000, maxOutputTokens: 8192 }
  },
  ollama: {
    'gpt-oss:20b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'gpt-oss:120b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'deepseek-r1': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.3:70b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.2:11b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.2:90b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.1:8b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.2:3b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'llama3.2:1b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'gemma3:27b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'gemma2:9b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'gemma2:2b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'mistral-small3.1': { contextWindow: 128000, maxOutputTokens: 8192 },
    'mistral:7b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'qwen2.5:7b': { contextWindow: 128000, maxOutputTokens: 8192 },
    'qwen2.5:72b': { contextWindow: 128000, maxOutputTokens: 8192 }
  }
};

// Function to get maximum output tokens for a specific model
function getMaxTokensForModel(model, api) {
  const modelInfo = MODEL_CAPABILITIES[api]?.[model];
  if (modelInfo?.maxOutputTokens) {
    // For translation, use 90% of max output tokens to account for translation expansion
    // Translation often results in longer text (especially EN -> Chinese)
    const safetyMargin = 0.9;
    let outputTokens = Math.floor(modelInfo.maxOutputTokens * safetyMargin);
    
    // Ensure minimum viable token count for translation
    const minTokens = Math.min(2000, Math.floor(modelInfo.maxOutputTokens * 0.5));
    outputTokens = Math.max(outputTokens, minTokens);
    
    // Apply API-specific hard limits
    if (api === 'gemini') {
      // Gemini has absolute hard limit of 8192
      outputTokens = Math.min(outputTokens, 7372); // 90% of 8192
    }
    
    return outputTokens;
  }
  
  // Fallback to conservative defaults
  return 3600; // 90% of 4000
}

// Debug logging utilities
async function getDebugMode() {
  const settings = await chrome.storage.sync.get(['debugMode']);
  return settings.debugMode || false;
}

async function debugLog(...args) {
  if (await getDebugMode()) {
    console.log('[TransCraft Debug]', ...args);
  }
}

async function debugWarn(...args) {
  if (await getDebugMode()) {
    console.warn('[TransCraft Debug]', ...args);
  }
}

async function debugError(...args) {
  if (await getDebugMode()) {
    console.error('[TransCraft Debug]', ...args);
  }
}

// Common translation instructions shared by all modes
const COMMON_TRANSLATION_INSTRUCTIONS = `
IMPORTANT: If you see <<TRANSLATE_SEPARATOR>> in the text, you MUST preserve it exactly as is in your translation. This is a delimiter between different text segments.

CRITICAL RULES:
- Translate ALL content regardless of punctuation, symbols, quotes, brackets, ellipses, or any other marks
- Do not skip any text segments, even if they contain unusual characters, symbols, or formatting
- Every piece of text must be translated
- Preserve the original formatting and tone
- Provide ONLY the direct translation
- Never add commentary, explanations, status updates, or meta-text about the translation process itself
- Your response should contain nothing but the translated content
`;

// Function to build complete system prompt
async function buildSystemPrompt(roleDescription, targetLanguage) {
  // Check if there are custom common instructions
  const storage = await chrome.storage.sync.get(['customCommonInstructions']);
  const commonInstructions = storage.customCommonInstructions || COMMON_TRANSLATION_INSTRUCTIONS;
  
  return `${roleDescription.replace('{targetLanguage}', targetLanguage)}${commonInstructions}`;
}

const DEFAULT_EXPERT_MODE_PROMPTS = {
  general: {
    name: '一般翻譯',
    description: '標準翻譯模式',
    rolePrompt: 'You are a professional translator. Translate the following text to {targetLanguage}.',
    isDefault: true
  },
  novel_general: {
    name: '小說模式（通用）',
    description: '適合一般小說翻譯，保持文學性和情感表達',
    rolePrompt: 'You are a literary translator specializing in novels and creative works. Translate the following text to {targetLanguage}. Maintain the literary style, emotional nuances, character voices, and narrative flow. Preserve cultural references when appropriate and adapt them naturally. Focus on readability and emotional impact rather than literal accuracy.',
    isDefault: true
  },
  novel_romance: {
    name: '愛情小說模式',
    description: '專為愛情小說設計，強調情感細膩和浪漫氛圍',
    rolePrompt: 'You are a specialized translator for romance novels. Translate the following text to {targetLanguage}. Focus on conveying intimate emotions, romantic tension, and passionate expressions. Maintain the sensual and emotional tone while preserving character chemistry and romantic dialogue. Use elegant and evocative language that captures the heart-fluttering moments and emotional depth. Adapt cultural expressions of love and affection appropriately.',
    isDefault: true
  },
  novel_fantasy: {
    name: '奇幻小說模式',
    description: '適合奇幻冒險小說，保持魔法世界觀和史詩感',
    rolePrompt: 'You are a fantasy literature translator specializing in magical worlds and epic adventures. Translate the following text to {targetLanguage}. Maintain the grandeur and mystique of fantasy settings, preserve magical terminology and world-building elements. Keep character names, place names, and unique fantasy concepts consistent. Convey the sense of wonder, adventure, and epic scale while maintaining readability. Adapt magical concepts and mythological references appropriately for the target culture.',
    isDefault: true
  },
  novel_mystery: {
    name: '懸疑推理模式',
    description: '專為懸疑推理小說設計，保持緊張感和邏輯性',
    rolePrompt: 'You are a mystery and thriller translator specializing in suspenseful narratives. Translate the following text to {targetLanguage}. Maintain the tension, pacing, and atmospheric elements crucial to mystery stories. Preserve clues, red herrings, and logical deductions accurately. Keep investigative terminology and procedural details precise. Convey psychological tension, fear, and anticipation while maintaining clarity for readers to follow the plot. Adapt cultural references to crime, law enforcement, and social contexts appropriately.',
    isDefault: true
  },
  novel_scifi: {
    name: '科幻小說模式',
    description: '適合科幻小說，平衡科學概念和想像力',
    rolePrompt: 'You are a science fiction translator specializing in futuristic and technological narratives. Translate the following text to {targetLanguage}. Maintain scientific accuracy where applicable while preserving speculative and imaginative elements. Keep technological terminology consistent and comprehensible. Convey the wonder of scientific discovery and future possibilities. Preserve world-building elements related to advanced civilizations, space exploration, and technological concepts. Adapt scientific and cultural concepts appropriately while maintaining the visionary aspect of the genre.',
    isDefault: true
  },
  novel_historical: {
    name: '歷史小說模式',
    description: '適合歷史小說，保持時代感和文化背景',
    rolePrompt: 'You are a historical fiction translator specializing in period literature. Translate the following text to {targetLanguage}. Maintain historical authenticity and period-appropriate language while remaining accessible to modern readers. Preserve cultural references, social customs, and historical context accurately. Keep historical figures, places, and events factually correct. Convey the atmosphere and mindset of the historical period while adapting archaic expressions for contemporary understanding. Balance historical accuracy with narrative flow and readability.',
    isDefault: true
  },
  novel_literary: {
    name: '文學小說模式',
    description: '適合純文學作品，注重文字藝術和深層意涵',
    rolePrompt: 'You are a literary translator specializing in high-quality literary fiction. Translate the following text to {targetLanguage}. Focus on preserving the artistic and poetic qualities of the prose. Maintain complex themes, symbolic meanings, and metaphorical language. Pay special attention to rhythm, style, and the author\'s unique voice. Preserve literary devices such as irony, symbolism, and stream of consciousness. Convey philosophical and psychological depth while maintaining the aesthetic beauty of the original text. Prioritize literary merit and artistic expression over literal translation.',
    isDefault: true
  },
  technical: {
    name: '科技模式',
    description: '適合技術文件翻譯，保持專業術語準確性',
    rolePrompt: 'You are a technical translator specializing in technology and scientific documents. Translate the following text to {targetLanguage}. Maintain technical accuracy, use proper terminology, and preserve the formal tone. Keep technical terms, API names, code snippets, and specifications unchanged when they are industry standards. Ensure clarity and precision for technical readers.',
    isDefault: true
  },
  academic: {
    name: '學術模式',
    description: '適合學術論文翻譯，保持嚴謹性',
    rolePrompt: 'You are an academic translator specializing in scholarly works. Translate the following text to {targetLanguage}. Maintain academic rigor, preserve citations, methodology descriptions, and formal academic tone. Use appropriate academic vocabulary and ensure logical flow of arguments. Keep proper nouns, research terms, and statistical data accurate.',
    isDefault: true
  },
  business: {
    name: '商業模式',
    description: '適合商業文件翻譯，保持專業語調',
    rolePrompt: 'You are a business translator specializing in corporate communications. Translate the following text to {targetLanguage}. Maintain professional tone, business terminology, and corporate etiquette. Adapt cultural business practices appropriately while preserving the original intent. Focus on clarity and professional impact.',
    isDefault: true
  }
};

// 為系統提示添加分隔符保留指令
function addSeparatorPreservationToPrompt(prompt) {
  const separatorInstruction = 'CRITICAL INSTRUCTION: The text contains <<TRANSLATE_SEPARATOR>> markers that divide different text segments. You MUST:\n1. Translate each segment separately\n2. Keep the <<TRANSLATE_SEPARATOR>> markers EXACTLY as they appear in the original text\n3. Maintain the same number of segments as the input\n4. Do NOT combine segments or change the separator format\n\n';
  
  // 如果提示中已經包含分隔符指令，則不重複添加
  if (prompt.includes('<<TRANSLATE_SEPARATOR>>')) {
    return prompt;
  }
  
  // 在提示開頭添加分隔符指令
  return separatorInstruction + prompt;
}

// Helper function to log API requests in debug mode
async function logAPIRequest(apiName, endpoint, options) {
  const debugMode = await getDebugMode();
  if (!debugMode) return;
  
  console.log(`[TransCraft Debug] ${apiName} API Request:`, {
    endpoint: endpoint,
    method: options.method || 'GET',
    headers: Object.keys(options.headers || {}),
    bodyPreview: options.body ? JSON.parse(options.body) : undefined,
    timestamp: new Date().toISOString()
  });
}

// Helper function to log API responses in debug mode
async function logAPIResponse(apiName, response, startTime, data = null) {
  const debugMode = await getDebugMode();
  if (!debugMode) return;
  
  const elapsedTime = Date.now() - startTime;
  console.log(`[TransCraft Debug] ${apiName} API Response:`, {
    status: response.status,
    statusText: response.statusText,
    elapsedTime: `${elapsedTime}ms`,
    headers: Object.fromEntries(response.headers.entries()),
    dataPreview: data ? JSON.stringify(data).substring(0, 200) + '...' : 'N/A',
    timestamp: new Date().toISOString()
  });
}

async function getExpertModePrompts() {
  const storage = await chrome.storage.sync.get(['customExpertModes']);
  const customModes = storage.customExpertModes || {};
  
  // 為所有默認模式添加分隔符保留指令
  const enhancedDefaultModes = {};
  for (const [key, mode] of Object.entries(DEFAULT_EXPERT_MODE_PROMPTS)) {
    enhancedDefaultModes[key] = {
      ...mode,
      systemPrompt: await buildSystemPrompt(mode.rolePrompt, 'TARGET_LANGUAGE_PLACEHOLDER')
    };
  }
  
  return { ...enhancedDefaultModes, ...customModes };
}

async function translateWithOpenAI(text, targetLanguage, apiKey, model = 'gpt-4o-mini', expertMode = 'general') {
  const languageNames = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const allExpertModes = await getExpertModePrompts();
  const expertPrompt = allExpertModes[expertMode] || allExpertModes.general;
  const systemPrompt = await buildSystemPrompt(expertPrompt.rolePrompt || expertPrompt.systemPrompt, languageNames[targetLanguage] || targetLanguage);

  // Get debug mode setting
  const debugMode = await chrome.storage.sync.get(['debugMode']).then(r => r.debugMode || false);
  
  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3,
    max_tokens: getMaxTokensForModel(model, 'openai')
  };

  if (debugMode) {
    console.log('[TransCraft Debug] OpenAI API Request:', {
      endpoint: API_ENDPOINTS.openai,
      model: model,
      textLength: text.length,
      textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      expertMode: expertMode,
      targetLanguage: targetLanguage
    });
  }

  const startTime = Date.now();

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  };

  await logAPIRequest('OpenAI', API_ENDPOINTS.openai, fetchOptions);

  const response = await fetch(API_ENDPOINTS.openai, fetchOptions);

  if (!response.ok) {
    let errorMessage = 'OpenAI API error';
    try {
      const error = await response.json();
      const originalError = error.error?.message || error.message;
      
      // 已知錯誤類型，只記錄為警告而不是錯誤
      if (response.status === 429 || response.status === 401 || response.status === 402 || response.status === 403 || response.status === 503) {
        console.warn(`OpenAI API known issue (${response.status}):`, originalError);
      } else {
        // 未知錯誤才使用 console.error
        console.error('OpenAI API unexpected error:', JSON.stringify(error, null, 2));
      }
      
      if (response.status === 429) {
        errorMessage = `OpenAI API 請求頻率過高，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 401) {
        errorMessage = `OpenAI API Key 無效或已過期${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 402 || response.status === 403) {
        errorMessage = `OpenAI API 餘額不足或權限不足${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 503) {
        errorMessage = `OpenAI 服務暫時不可用，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else {
        errorMessage = originalError || `OpenAI API error (${response.status})`;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI error response:', parseError);
      if (response.status === 429) {
        errorMessage = 'OpenAI API 請求頻率過高，請稍後再試';
      } else {
        errorMessage = `OpenAI API error (${response.status}: ${response.statusText})`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  await logAPIResponse('OpenAI', response, startTime, data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenAI response structure:', JSON.stringify(data, null, 2));
    throw new Error('OpenAI返回無效的響應結構');
  }
  
  const elapsedTime = Date.now() - startTime;
  
  if (debugMode) {
    console.log('[TransCraft Debug] OpenAI API Response:', {
      elapsedTime: `${elapsedTime}ms`,
      status: response.status,
      usage: data.usage,
      translationLength: data.choices[0].message.content?.length || 0,
      translationPreview: data.choices[0].message.content?.substring(0, 100) + 
        (data.choices[0].message.content?.length > 100 ? '...' : '')
    });
  }
  
  return data.choices[0].message.content;
}

async function translateWithClaude(text, targetLanguage, apiKey, model = 'claude-3-haiku-20240307', expertMode = 'general') {
  const languageNames = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const allExpertModes = await getExpertModePrompts();
  const expertPrompt = allExpertModes[expertMode] || allExpertModes.general;
  const systemPrompt = await buildSystemPrompt(expertPrompt.rolePrompt || expertPrompt.systemPrompt, languageNames[targetLanguage] || targetLanguage);

  const response = await fetch(API_ENDPOINTS.claude, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: getMaxTokensForModel(model, 'claude'),
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${text}`
        }
      ]
    })
  });

  if (!response.ok) {
    let errorMessage = 'Claude API error';
    try {
      const error = await response.json();
      const originalError = error.error?.message || error.message;
      
      // 已知錯誤類型，只記錄為警告而不是錯誤
      if (response.status === 429 || response.status === 401 || response.status === 402 || response.status === 403 || response.status === 503) {
        console.warn(`Claude API known issue (${response.status}):`, originalError);
      } else {
        // 未知錯誤才使用 console.error
        console.error('Claude API unexpected error:', JSON.stringify(error, null, 2));
      }
      
      if (response.status === 429) {
        errorMessage = `Claude API 請求頻率過高，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 401) {
        errorMessage = `Claude API Key 無效或已過期${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 402 || response.status === 403) {
        errorMessage = `Claude API 餘額不足或權限不足${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 503) {
        errorMessage = `Claude 服務暫時不可用，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else {
        errorMessage = originalError || `Claude API error (${response.status})`;
      }
    } catch (parseError) {
      console.error('Failed to parse Claude error response:', parseError);
      if (response.status === 429) {
        errorMessage = 'Claude API 請求頻率過高，請稍後再試';
      } else {
        errorMessage = `Claude API error (${response.status}: ${response.statusText})`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    console.error('Invalid Claude response structure:', JSON.stringify(data, null, 2));
    throw new Error('Claude返回無效的響應結構');
  }
  
  return data.content[0].text;
}

async function translateWithGemini(text, targetLanguage, apiKey, model = 'gemini-1.5-flash', expertMode = 'general') {
  const languageNames = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const allExpertModes = await getExpertModePrompts();
  const expertPrompt = allExpertModes[expertMode] || allExpertModes.general;
  const systemPrompt = await buildSystemPrompt(expertPrompt.rolePrompt || expertPrompt.systemPrompt, languageNames[targetLanguage] || targetLanguage);

  const url = `${API_ENDPOINTS.gemini}${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n${text}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: getMaxTokensForModel(model, 'gemini')
      }
    })
  });

  if (!response.ok) {
    let errorMessage = 'Gemini API error';
    try {
      const error = await response.json();
      const originalError = error.error?.message || error.message;
      
      // 已知錯誤類型，只記錄為警告而不是錯誤
      if (response.status === 429 || response.status === 401 || response.status === 402 || response.status === 403 || response.status === 503) {
        console.warn(`Gemini API known issue (${response.status}):`, originalError);
      } else {
        // 未知錯誤才使用 console.error
        console.error('Gemini API unexpected error:', JSON.stringify(error, null, 2));
      }
      
      if (response.status === 429) {
        errorMessage = `Gemini API 請求頻率過高，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 401) {
        errorMessage = `Gemini API Key 無效或已過期${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 402 || response.status === 403) {
        errorMessage = `Gemini API 餘額不足或權限不足${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (response.status === 503) {
        errorMessage = `Gemini 服務暫時不可用，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else {
        errorMessage = originalError || `Gemini API error (${response.status})`;
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini error response:', parseError);
      if (response.status === 429) {
        errorMessage = 'Gemini API 請求頻率過高，請稍後再試';
      } else {
        errorMessage = `Gemini API error (${response.status}: ${response.statusText})`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // 檢查是否有候選結果
  if (!data.candidates || !data.candidates[0]) {
    console.error('Invalid Gemini response structure:', JSON.stringify(data, null, 2));
    throw new Error('Gemini返回無效的響應結構');
  }
  
  const candidate = data.candidates[0];
  
  // 檢查完成原因
  if (candidate.finishReason === 'MAX_TOKENS') {
    console.warn('Gemini hit max token limit:', JSON.stringify(data, null, 2));
    throw new Error('Gemini 回應超過 token 限制，請減少翻譯內容量或調整批次大小');
  }
  
  if (candidate.finishReason === 'SAFETY') {
    console.warn('Gemini blocked for safety reasons:', JSON.stringify(data, null, 2));
    throw new Error('Gemini 因安全原因拒絕翻譯此內容');
  }
  
  // 檢查是否有實際內容
  if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0] || !candidate.content.parts[0].text) {
    console.error('Gemini response missing translation text:', JSON.stringify(data, null, 2));
    throw new Error('Gemini 回應中沒有翻譯文本');
  }
  
  return candidate.content.parts[0].text;
}

async function translateWithOpenRouter(text, targetLanguage, apiKey, model = 'meta-llama/llama-3.1-8b-instruct:free', expertMode = 'general') {
  const languageNames = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const allExpertModes = await getExpertModePrompts();
  const expertPrompt = allExpertModes[expertMode] || allExpertModes.general;
  const systemPrompt = await buildSystemPrompt(expertPrompt.rolePrompt || expertPrompt.systemPrompt, languageNames[targetLanguage] || targetLanguage);

  const response = await fetch(API_ENDPOINTS.openrouter, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://transcraft.extension',
      'X-Title': 'TransCraft Extension'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: getMaxTokensForModel(model, 'openrouter')
    })
  });

  if (!response.ok) {
    let errorMessage = 'OpenRouter API error';
    try {
      const error = await response.json();
      
      // 檢查特定的錯誤類型並提供友好的錯誤訊息
      const originalError = error.error?.message || error.message;
      const is429 = error.error?.code === 429 || response.status === 429;
      const is401 = error.error?.code === 401 || response.status === 401;
      const is402 = error.error?.code === 402 || response.status === 402;
      const is503 = error.error?.code === 503 || response.status === 503;
      
      // 已知錯誤類型，只記錄為警告而不是錯誤
      if (is429 || is401 || is402 || is503) {
        const metadata = error.error?.metadata;
        const statusInfo = metadata?.raw || originalError || `Status ${response.status}`;
        console.warn(`OpenRouter API known issue (${response.status}):`, statusInfo);
      } else {
        // 未知錯誤才使用 console.error
        console.error('OpenRouter API unexpected error:', JSON.stringify(error, null, 2));
      }
      
      if (is429) {
        // 速率限制錯誤
        const metadata = error.error?.metadata;
        if (metadata?.raw) {
          // 包含具體的速率限制信息
          if (metadata.raw.includes('temporarily rate-limited upstream')) {
            const modelName = metadata.raw.match(/(\S+) is temporarily/)?.[1] || '模型';
            errorMessage = `${modelName}暫時被上游限制，請稍後再試或使用其他模型`;
          } else if (metadata.raw.includes('rate-limited')) {
            errorMessage = `請求頻率過高，請稍後再試`;
          } else {
            errorMessage = `速率限制：${metadata.raw}`;
          }
        } else {
          errorMessage = `請求頻率過高，請稍後再試或切換到其他模型${originalError ? `\n錯誤：${originalError}` : ''}`;
        }
      } else if (is401) {
        // 認證錯誤
        errorMessage = `OpenRouter API Key 無效或已過期${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (is402) {
        // 付費相關錯誤
        errorMessage = `OpenRouter 餘額不足，請充值或使用免費模型${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else if (is503) {
        // 服務不可用
        errorMessage = `OpenRouter 服務暫時不可用，請稍後再試${originalError ? `\n錯誤：${originalError}` : ''}`;
      } else {
        // 其他錯誤，使用原始錯誤訊息
        errorMessage = originalError || `OpenRouter API error (${response.status})`;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenRouter error response:', parseError);
      if (response.status === 429) {
        errorMessage = '請求頻率過高，請稍後再試';
      } else {
        errorMessage = `OpenRouter API error (${response.status}: ${response.statusText})`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenRouter response structure:', JSON.stringify(data, null, 2));
    throw new Error('OpenRouter返回無效的響應結構');
  }
  
  return data.choices[0].message.content;
}

async function translateWithOllama(text, targetLanguage, apiKey = '', model = 'llama3.1:8b', expertMode = 'general') {
  const languageNames = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const allExpertModes = await getExpertModePrompts();
  const expertPrompt = allExpertModes[expertMode] || allExpertModes.general;
  const systemPrompt = await buildSystemPrompt(expertPrompt.rolePrompt || expertPrompt.systemPrompt, languageNames[targetLanguage] || targetLanguage);

  const response = await fetch(API_ENDPOINTS.ollama, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    let errorMessage = 'Ollama API error - 請確認 Ollama 服務正在運行';
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          errorMessage = errorText;
        }
      }
      errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
      console.error('Ollama API error details:', { status: response.status, statusText: response.statusText, errorText: errorText });
    } catch (parseError) {
      console.error('Failed to parse Ollama error response:', parseError);
      errorMessage = `Ollama API error (${response.status}: ${response.statusText})`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.message || !data.message.content) {
    console.error('Invalid Ollama response structure:', JSON.stringify(data, null, 2));
    throw new Error('Ollama返回無效的響應結構');
  }
  
  return data.message.content;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request).then(sendResponse).catch(error => {
      // 根據錯誤類型決定日誌級別
      const errorMsg = error.message;
      if (errorMsg.includes('暫時被上游限制') || errorMsg.includes('請求頻率過高') || 
          errorMsg.includes('rate-limited') || errorMsg.includes('temporarily') ||
          errorMsg.includes('暫時被限制') || errorMsg.includes('限制使用') ||
          errorMsg.includes('API Key 無效') || errorMsg.includes('已過期') ||
          errorMsg.includes('餘額不足') || errorMsg.includes('權限不足') ||
          errorMsg.includes('服務暫時不可用') || errorMsg.includes('配額') ||
          errorMsg.includes('quota') || errorMsg.includes('exceeded') ||
          errorMsg.includes('TIMEOUT_ERROR') || errorMsg.includes('timed out')) {
        console.warn('Translation known issue:', errorMsg);
      } else {
        console.error('Translation unexpected error:', error);
      }
      sendResponse({ error: error.message });
    });
    return true; // 表示異步響應
  } else if (request.action === 'testConnection') {
    testAPIConnection(request).then(sendResponse).catch(error => {
      console.error('Test connection error in background:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // 表示異步響應
  } else if (request.action === 'getExpertModes') {
    getExpertModePrompts().then(expertModes => {
      sendResponse({ expertModes });
    }).catch(error => {
      console.error('Get expert modes error in background:', error);
      sendResponse({ expertModes: {}, error: error.message });
    });
    return true; // 表示異步響應
  } else if (request.action === 'getDefaultCommonInstructions') {
    sendResponse({ instructions: COMMON_TRANSLATION_INSTRUCTIONS.trim() });
    return false;
  } else if (request.action === 'saveExpertMode') {
    saveExpertMode(request).then(sendResponse).catch(error => {
      console.error('Save expert mode error in background:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // 表示異步響應
  } else if (request.action === 'deleteExpertMode') {
    deleteExpertMode(request).then(sendResponse).catch(error => {
      console.error('Delete expert mode error in background:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // 表示異步響應
  } else if (request.action === 'openOptions') {
    try {
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
    } catch (error) {
      console.error('Open options error in background:', error);
      sendResponse({ success: false, error: error.message });
    }
    return false; // 同步響應
  }
  
  // 如果沒有匹配的action，返回錯誤
  sendResponse({ error: 'Unknown action' });
  return false;
});

async function handleTranslation(request) {
  try {
    const { text, targetLanguage, apiConfig, expertMode = 'general' } = request;
    
    if (!apiConfig || !apiConfig.selectedApi || !apiConfig.apiKeys) {
      throw new Error('API 配置不完整');
    }
    
    const { selectedApi, apiKeys, selectedModel } = apiConfig;
    const apiKey = apiKeys[selectedApi];
    
    if (!apiKey && selectedApi !== 'ollama') {
      throw new Error(`缺少 ${selectedApi} 的 API Key`);
    }

    // Debug log translation request
    await debugLog('Background Translation Request:', {
      api: selectedApi,
      model: selectedModel,
      targetLanguage: targetLanguage,
      expertMode: expertMode,
      textLength: text.length,
      textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });

    const startTime = Date.now();
    let translation;
    
    switch (selectedApi) {
      case 'openai':
        translation = await translateWithOpenAI(text, targetLanguage, apiKey, selectedModel || 'gpt-4o-mini', expertMode);
        break;
      case 'claude':
        translation = await translateWithClaude(text, targetLanguage, apiKey, selectedModel || 'claude-3-haiku-20240307', expertMode);
        break;
      case 'gemini':
        translation = await translateWithGemini(text, targetLanguage, apiKey, selectedModel || 'gemini-1.5-flash', expertMode);
        break;
      case 'openrouter':
        translation = await translateWithOpenRouter(text, targetLanguage, apiKey, selectedModel || 'deepseek/deepseek-r1-distill-llama-70b:free', expertMode);
        break;
      case 'ollama':
        translation = await translateWithOllama(text, targetLanguage, apiKey, selectedModel || 'llama3.1:8b', expertMode);
        break;
      default:
        throw new Error('未選擇有效的 API');
    }

    const elapsedTime = Date.now() - startTime;
    
    // Translation result is now clean from source - no post-processing needed

    // Debug log successful translation
    await debugLog('Background Translation Success:', {
      api: selectedApi,
      elapsedTime: `${elapsedTime}ms`,
      translationLength: translation?.length || 0,
      translationPreview: translation?.substring(0, 100) + (translation?.length > 100 ? '...' : '')
    });

    return { translation };
  } catch (error) {
    const errorMsg = error.message;
    
    // 已知錯誤使用 warn，未知錯誤使用 error
    if (errorMsg.includes('暫時被上游限制') || errorMsg.includes('請求頻率過高') || 
        errorMsg.includes('rate-limited') || errorMsg.includes('temporarily') ||
        errorMsg.includes('暫時被限制') || errorMsg.includes('限制使用') ||
        errorMsg.includes('API Key 無效') || errorMsg.includes('已過期') ||
        errorMsg.includes('餘額不足') || errorMsg.includes('權限不足') ||
        errorMsg.includes('服務暫時不可用') || errorMsg.includes('配額') ||
        errorMsg.includes('quota') || errorMsg.includes('exceeded') ||
        errorMsg.includes('TIMEOUT_ERROR') || errorMsg.includes('timed out')) {
      console.warn('Translation known issue:', errorMsg);
      await debugWarn('Translation known issue:', errorMsg);
    } else {
      console.error('Translation unexpected error:', error);
      await debugError('Translation unexpected error:', error);
    }
    
    return { error: error.message };
  }
}

async function testAPIConnection(request) {
  const { api, apiKey, model, expertMode = 'general' } = request;
  const testText = 'Hello';
  
  try {
    let result;
    switch (api) {
      case 'openai':
        result = await translateWithOpenAI(testText, 'zh-TW', apiKey, model, expertMode);
        break;
      case 'claude':
        result = await translateWithClaude(testText, 'zh-TW', apiKey, model, expertMode);
        break;
      case 'gemini':
        result = await translateWithGemini(testText, 'zh-TW', apiKey, model, expertMode);
        break;
      case 'openrouter':
        result = await translateWithOpenRouter(testText, 'zh-TW', apiKey, model, expertMode);
        break;
      case 'ollama':
        result = await translateWithOllama(testText, 'zh-TW', apiKey, model, expertMode);
        break;
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function saveExpertMode(request) {
  try {
    const { id, name, description, systemPrompt, isEditing } = request;
    
    if (!id || !name || !systemPrompt) {
      throw new Error('缺少必要欄位');
    }
    
    // 驗證 ID 格式
    if (!/^[a-zA-Z0-9_]+$/.test(id)) {
      throw new Error('模式 ID 只能包含英文字母、數字和底線');
    }
    
    const storage = await chrome.storage.sync.get(['customExpertModes']);
    const customModes = storage.customExpertModes || {};
    
    // 檢查是否與預設模式重複（如果不是編輯現有模式）
    if (!isEditing && DEFAULT_EXPERT_MODE_PROMPTS[id]) {
      throw new Error('不能使用預設模式的 ID');
    }
    
    // 如果是新增模式，檢查 ID 是否已存在
    if (!isEditing && customModes[id]) {
      throw new Error('模式 ID 已存在');
    }
    
    customModes[id] = {
      name,
      description,
      systemPrompt,
      isDefault: DEFAULT_EXPERT_MODE_PROMPTS[id] ? true : false
    };
    
    await chrome.storage.sync.set({ customExpertModes: customModes });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteExpertMode(request) {
  try {
    const { id } = request;
    
    // 不能刪除預設模式
    if (DEFAULT_EXPERT_MODE_PROMPTS[id]) {
      throw new Error('無法刪除預設模式');
    }
    
    const storage = await chrome.storage.sync.get(['customExpertModes']);
    const customModes = storage.customExpertModes || {};
    
    if (!customModes[id]) {
      throw new Error('模式不存在');
    }
    
    delete customModes[id];
    
    await chrome.storage.sync.set({ customExpertModes: customModes });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}