document.addEventListener('DOMContentLoaded', async function() {
    // Initialize i18n
    await window.i18n.initI18n();
    
    const apiServiceSelect = document.getElementById('api-service-select');
    const saveButton = document.getElementById('save-button');
    const testButton = document.getElementById('test-button');
    const statusMessage = document.getElementById('status-message');
    const targetLanguageSelect = document.getElementById('target-language');
    const modelSelect = document.getElementById('model-select');
    const interfaceLanguageSelect = document.getElementById('interface-language');
    
    // Batch settings elements
    const maxBatchLengthInput = document.getElementById('max-batch-length');
    const maxBatchElementsInput = document.getElementById('max-batch-elements');
    const requestTimeoutInput = document.getElementById('request-timeout');
    const autoAdjustBatchSizeButton = document.getElementById('auto-adjust-batch-size');
    
    // Debug mode elements
    const settingsTitle = document.getElementById('settings-title');
    const debugSection = document.getElementById('debug-section');
    const debugModeCheckbox = document.getElementById('debug-mode-checkbox');
    const commonPromptEditor = document.getElementById('common-prompt-editor');
    const commonInstructionsTextarea = document.getElementById('common-instructions');
    const resetCommonPromptButton = document.getElementById('reset-common-prompt');
    const applyCommonPromptButton = document.getElementById('apply-common-prompt');
    let titleClickCount = 0;
    let titleClickTimer = null;
    
    // Language detection elements
    const languageDetectionCheckbox = document.getElementById('language-detection-checkbox');
    const languageDetectionChars = document.getElementById('language-detection-chars');
    
    // Expert modes management elements
    const expertModesList = document.getElementById('expert-modes-list');
    const addExpertModeButton = document.getElementById('add-expert-mode-button');
    const expertModeModal = document.getElementById('expert-mode-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');
    const expertModeIdInput = document.getElementById('expert-mode-id');
    const expertModeNameInput = document.getElementById('expert-mode-name');
    const expertModeDescInput = document.getElementById('expert-mode-description');
    const expertModePromptInput = document.getElementById('expert-mode-prompt');
    
    let currentEditingId = null;

    const apiInputs = {
        openai: document.getElementById('openai-key'),
        claude: document.getElementById('claude-key'),
        gemini: document.getElementById('gemini-key'),
        openrouter: document.getElementById('openrouter-key'),
        ollama: document.getElementById('ollama-key')
    };

    const modelData = {
        openai: {
            models: [
                // GPT-4.1 系列 (2025最新)
                { value: 'gpt-4.1', name: 'GPT-4.1', type: 'powerful', desc: '最新模型，1M上下文，在程式碼和指令遵循方面有重大改進', contextWindow: 1000000, maxOutputTokens: 4096 },
                { value: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', type: 'balanced', desc: '延遲減半，成本降低83%，1M上下文', contextWindow: 1000000, maxOutputTokens: 4096 },
                { value: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', type: 'fast', desc: '最快最便宜的模型，1M上下文窗口', contextWindow: 1000000, maxOutputTokens: 4096 },
                
                // GPT-4o 系列
                { value: 'gpt-4o', name: 'GPT-4o', type: 'powerful', desc: '多模態模型，優秀的多語言支援', contextWindow: 128000, maxOutputTokens: 4096 },
                { value: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'balanced', desc: '平衡效能與成本的熱門選擇', contextWindow: 128000, maxOutputTokens: 4096 },
                
                // GPT-4 系列
                { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'powerful', desc: '高準確度，適合複雜翻譯任務', contextWindow: 128000, maxOutputTokens: 4096 },
                { value: 'gpt-4', name: 'GPT-4', type: 'powerful', desc: '經典強力模型', contextWindow: 8192, maxOutputTokens: 4096 }
            ],
            defaultModel: 'gpt-4.1-mini'
        },
        claude: {
            models: [
                // Claude 4 系列 (2025最新)
                { value: 'claude-4-opus-4.1', name: 'Claude Opus 4.1', type: 'powerful', desc: '最智能的模型，複雜推理新標杆 (2025年8月發布)', contextWindow: 1000000, maxOutputTokens: 8192 },
                { value: 'claude-4-sonnet', name: 'Claude Sonnet 4', type: 'powerful', desc: '1M上下文，可處理75000行程式碼或數十篇研究論文', contextWindow: 1000000, maxOutputTokens: 8192 },
                
                // Claude 3.7 系列 (2025年2月發布)
                { value: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', type: 'powerful', desc: '混合推理模型，支援128K輸出tokens', contextWindow: 200000, maxOutputTokens: 128000 },
                
                // Claude 3.5 系列
                { value: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', type: 'powerful', desc: '業界領先的智能水平，速度與品質兼具', contextWindow: 200000, maxOutputTokens: 8192 },
                { value: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', type: 'fast', desc: '最快且最具成本效益的智能模型', contextWindow: 200000, maxOutputTokens: 8192 }
            ],
            defaultModel: 'claude-4-sonnet'
        },
        gemini: {
            models: [
                // Gemini 2.5 系列 (2025最新)
                { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'powerful', desc: '1M上下文(即將支援2M)，最先進思考模型', contextWindow: 1000000, maxOutputTokens: 8192 },
                { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'balanced', desc: '效率提升20-30%，預設啟用思考功能', contextWindow: 1000000, maxOutputTokens: 8192 },
                
                // Gemini 2.0 系列
                { value: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', type: 'powerful', desc: '2M上下文，最強編碼性能', contextWindow: 2000000, maxOutputTokens: 8192 },
                { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'balanced', desc: '1M上下文，原生工具使用，多模態生成', contextWindow: 1000000, maxOutputTokens: 8192 },
                { value: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', type: 'fast', desc: '1M上下文，比1.5 Flash更高品質', contextWindow: 1000000, maxOutputTokens: 8192 },
                
                // Gemini 1.5 系列
                { value: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', type: 'powerful', desc: '2M上下文，可處理2小時影片或60000行程式碼', contextWindow: 2000000, maxOutputTokens: 8192 },
                { value: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash', type: 'fast', desc: '1M上下文，快速多功能模型', contextWindow: 1000000, maxOutputTokens: 8192 }
            ],
            defaultModel: 'gemini-2.5-flash'
        },
        openrouter: {
            models: [
                // 2025年最新免費模型 (每日50次免費調用，20次/分鐘)
                { value: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (免費)', type: 'powerful', desc: '256K上下文，1M理論最大值，最新Llama 4模型', contextWindow: 256000, maxOutputTokens: 8192 },
                { value: 'meta-llama/llama-4-scout:free', name: 'Llama 4 Scout (免費)', type: 'powerful', desc: '512K上下文，10M理論最大值，探索級模型', contextWindow: 512000, maxOutputTokens: 8192 },
                { value: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (免費)', type: 'powerful', desc: '推理優化模型，強大的邏輯和分析能力', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 70B (免費)', type: 'powerful', desc: '蒸餾版本，保持高品質同時提升效率', contextWindow: 131072, maxOutputTokens: 8192 },
                { value: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (免費)', type: 'balanced', desc: '編碼翻譯能力強，適合技術文件', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (免費)', type: 'powerful', desc: 'Google最新27B參數模型，高品質輸出', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (免費)', type: 'powerful', desc: 'Meta最新70B模型，性能接近405B', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro Exp (免費)', type: 'powerful', desc: 'Google實驗性模型，最新Gemini技術', contextWindow: 1000000, maxOutputTokens: 8192 },
                { value: 'qwen/qwq-32b:free', name: 'QwQ 32B (免費)', type: 'powerful', desc: '阿里雲推理優化模型，中文處理優秀', contextWindow: 131072, maxOutputTokens: 8192 },
                
                // 高效付費模型
                { value: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', type: 'powerful', desc: '最智能的Claude模型，卓越翻譯品質', contextWindow: 200000, maxOutputTokens: 8192 },
                { value: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', type: 'balanced', desc: '1M上下文，延遲減半，成本降低83%', contextWindow: 1000000, maxOutputTokens: 4096 },
                { value: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'balanced', desc: '1M上下文，效率提升20-30%', contextWindow: 1000000, maxOutputTokens: 8192 },
                { value: 'mistralai/mistral-small-3.1-2503', name: 'Mistral Small 3.1', type: 'balanced', desc: '128K上下文，與NVIDIA合作優化', contextWindow: 128000, maxOutputTokens: 8192 }
            ],
            defaultModel: 'meta-llama/llama-4-maverick:free'
        },
        ollama: {
            models: [
                // 2025年最新模型 (需要手動配置上下文，預設僅2048 tokens)
                { value: 'gpt-oss:20b', name: 'GPT-OSS 20B', type: 'powerful', desc: 'OpenAI開源模型20B，強大推理和代理任務能力', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'gpt-oss:120b', name: 'GPT-OSS 120B', type: 'powerful', desc: 'OpenAI開源模型120B，頂級推理能力(需大量記憶體)', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'deepseek-r1', name: 'DeepSeek R1', type: 'powerful', desc: '推理優化模型，邏輯分析能力強', contextWindow: 128000, maxOutputTokens: 8192 },
                
                // Llama 系列
                { value: 'llama3.3:70b', name: 'Llama 3.3 70B', type: 'powerful', desc: '性能接近Llama 3.1 405B，記憶體需求較低', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'llama3.2:11b', name: 'Llama 3.2 Vision 11B', type: 'powerful', desc: '視覺理解模型，支援圖文理解，6GB記憶體', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'llama3.2:90b', name: 'Llama 3.2 Vision 90B', type: 'powerful', desc: '大型視覺模型，頂級圖文理解能力', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'llama3.1:8b', name: 'Llama 3.1 8B', type: 'balanced', desc: '通用能力強，4.7GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'llama3.2:3b', name: 'Llama 3.2 3B', type: 'fast', desc: '輕量級模型，2GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'llama3.2:1b', name: 'Llama 3.2 1B', type: 'fast', desc: '超輕量級，1.3GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                
                // Gemma 3 系列 (2025最新)
                { value: 'gemma3:27b', name: 'Gemma 3 27B', type: 'powerful', desc: 'Google最新模型，滑動窗口注意力機制，16GB記憶體', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'gemma2:9b', name: 'Gemma 2 9B', type: 'balanced', desc: 'Google開源模型，5.4GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'gemma2:2b', name: 'Gemma 2 2B', type: 'fast', desc: '輕量級Gemma，1.6GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                
                // Mistral 系列 (2025更新)
                { value: 'mistral-small3.1', name: 'Mistral Small 3.1', type: 'balanced', desc: '128K上下文，與NVIDIA合作，12B參數高效模型', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'mistral:7b', name: 'Mistral 7B', type: 'balanced', desc: '高效能開源模型，4.1GB記憶體需求', contextWindow: 128000, maxOutputTokens: 8192 },
                
                // Qwen 系列 (多語言優化)
                { value: 'qwen2.5:7b', name: 'Qwen 2.5 7B', type: 'balanced', desc: '128K上下文，18T tokens預訓練，多語言支援', contextWindow: 128000, maxOutputTokens: 8192 },
                { value: 'qwen2.5:72b', name: 'Qwen 2.5 72B', type: 'powerful', desc: '大型多語言模型，中文處理優秀', contextWindow: 128000, maxOutputTokens: 8192 }
            ],
            defaultModel: 'llama3.3:70b'
        }
    };

    // Function to get model info by API and model value
    function getModelInfo(api, modelValue) {
        const apiData = modelData[api];
        if (!apiData) return null;
        return apiData.models.find(model => model.value === modelValue);
    }

    // Function to calculate optimal batch size based on model's max output tokens (90% safety limit)
    function calculateOptimalBatchSize(contextWindow, maxOutputTokens) {
        // Use 90% of maxOutputTokens as the safe output limit
        const safeOutputTokens = Math.floor((maxOutputTokens || 4000) * 0.9);
        
        // Convert tokens to approximate character count (1 token ≈ 4 characters for mixed content)
        // This represents the maximum characters we should send in one batch
        const tokensToChars = 4;
        let optimalChars = Math.floor(safeOutputTokens * tokensToChars);
        
        // Ensure batch size is within acceptable bounds (minimum 1000)
        optimalChars = Math.max(1000, optimalChars);
        
        return optimalChars;
    }

    // Function to update input max limit based on model
    function updateBatchSizeInputLimit(modelInfo) {
        if (modelInfo && modelInfo.maxOutputTokens) {
            // Calculate max allowed batch size based on 90% of model's max output tokens
            const optimalBatchSize = calculateOptimalBatchSize(modelInfo.contextWindow, modelInfo.maxOutputTokens);
            
            // Update the input max attribute
            maxBatchLengthInput.max = optimalBatchSize;
            
            // Format max output tokens for display
            const outputDisplay = modelInfo.maxOutputTokens >= 1000 ? 
                `${Math.round(modelInfo.maxOutputTokens / 1000)}K` : 
                modelInfo.maxOutputTokens;
            
            // Update the help text to show the current limit
            const helpText = maxBatchLengthInput.parentNode.querySelector('.help-text');
            if (helpText) {
                helpText.textContent = `單次翻譯請求的最大字元數，範圍：1000-${optimalBatchSize} (基於 ${modelInfo.name} 的90%輸出限制: ${outputDisplay} tokens)。點擊「自動調整」根據所選模型優化批次大小`;
            }
        }
    }

    // Function to update batch size based on selected model
    async function updateBatchSizeForModel(selectedApi, selectedModel) {
        const modelInfo = getModelInfo(selectedApi, selectedModel);
        if (!modelInfo || !modelInfo.maxOutputTokens) return;
        
        const optimalBatchSize = calculateOptimalBatchSize(modelInfo.contextWindow, modelInfo.maxOutputTokens);
        
        // Update input limits first
        updateBatchSizeInputLimit(modelInfo);
        
        // Update the batch size input field
        maxBatchLengthInput.value = optimalBatchSize;
        
        // Force update the displayed value
        maxBatchLengthInput.dispatchEvent(new Event('input'));
        
        // Show a brief status message about the batch size adjustment
        showStatus(`批次大小已根據模型 ${modelInfo.name} 自動調整為 ${optimalBatchSize} 字元`, 'info');
        
        // Auto-save the batch size setting
        try {
            const currentSettings = await chrome.storage.sync.get([
                'selectedApi', 'apiKeys', 'targetLanguage', 'selectedModel', 
                'maxBatchElements', 'requestTimeout', 'debugMode'
            ]);
            
            await chrome.storage.sync.set({
                ...currentSettings,
                maxBatchLength: optimalBatchSize,
                selectedModel: selectedModel,
                selectedApi: selectedApi
            });
            
            // Update the status to show it's been saved
            setTimeout(() => {
                showStatus(`批次大小 ${optimalBatchSize} 字元已自動儲存`, 'success');
            }, 1500);
            
        } catch (error) {
            console.error('Failed to save batch size:', error);
            showStatus('自動儲存批次大小失敗，請手動儲存設定', 'error');
        }
    }

    // Title click handler for debug mode
    settingsTitle.addEventListener('click', () => {
        titleClickCount++;
        
        // Reset timer on each click
        if (titleClickTimer) {
            clearTimeout(titleClickTimer);
        }
        
        // Reset count after 2 seconds of no clicks
        titleClickTimer = setTimeout(() => {
            titleClickCount = 0;
        }, 2000);
        
        // Show debug section after 10 clicks
        if (titleClickCount >= 10) {
            debugSection.style.display = 'block';
            showStatus('除錯模式已解鎖！', 'success');
            titleClickCount = 0;
        }
    });

    async function loadSettings() {
        const settings = await chrome.storage.sync.get([
            'selectedApi',
            'apiKeys',
            'targetLanguage',
            'selectedModel',
            'maxBatchLength',
            'maxBatchElements',
            'requestTimeout',
            'debugMode',
            'enableLanguageDetection',
            'languageDetectionChars',
            'customCommonInstructions'
        ]);

        if (settings.selectedApi) {
            apiServiceSelect.value = settings.selectedApi;
            updateModelOptions(settings.selectedApi);
            showSelectedApiSection(settings.selectedApi);
        }

        if (settings.apiKeys) {
            Object.entries(settings.apiKeys).forEach(([api, key]) => {
                if (apiInputs[api]) {
                    apiInputs[api].value = key;
                }
            });
        }

        if (settings.targetLanguage) {
            targetLanguageSelect.value = settings.targetLanguage;
        }

        if (settings.selectedModel && settings.selectedApi) {
            // 確保模型選項已載入後再設定值，並檢查是否需要調整批次大小
            setTimeout(async () => {
                modelSelect.value = settings.selectedModel;
                
                // Check if current batch size matches the optimal size for the selected model
                const modelInfo = getModelInfo(settings.selectedApi, settings.selectedModel);
                if (modelInfo && modelInfo.maxOutputTokens) {
                    // Update input limits based on current model
                    updateBatchSizeInputLimit(modelInfo);
                    
                    const optimalBatchSize = calculateOptimalBatchSize(modelInfo.contextWindow, modelInfo.maxOutputTokens);
                    const currentBatchSize = parseInt(maxBatchLengthInput.value);
                    
                    if (currentBatchSize > optimalBatchSize) {
                        // Force adjust if current size exceeds model's limit
                        await updateBatchSizeForModel(settings.selectedApi, settings.selectedModel);
                        showStatus(`批次大小已自動調整以符合模型 ${modelInfo.name} 的限制`, 'info');
                    } else if (Math.abs(optimalBatchSize - currentBatchSize) > 1000) {
                        // Suggest optimization if difference is significant
                        const shouldUpdate = confirm(
                            `檢測到當前批次大小 (${currentBatchSize}) 與模型 ${modelInfo.name} 的建議大小 (${optimalBatchSize}) 不匹配。\n\n是否要自動調整為建議大小？`
                        );
                        
                        if (shouldUpdate) {
                            await updateBatchSizeForModel(settings.selectedApi, settings.selectedModel);
                        }
                    }
                }
            }, 100);
        }

        // Load batch settings
        maxBatchLengthInput.value = settings.maxBatchLength || 8000;
        maxBatchElementsInput.value = settings.maxBatchElements || 20;
        requestTimeoutInput.value = settings.requestTimeout || 60;
        
        // Load debug mode setting
        if (settings.debugMode !== undefined) {
            debugModeCheckbox.checked = settings.debugMode;
            // Show debug section if debug mode was previously enabled
            if (settings.debugMode) {
                debugSection.style.display = 'block';
                commonPromptEditor.style.display = 'block';
            }
        }
        
        // Load common instructions
        if (settings.customCommonInstructions !== undefined) {
            commonInstructionsTextarea.value = settings.customCommonInstructions;
        } else {
            // Load default instructions from background script
            await loadDefaultCommonInstructions();
        }
        
        // Load language detection setting
        languageDetectionCheckbox.checked = settings.enableLanguageDetection !== false;
        languageDetectionChars.value = settings.languageDetectionChars || 600;
    }

    function updateModelOptions(selectedApi) {
        const modelSelectionGroup = document.getElementById('model-selection-group');
        const noModelMessage = document.getElementById('no-model-message');
        const modelInfo = document.getElementById('model-info');
        
        if (!selectedApi || !modelData[selectedApi]) {
            modelSelectionGroup.style.display = 'none';
            noModelMessage.style.display = 'block';
            return;
        }

        // 顯示模型選擇區域
        modelSelectionGroup.style.display = 'block';
        noModelMessage.style.display = 'none';

        // 清空並重新填充模型選項
        modelSelect.innerHTML = '';
        
        const apiData = modelData[selectedApi];
        apiData.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });

        // 設置預設模型
        modelSelect.value = apiData.defaultModel;

        // 更新模型資訊
        updateModelInfo(selectedApi);
        
        // Manually trigger batch size update for the default model
        // We need to trigger this manually since programmatic value setting doesn't fire the change event
        const defaultModelInfo = getModelInfo(selectedApi, apiData.defaultModel);
        if (defaultModelInfo) {
            updateBatchSizeInputLimit(defaultModelInfo);
            // Also update the actual input field value
            const optimalBatchSize = calculateOptimalBatchSize(defaultModelInfo.contextWindow, defaultModelInfo.maxOutputTokens);
            maxBatchLengthInput.value = optimalBatchSize;
        }
        
        // 添加動畫效果
        modelSelectionGroup.style.opacity = '0';
        modelSelectionGroup.style.transform = 'translateY(10px)';
        setTimeout(() => {
            modelSelectionGroup.style.transition = 'all 0.3s ease';
            modelSelectionGroup.style.opacity = '1';
            modelSelectionGroup.style.transform = 'translateY(0)';
        }, 10);
    }

    function updateModelInfo(selectedApi) {
        const modelInfo = document.getElementById('model-info');
        const apiData = modelData[selectedApi];
        
        if (!apiData) return;

        let infoHtml = '<div>';
        apiData.models.forEach(model => {
            const badgeClass = model.type;
            const badgeText = model.type === 'fast' ? '快速' : 
                            model.type === 'balanced' ? '平衡' : '強大';
            
            // Format context window and max output tokens
            let tokenInfo = '';
            if (model.contextWindow) {
                const contextK = model.contextWindow >= 1000000 ? 
                    `${(model.contextWindow / 1000000).toFixed(1)}M` : 
                    `${Math.round(model.contextWindow / 1000)}K`;
                const outputK = model.maxOutputTokens >= 1000 ? 
                    `${Math.round(model.maxOutputTokens / 1000)}K` : 
                    model.maxOutputTokens;
                
                // Calculate optimal batch size for display
                const optimalBatchSize = calculateOptimalBatchSize(model.contextWindow, model.maxOutputTokens);
                const optimalK = optimalBatchSize >= 1000 ? 
                    `${Math.round(optimalBatchSize / 1000)}K` : 
                    optimalBatchSize;
                    
                tokenInfo = ` | 上下文: ${contextK} tokens, 輸出: ${outputK} tokens, 建議批次: ${optimalK} 字元 (90%輸出限制)`;
            }
            
            infoHtml += `
                <div class="model-card">
                    <span class="model-badge ${badgeClass}">${badgeText}</span>
                    <span><strong>${model.name}</strong>: ${model.desc}${tokenInfo}</span>
                </div>
            `;
        });
        infoHtml += '</div>';
        
        modelInfo.innerHTML = infoHtml;
    }

    function showSelectedApiSection(selectedApi) {
        // 隱藏所有 API 區段
        const apiSections = ['openai-section', 'claude-section', 'gemini-section', 'openrouter-section', 'ollama-section'];
        apiSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });

        // 隱藏 "請選擇服務" 訊息
        const noServiceMessage = document.getElementById('no-service-message');
        if (noServiceMessage) {
            noServiceMessage.style.display = 'none';
        }

        // 顯示選定的 API 區段
        if (selectedApi) {
            const selectedSection = document.getElementById(`${selectedApi}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
                // 添加動畫效果
                selectedSection.style.opacity = '0';
                selectedSection.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    selectedSection.style.transition = 'all 0.3s ease';
                    selectedSection.style.opacity = '1';
                    selectedSection.style.transform = 'translateY(0)';
                }, 10);
            }

            // 更新標題
            const apiNames = {
                openai: 'OpenAI',
                claude: 'Claude',
                gemini: 'Gemini',
                openrouter: 'OpenRouter',
                ollama: 'Ollama'
            };
            const titleElement = document.getElementById('api-section-title');
            if (titleElement) {
                titleElement.textContent = `${apiNames[selectedApi]} API Key 設定`;
            }
        }
    }

    apiServiceSelect.addEventListener('change', async (e) => {
        const selectedApi = e.target.value;
        if (selectedApi) {
            updateModelOptions(selectedApi);
            showSelectedApiSection(selectedApi);
            
            // Auto-adjust batch size for the default model of the selected API
            const apiData = modelData[selectedApi];
            if (apiData && apiData.defaultModel) {
                setTimeout(async () => {
                    // Update input limits and batch size for the new default model
                    const modelInfo = getModelInfo(selectedApi, apiData.defaultModel);
                    if (modelInfo) {
                        updateBatchSizeInputLimit(modelInfo);
                    }
                    await updateBatchSizeForModel(selectedApi, apiData.defaultModel);
                }, 200); // Small delay to ensure model select is populated
            }
        } else {
            updateModelOptions(null);
            showSelectedApiSection(null);
        }
    });

    // Add event listener for model selection change
    modelSelect.addEventListener('change', async (e) => {
        const selectedApi = apiServiceSelect.value;
        if (selectedApi) {
            await updateBatchSizeForModel(selectedApi, e.target.value);
        }
    });
    
    // Also listen for input events in case change doesn't fire
    modelSelect.addEventListener('input', async (e) => {
        const selectedApi = apiServiceSelect.value;
        if (selectedApi) {
            await updateBatchSizeForModel(selectedApi, e.target.value);
        }
    });

    // Add event listener for manual batch size adjustment button
    autoAdjustBatchSizeButton.addEventListener('click', async () => {
        const selectedApi = apiServiceSelect.value;
        const selectedModel = modelSelect.value;
        
        if (!selectedApi) {
            showStatus('請先選擇 API 服務', 'error');
            return;
        }
        
        if (!selectedModel) {
            showStatus('請先選擇模型', 'error');
            return;
        }
        
        const modelInfo = getModelInfo(selectedApi, selectedModel);
        if (!modelInfo || !modelInfo.contextWindow) {
            showStatus('該模型沒有可用的 Token 限制資訊', 'error');
            return;
        }
        
        const optimalBatchSize = calculateOptimalBatchSize(modelInfo.contextWindow, modelInfo.maxOutputTokens);
        const currentBatchSize = parseInt(maxBatchLengthInput.value);
        
        if (Math.abs(optimalBatchSize - currentBatchSize) < 100) {
            showStatus('當前批次大小已經接近最佳值', 'info');
            return;
        }
        
        await updateBatchSizeForModel(selectedApi, selectedModel);
    });

    saveButton.addEventListener('click', async () => {
        const selectedApi = apiServiceSelect.value;
        
        if (!selectedApi) {
            showStatus('請選擇一個 API 服務', 'error');
            return;
        }

        const apiKeys = {};
        Object.entries(apiInputs).forEach(([api, input]) => {
            if (input.value) {
                apiKeys[api] = input.value;
            }
        });

        if (!apiKeys[selectedApi] && selectedApi !== 'ollama') {
            showStatus(`請輸入 ${selectedApi.toUpperCase()} 的 API Key`, 'error');
            return;
        }

        // Validate batch settings
        const maxBatchLength = parseInt(maxBatchLengthInput.value);
        const maxBatchElements = parseInt(maxBatchElementsInput.value);
        const requestTimeout = parseInt(requestTimeoutInput.value);
        
        // Get current model's max output tokens to calculate limit
        const modelInfo = getModelInfo(selectedApi, modelSelect.value);
        let maxAllowedBatchSize = 60000; // Default fallback
        
        if (modelInfo && modelInfo.maxOutputTokens) {
            // Calculate max allowed batch size based on 90% of model's max output tokens
            maxAllowedBatchSize = calculateOptimalBatchSize(modelInfo.contextWindow, modelInfo.maxOutputTokens);
        }
        
        if (isNaN(maxBatchLength) || maxBatchLength < 1000 || maxBatchLength > maxAllowedBatchSize) {
            const outputDisplay = modelInfo && modelInfo.maxOutputTokens >= 1000 ? 
                `${Math.round(modelInfo.maxOutputTokens / 1000)}K` : 
                (modelInfo?.maxOutputTokens || '4K');
            showStatus(`批次最大字元數必須在 1000-${maxAllowedBatchSize} 範圍內 (基於所選模型 ${modelInfo?.name || '的'} 90%輸出限制: ${outputDisplay} tokens)`, 'error');
            return;
        }
        
        // Remove element count validation - no longer restricting element count
        if (isNaN(maxBatchElements) || maxBatchElements < 1) {
            showStatus('批次最大元素數必須大於 0', 'error');
            return;
        }
        
        if (isNaN(requestTimeout) || requestTimeout < 15 || requestTimeout > 120) {
            showStatus('請求超時時間必須在 15-120 秒範圍內', 'error');
            return;
        }

        await chrome.storage.sync.set({
            selectedApi: selectedApi,
            apiKeys: apiKeys,
            targetLanguage: targetLanguageSelect.value,
            selectedModel: modelSelect.value,
            maxBatchLength: maxBatchLength,
            maxBatchElements: maxBatchElements,
            requestTimeout: requestTimeout,
            debugMode: debugModeCheckbox.checked,
            enableLanguageDetection: languageDetectionCheckbox.checked,
            languageDetectionChars: parseInt(languageDetectionChars.value) || 600
        });

        showStatus('設定已儲存', 'success');
    });

    testButton.addEventListener('click', async () => {
        const selectedApi = apiServiceSelect.value;
        const apiKey = apiInputs[selectedApi]?.value;

        if (!selectedApi || (!apiKey && selectedApi !== 'ollama')) {
            showStatus('請先選擇 API 並輸入 API Key', 'error');
            return;
        }

        showStatus('測試中...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'testConnection',
                api: selectedApi,
                apiKey: apiKey,
                model: modelSelect.value
            });

            if (response.success) {
                showStatus('連接成功！', 'success');
            } else {
                showStatus(`連接失敗: ${response.error}`, 'error');
            }
        } catch (error) {
            showStatus(`測試失敗: ${error.message}`, 'error');
        }
    });

    function showStatus(message, type) {
        // 清除任何現有的計時器
        if (statusMessage.timeoutId) {
            clearTimeout(statusMessage.timeoutId);
        }
        
        // 設置訊息內容和樣式
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        // 對於錯誤訊息，延長顯示時間
        const displayDuration = type === 'error' ? 10000 : (type === 'info' ? 0 : 6000);
        
        if (displayDuration > 0) {
            statusMessage.timeoutId = setTimeout(() => {
                // 淡出動畫
                statusMessage.style.opacity = '0';
                statusMessage.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    statusMessage.className = 'status-message';
                    statusMessage.textContent = '';
                    statusMessage.style.opacity = '';
                    statusMessage.style.transform = '';
                }, 300); // 等待動畫完成
            }, displayDuration);
        }
    }


    // Expert modes management functions
    async function loadExpertModes() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getExpertModes' });
            if (response && response.expertModes) {
                renderExpertModesList(response.expertModes);
            }
        } catch (error) {
            console.error('Failed to load expert modes:', error);
        }
    }
    
    function renderExpertModesList(expertModes) {
        expertModesList.innerHTML = '';
        
        Object.entries(expertModes).forEach(([id, mode]) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'expert-mode-item';
            
            itemDiv.innerHTML = `
                <div class="expert-mode-info">
                    <div class="expert-mode-title">
                        ${mode.name}
                        ${mode.isDefault ? '<span class="expert-mode-default-badge">預設</span>' : ''}
                    </div>
                    <div class="expert-mode-description">${mode.description}</div>
                    <div class="expert-mode-id">${id}</div>
                </div>
                <div class="expert-mode-actions">
                    <button class="expert-mode-edit-btn" data-id="${id}">編輯</button>
                    <button class="expert-mode-delete-btn" data-id="${id}" ${mode.isDefault ? 'disabled' : ''}>
                        ${mode.isDefault ? '無法刪除' : '刪除'}
                    </button>
                </div>
            `;
            
            expertModesList.appendChild(itemDiv);
        });
        
        // Add event listeners for edit and delete buttons
        expertModesList.querySelectorAll('.expert-mode-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                editExpertMode(id, expertModes[id]);
            });
        });
        
        expertModesList.querySelectorAll('.expert-mode-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (!btn.disabled) {
                    deleteExpertMode(id);
                }
            });
        });
    }
    
    function openModal(title, isEditing = false) {
        modalTitle.textContent = title;
        expertModeModal.style.display = 'flex';
        expertModeIdInput.disabled = isEditing;
        
        if (!isEditing) {
            clearModalForm();
        }
    }
    
    function closeModal() {
        expertModeModal.style.display = 'none';
        currentEditingId = null;
        clearModalForm();
    }
    
    function clearModalForm() {
        expertModeIdInput.value = '';
        expertModeNameInput.value = '';
        expertModeDescInput.value = '';
        expertModePromptInput.value = '';
        expertModeIdInput.disabled = false;
    }
    
    function editExpertMode(id, mode) {
        currentEditingId = id;
        expertModeIdInput.value = id;
        expertModeNameInput.value = mode.name;
        expertModeDescInput.value = mode.description;
        expertModePromptInput.value = mode.systemPrompt;
        openModal('編輯專家模式', true);
    }
    
    async function saveExpertMode() {
        const id = expertModeIdInput.value.trim();
        const name = expertModeNameInput.value.trim();
        const description = expertModeDescInput.value.trim();
        const systemPrompt = expertModePromptInput.value.trim();
        
        if (!id || !name || !systemPrompt) {
            showStatus('請填寫所有必要欄位', 'error');
            return;
        }
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'saveExpertMode',
                id,
                name,
                description,
                systemPrompt,
                isEditing: currentEditingId !== null
            });
            
            if (response.success) {
                showStatus(currentEditingId ? '專家模式已更新' : '專家模式已新增', 'success');
                closeModal();
                await loadExpertModes();
            } else {
                showStatus(`儲存失敗: ${response.error}`, 'error');
            }
        } catch (error) {
            showStatus(`儲存失敗: ${error.message}`, 'error');
        }
    }
    
    async function deleteExpertMode(id) {
        if (!confirm('確定要刪除這個專家模式嗎？')) {
            return;
        }
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'deleteExpertMode',
                id
            });
            
            if (response.success) {
                showStatus('專家模式已刪除', 'success');
                await loadExpertModes();
            } else {
                showStatus(`刪除失敗: ${response.error}`, 'error');
            }
        } catch (error) {
            showStatus(`刪除失敗: ${error.message}`, 'error');
        }
    }
    
    // Event listeners for expert modes
    addExpertModeButton.addEventListener('click', () => {
        openModal('新增專家模式');
    });
    
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalSave.addEventListener('click', saveExpertMode);
    
    // Close modal when clicking outside
    expertModeModal.addEventListener('click', (e) => {
        if (e.target === expertModeModal) {
            closeModal();
        }
    });
    
    // i18n functions
    function updateUI() {
        // Update all elements with data-i18n attributes
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = window.i18n.getMessage(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = text;
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else if (element.tagName === 'TITLE') {
                element.textContent = text;
                document.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // Update language-specific content that can't use data-i18n
        updateLanguageOptions();
        updateDynamicContent();
    }
    
    function updateLanguageOptions() {
        // Update target language options
        if (targetLanguageSelect) {
            targetLanguageSelect.innerHTML = `
                <option value="zh-TW">${window.i18n.getMessage('lang_zh_tw')}</option>
                <option value="zh-CN">${window.i18n.getMessage('lang_zh_cn')}</option>
                <option value="en">${window.i18n.getMessage('lang_en')}</option>
                <option value="ja">${window.i18n.getMessage('lang_ja')}</option>
                <option value="ko">${window.i18n.getMessage('lang_ko')}</option>
                <option value="es">${window.i18n.getMessage('lang_es')}</option>
                <option value="fr">${window.i18n.getMessage('lang_fr')}</option>
                <option value="de">${window.i18n.getMessage('lang_de')}</option>
            `;
        }
    }
    
    function updateDynamicContent() {
        // Update buttons
        if (saveButton) saveButton.textContent = window.i18n.getMessage('save_settings_btn');
        if (testButton) testButton.textContent = window.i18n.getMessage('test_connection_btn');
        
        // Update placeholders that aren't handled by data-i18n
        const openaiKey = document.getElementById('openai-key');
        const claudeKey = document.getElementById('claude-key');
        const geminiKey = document.getElementById('gemini-key');
        const openrouterKey = document.getElementById('openrouter-key');
        const ollamaKey = document.getElementById('ollama-key');
        
        if (openaiKey) openaiKey.placeholder = 'sk-proj-...';
        if (claudeKey) claudeKey.placeholder = 'sk-ant-...';
        if (geminiKey) geminiKey.placeholder = 'AIza...';
        if (openrouterKey) openrouterKey.placeholder = 'sk-or-...';
        if (ollamaKey) {
            ollamaKey.placeholder = window.i18n.getMessage('no_api_key_required');
            ollamaKey.disabled = true;
            ollamaKey.style.backgroundColor = '#f5f5f5';
        }
        
        // Update elements with data-i18n-placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key && window.i18n.getMessage(key)) {
                element.placeholder = window.i18n.getMessage(key);
            }
        });
        
        // Update modal content
        updateModalContent();
    }
    
    function updateModalContent() {
        // Update modal elements
        const modalTitle = document.getElementById('modal-title');
        const modalCancel = document.getElementById('modal-cancel');
        const modalSave = document.getElementById('modal-save');
        const expertModeId = document.getElementById('expert-mode-id');
        const expertModeName = document.getElementById('expert-mode-name');
        const expertModeDesc = document.getElementById('expert-mode-description');
        const expertModePrompt = document.getElementById('expert-mode-prompt');
        
        if (modalCancel) modalCancel.textContent = window.i18n.getMessage('cancel');
        if (modalSave) modalSave.textContent = window.i18n.getMessage('save');
        
        if (expertModeId) expertModeId.placeholder = window.i18n.getMessage('mode_id_placeholder');
        if (expertModeName) expertModeName.placeholder = window.i18n.getMessage('mode_name_placeholder');
        if (expertModeDesc) expertModeDesc.placeholder = window.i18n.getMessage('mode_description_placeholder');
        if (expertModePrompt) expertModePrompt.placeholder = window.i18n.getMessage('system_prompt_placeholder');
        
        // Update add expert mode button
        const addExpertButton = document.getElementById('add-expert-mode-button');
        if (addExpertButton) {
            addExpertButton.innerHTML = `<span>${window.i18n.getMessage('add_expert_mode')}</span>`;
        }
    }
    
    // Language change handler
    interfaceLanguageSelect.addEventListener('change', async (e) => {
        const newLanguage = e.target.value;
        await window.i18n.setLanguage(newLanguage);
        
        // Update the HTML lang attribute
        document.documentElement.lang = newLanguage;
        
        // Update all UI text
        updateUI();
        
        // Show success message
        showStatus(window.i18n.getMessage('settings_saved'), 'success');
    });
    
    // Load and set initial interface language
    async function loadInterfaceLanguage() {
        try {
            const result = await chrome.storage.sync.get(['interfaceLanguage']);
            const savedLanguage = result.interfaceLanguage || 'en';
            
            // Set the select value
            interfaceLanguageSelect.value = savedLanguage;
            
            // Set the language in i18n system
            await window.i18n.setLanguage(savedLanguage);
            
            // Update HTML lang attribute
            document.documentElement.lang = savedLanguage;
            
            // Update UI
            updateUI();
        } catch (error) {
            console.warn('Failed to load interface language:', error);
            // Fallback to English
            interfaceLanguageSelect.value = 'en';
            await window.i18n.setLanguage('en');
            updateUI();
        }
    }
    
    // Common prompt functions
    async function loadDefaultCommonInstructions() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getDefaultCommonInstructions' });
            if (response && response.instructions) {
                commonInstructionsTextarea.value = response.instructions;
            }
        } catch (error) {
            console.error('Failed to load default common instructions:', error);
        }
    }
    
    async function applyCommonPromptChanges() {
        const customInstructions = commonInstructionsTextarea.value.trim();
        await chrome.storage.sync.set({ customCommonInstructions: customInstructions });
        showStatus('Common instructions updated successfully!', 'success');
    }
    
    async function resetCommonPromptToDefault() {
        await chrome.storage.sync.remove('customCommonInstructions');
        await loadDefaultCommonInstructions();
        showStatus('Common instructions reset to default!', 'success');
    }
    
    // Debug mode toggle handler
    debugModeCheckbox.addEventListener('change', () => {
        if (debugModeCheckbox.checked) {
            commonPromptEditor.style.display = 'block';
        } else {
            commonPromptEditor.style.display = 'none';
        }
    });
    
    // Common prompt event listeners
    resetCommonPromptButton.addEventListener('click', resetCommonPromptToDefault);
    applyCommonPromptButton.addEventListener('click', applyCommonPromptChanges);
    
    // Initialize interface language first
    await loadInterfaceLanguage();
    
    await loadSettings();
    await loadExpertModes();
});