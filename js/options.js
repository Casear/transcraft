document.addEventListener('DOMContentLoaded', async function() {
    const apiRadios = document.querySelectorAll('input[name="api"]');
    const saveButton = document.getElementById('save-button');
    const testButton = document.getElementById('test-button');
    const statusMessage = document.getElementById('status-message');
    const targetLanguageSelect = document.getElementById('target-language');
    const modelSelect = document.getElementById('model-select');
    
    // Batch settings elements
    const maxBatchLengthInput = document.getElementById('max-batch-length');
    const maxBatchElementsInput = document.getElementById('max-batch-elements');
    
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
        gemini: document.getElementById('gemini-key')
    };

    const modelData = {
        openai: {
            models: [
                // GPT-4.1 系列 (最新)
                { value: 'gpt-4.1', name: 'GPT-4.1', type: 'powerful', desc: '最新模型，在程式碼和指令遵循方面有重大改進' },
                { value: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', type: 'balanced', desc: '更快且經濟的版本，保持高品質翻譯' },
                { value: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', type: 'fast', desc: '首款 nano 模型，超快響應速度' },
                
                // GPT-4o 系列
                { value: 'gpt-4o', name: 'GPT-4o', type: 'powerful', desc: '多模態模型，優秀的多語言支援' },
                { value: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'balanced', desc: '平衡效能與成本的熱門選擇' },
                
                // GPT-4 系列
                { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'powerful', desc: '高準確度，適合複雜翻譯任務' },
                { value: 'gpt-4', name: 'GPT-4', type: 'powerful', desc: '經典強力模型' },
                
                // GPT-3.5 系列
                { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'fast', desc: '快速且成本效益高' },
                { value: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', type: 'fast', desc: '支援更長文本的快速模型' }
            ],
            defaultModel: 'gpt-4o-mini'
        },
        claude: {
            models: [
                // Claude 4 系列 (最新)
                { value: 'claude-4-opus', name: 'Claude Opus 4', type: 'powerful', desc: '最新最強大模型，在推理和程式碼方面表現卓越' },
                { value: 'claude-4-sonnet', name: 'Claude Sonnet 4', type: 'powerful', desc: '新標準的編碼和推理能力' },
                { value: 'claude-4-opus-4.1', name: 'Claude Opus 4.1', type: 'powerful', desc: '最智能的模型，複雜推理的新標杆' },
                
                // Claude 3.5 系列
                { value: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (升級版)', type: 'powerful', desc: '業界領先的智能水平，速度與品質兼具' },
                { value: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', type: 'fast', desc: '最快且最具成本效益的智能模型' },
                
                // Claude 3 系列
                { value: 'claude-3-opus-20240229', name: 'Claude 3 Opus', type: 'powerful', desc: '最智能的 Claude 3 模型，處理高度複雜任務' },
                { value: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', type: 'balanced', desc: '智能與速度的理想平衡' },
                { value: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', type: 'fast', desc: '快速響應，企業級工作負載' }
            ],
            defaultModel: 'claude-3-5-haiku-20241022'
        },
        gemini: {
            models: [
                // Gemini 2.5 系列 (最新)
                { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'powerful', desc: '最先進的思考模型，擅長複雜推理和分析' },
                { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'balanced', desc: '最佳性價比，具備思考能力的快速模型' },
                { value: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', type: 'fast', desc: '最經濟的高吞吐量處理模型' },
                
                // Gemini 2.0 系列
                { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'powerful', desc: '次世代功能，100萬 token 上下文窗口' },
                { value: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', type: 'fast', desc: '針對成本效率和低延遲優化' },
                
                // Gemini 1.5 系列 (逐步淘汰中，但仍可用)
                { value: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', type: 'powerful', desc: '多模態模型，可處理大量數據（2小時影片）' },
                { value: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash', type: 'fast', desc: '快速多功能模型，適合多樣化任務' },
                { value: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', type: 'fast', desc: '輕量級模型，適合簡單任務' }
            ],
            defaultModel: 'gemini-2.5-flash'
        }
    };

    async function loadSettings() {
        const settings = await chrome.storage.sync.get([
            'selectedApi',
            'apiKeys',
            'targetLanguage',
            'selectedModel',
            'maxBatchLength',
            'maxBatchElements'
        ]);

        if (settings.selectedApi) {
            document.getElementById(`${settings.selectedApi}-radio`).checked = true;
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
            // 確保模型選項已載入後再設定值
            setTimeout(() => {
                modelSelect.value = settings.selectedModel;
            }, 100);
        }

        // Load batch settings
        maxBatchLengthInput.value = settings.maxBatchLength || 8000;
        maxBatchElementsInput.value = settings.maxBatchElements || 20;
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
            
            infoHtml += `
                <div class="model-card">
                    <span class="model-badge ${badgeClass}">${badgeText}</span>
                    <span><strong>${model.name}</strong>: ${model.desc}</span>
                </div>
            `;
        });
        infoHtml += '</div>';
        
        modelInfo.innerHTML = infoHtml;
    }

    function showSelectedApiSection(selectedApi) {
        // 隱藏所有 API 區段
        const apiSections = ['openai-section', 'claude-section', 'gemini-section'];
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
                gemini: 'Gemini'
            };
            const titleElement = document.getElementById('api-section-title');
            if (titleElement) {
                titleElement.textContent = `${apiNames[selectedApi]} API Key 設定`;
            }
        }
    }

    apiRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateModelOptions(e.target.value);
            showSelectedApiSection(e.target.value);
        });
    });

    saveButton.addEventListener('click', async () => {
        const selectedApi = document.querySelector('input[name="api"]:checked')?.value;
        
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

        if (!apiKeys[selectedApi]) {
            showStatus(`請輸入 ${selectedApi.toUpperCase()} 的 API Key`, 'error');
            return;
        }

        // Validate batch settings
        const maxBatchLength = parseInt(maxBatchLengthInput.value);
        const maxBatchElements = parseInt(maxBatchElementsInput.value);
        
        if (isNaN(maxBatchLength) || maxBatchLength < 1000 || maxBatchLength > 32000) {
            showStatus('批次最大字元數必須在 1000-32000 範圍內', 'error');
            return;
        }
        
        if (isNaN(maxBatchElements) || maxBatchElements < 5 || maxBatchElements > 50) {
            showStatus('批次最大元素數必須在 5-50 範圍內', 'error');
            return;
        }

        await chrome.storage.sync.set({
            selectedApi: selectedApi,
            apiKeys: apiKeys,
            targetLanguage: targetLanguageSelect.value,
            selectedModel: modelSelect.value,
            maxBatchLength: maxBatchLength,
            maxBatchElements: maxBatchElements
        });

        showStatus('設定已儲存', 'success');
    });

    testButton.addEventListener('click', async () => {
        const selectedApi = document.querySelector('input[name="api"]:checked')?.value;
        const apiKey = apiInputs[selectedApi]?.value;

        if (!selectedApi || !apiKey) {
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
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        if (type !== 'info') {
            setTimeout(() => {
                statusMessage.className = 'status-message';
            }, 5000);
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
    
    await loadSettings();
    await loadExpertModes();
});