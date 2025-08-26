const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  ollama: 'http://localhost:11434/api/chat'
};

const DEFAULT_EXPERT_MODE_PROMPTS = {
  general: {
    name: '一般翻譯',
    description: '標準翻譯模式',
    systemPrompt: 'You are a professional translator. Translate the following text to {targetLanguage}. IMPORTANT: If you see <<TRANSLATE_SEPARATOR>> in the text, you MUST preserve it exactly as is in your translation. This is a delimiter between different text segments. Preserve the original formatting and tone. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_general: {
    name: '小說模式（通用）',
    description: '適合一般小說翻譯，保持文學性和情感表達',
    systemPrompt: 'You are a literary translator specializing in novels and creative works. Translate the following text to {targetLanguage}. Maintain the literary style, emotional nuances, character voices, and narrative flow. Preserve cultural references when appropriate and adapt them naturally. Focus on readability and emotional impact rather than literal accuracy. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_romance: {
    name: '愛情小說模式',
    description: '專為愛情小說設計，強調情感細膩和浪漫氛圍',
    systemPrompt: 'You are a specialized translator for romance novels. Translate the following text to {targetLanguage}. Focus on conveying intimate emotions, romantic tension, and passionate expressions. Maintain the sensual and emotional tone while preserving character chemistry and romantic dialogue. Use elegant and evocative language that captures the heart-fluttering moments and emotional depth. Adapt cultural expressions of love and affection appropriately. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_fantasy: {
    name: '奇幻小說模式',
    description: '適合奇幻冒險小說，保持魔法世界觀和史詩感',
    systemPrompt: 'You are a fantasy literature translator specializing in magical worlds and epic adventures. Translate the following text to {targetLanguage}. Maintain the grandeur and mystique of fantasy settings, preserve magical terminology and world-building elements. Keep character names, place names, and unique fantasy concepts consistent. Convey the sense of wonder, adventure, and epic scale while maintaining readability. Adapt magical concepts and mythological references appropriately for the target culture. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_mystery: {
    name: '懸疑推理模式',
    description: '專為懸疑推理小說設計，保持緊張感和邏輯性',
    systemPrompt: 'You are a mystery and thriller translator specializing in suspenseful narratives. Translate the following text to {targetLanguage}. Maintain the tension, pacing, and atmospheric elements crucial to mystery stories. Preserve clues, red herrings, and logical deductions accurately. Keep investigative terminology and procedural details precise. Convey psychological tension, fear, and anticipation while maintaining clarity for readers to follow the plot. Adapt cultural references to crime, law enforcement, and social contexts appropriately. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_scifi: {
    name: '科幻小說模式',
    description: '適合科幻小說，平衡科學概念和想像力',
    systemPrompt: 'You are a science fiction translator specializing in futuristic and technological narratives. Translate the following text to {targetLanguage}. Maintain scientific accuracy where applicable while preserving speculative and imaginative elements. Keep technological terminology consistent and comprehensible. Convey the wonder of scientific discovery and future possibilities. Preserve world-building elements related to advanced civilizations, space exploration, and technological concepts. Adapt scientific and cultural concepts appropriately while maintaining the visionary aspect of the genre. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_historical: {
    name: '歷史小說模式',
    description: '適合歷史小說，保持時代感和文化背景',
    systemPrompt: 'You are a historical fiction translator specializing in period literature. Translate the following text to {targetLanguage}. Maintain historical authenticity and period-appropriate language while remaining accessible to modern readers. Preserve cultural references, social customs, and historical context accurately. Keep historical figures, places, and events factually correct. Convey the atmosphere and mindset of the historical period while adapting archaic expressions for contemporary understanding. Balance historical accuracy with narrative flow and readability. Only return the translated text without any explanations.',
    isDefault: true
  },
  novel_literary: {
    name: '文學小說模式',
    description: '適合純文學作品，注重文字藝術和深層意涵',
    systemPrompt: 'You are a literary translator specializing in high-quality literary fiction. Translate the following text to {targetLanguage}. Focus on preserving the artistic and poetic qualities of the prose. Maintain complex themes, symbolic meanings, and metaphorical language. Pay special attention to rhythm, style, and the author\'s unique voice. Preserve literary devices such as irony, symbolism, and stream of consciousness. Convey philosophical and psychological depth while maintaining the aesthetic beauty of the original text. Prioritize literary merit and artistic expression over literal translation. Only return the translated text without any explanations.',
    isDefault: true
  },
  technical: {
    name: '科技模式',
    description: '適合技術文件翻譯，保持專業術語準確性',
    systemPrompt: 'You are a technical translator specializing in technology and scientific documents. Translate the following text to {targetLanguage}. Maintain technical accuracy, use proper terminology, and preserve the formal tone. Keep technical terms, API names, code snippets, and specifications unchanged when they are industry standards. Ensure clarity and precision for technical readers. Only return the translated text without any explanations.',
    isDefault: true
  },
  academic: {
    name: '學術模式',
    description: '適合學術論文翻譯，保持嚴謹性',
    systemPrompt: 'You are an academic translator specializing in scholarly works. Translate the following text to {targetLanguage}. Maintain academic rigor, preserve citations, methodology descriptions, and formal academic tone. Use appropriate academic vocabulary and ensure logical flow of arguments. Keep proper nouns, research terms, and statistical data accurate. Only return the translated text without any explanations.',
    isDefault: true
  },
  business: {
    name: '商業模式',
    description: '適合商業文件翻譯，保持專業語調',
    systemPrompt: 'You are a business translator specializing in corporate communications. Translate the following text to {targetLanguage}. Maintain professional tone, business terminology, and corporate etiquette. Adapt cultural business practices appropriately while preserving the original intent. Focus on clarity and professional impact. Only return the translated text without any explanations.',
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

async function getExpertModePrompts() {
  const storage = await chrome.storage.sync.get(['customExpertModes']);
  const customModes = storage.customExpertModes || {};
  
  // 為所有默認模式添加分隔符保留指令
  const enhancedDefaultModes = {};
  for (const [key, mode] of Object.entries(DEFAULT_EXPERT_MODE_PROMPTS)) {
    enhancedDefaultModes[key] = {
      ...mode,
      systemPrompt: addSeparatorPreservationToPrompt(mode.systemPrompt)
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
  const systemPrompt = expertPrompt.systemPrompt.replace('{targetLanguage}', languageNames[targetLanguage] || targetLanguage);

  const response = await fetch(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
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
  const systemPrompt = expertPrompt.systemPrompt.replace('{targetLanguage}', languageNames[targetLanguage] || targetLanguage);

  const response = await fetch(API_ENDPOINTS.claude, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2000,
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
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API error');
  }

  const data = await response.json();
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
  const systemPrompt = expertPrompt.systemPrompt.replace('{targetLanguage}', languageNames[targetLanguage] || targetLanguage);

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
        maxOutputTokens: 2000
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
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
  const systemPrompt = expertPrompt.systemPrompt.replace('{targetLanguage}', languageNames[targetLanguage] || targetLanguage);

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
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
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
  const systemPrompt = expertPrompt.systemPrompt.replace('{targetLanguage}', languageNames[targetLanguage] || targetLanguage);

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
    const error = await response.text();
    throw new Error(error || 'Ollama API error - 請確認 Ollama 服務正在運行');
  }

  const data = await response.json();
  return data.message.content;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request).then(sendResponse).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (request.action === 'testConnection') {
    testAPIConnection(request).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'getExpertModes') {
    getExpertModePrompts().then(expertModes => {
      sendResponse({ expertModes });
    });
    return true;
  } else if (request.action === 'saveExpertMode') {
    saveExpertMode(request).then(sendResponse);
    return true;
  } else if (request.action === 'deleteExpertMode') {
    deleteExpertMode(request).then(sendResponse);
    return true;
  } else if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
});

async function handleTranslation(request) {
  try {
    const { text, targetLanguage, apiConfig, expertMode = 'general' } = request;
    
    if (!apiConfig || !apiConfig.selectedApi || !apiConfig.apiKeys) {
      throw new Error('API 配置不完整');
    }
    
    const { selectedApi, apiKeys, selectedModel } = apiConfig;
    const apiKey = apiKeys[selectedApi];
    
    if (!apiKey) {
      throw new Error(`缺少 ${selectedApi} 的 API Key`);
    }

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

    return { translation };
  } catch (error) {
    console.error('Translation handling error:', error);
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