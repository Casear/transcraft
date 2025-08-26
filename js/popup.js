document.addEventListener('DOMContentLoaded', async function() {
    const translateButton = document.getElementById('translate-button');
    const buttonText = document.getElementById('button-text');
    const settingsButton = document.getElementById('settings-button');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const languageSelect = document.getElementById('popup-target-language');
    const expertModeSelect = document.getElementById('popup-expert-mode');

    let isTranslated = false;

    async function loadExpertModes() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getExpertModes' });
            if (response && response.expertModes) {
                expertModeSelect.innerHTML = '';
                
                Object.entries(response.expertModes).forEach(([id, mode]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = mode.name;
                    expertModeSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load expert modes:', error);
        }
    }

    async function checkAPIStatus() {
        const settings = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'targetLanguage', 'expertMode']);
        
        if (!settings.selectedApi || !settings.apiKeys?.[settings.selectedApi]) {
            statusIcon.className = 'status-icon error';
            statusText.textContent = '請設定 API Key';
            translateButton.disabled = true;
            return false;
        }
        
        statusIcon.className = 'status-icon ready';
        statusText.textContent = `已連接 ${settings.selectedApi.toUpperCase()}`;
        translateButton.disabled = false;
        
        if (settings.targetLanguage) {
            languageSelect.value = settings.targetLanguage;
        }
        
        if (settings.expertMode) {
            expertModeSelect.value = settings.expertMode;
        }
        
        return true;
    }

    async function checkTranslationStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTranslationStatus' });
            
            if (response && response.isTranslated) {
                isTranslated = true;
                updateButtonState();
            }
        } catch (error) {
            console.log('Content script not loaded yet');
        }
    }

    function updateButtonState() {
        if (isTranslated) {
            translateButton.classList.add('translated');
            buttonText.textContent = '恢復原文';
        } else {
            translateButton.classList.remove('translated');
            buttonText.textContent = '翻譯此頁面';
        }
    }

    translateButton.addEventListener('click', async () => {
        if (translateButton.disabled) return;

        translateButton.disabled = true;
        translateButton.classList.add('translating');
        
        const oldText = buttonText.textContent;
        buttonText.textContent = '翻譯中...';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, {
                action: 'toggleTranslation',
                targetLanguage: languageSelect.value,
                expertMode: expertModeSelect.value
            });

            isTranslated = !isTranslated;
            updateButtonState();
        } catch (error) {
            console.error('Translation error:', error);
            buttonText.textContent = oldText;
            
            if (error.message.includes('Cannot access contents')) {
                alert('無法在此頁面上執行翻譯');
            }
        } finally {
            translateButton.disabled = false;
            translateButton.classList.remove('translating');
        }
    });

    languageSelect.addEventListener('change', async () => {
        await chrome.storage.sync.set({ targetLanguage: languageSelect.value });
        
        // 通知内容脚本更新浮动按钮的语言显示
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, {
                action: 'updateLanguage',
                targetLanguage: languageSelect.value
            });
        } catch (error) {
            console.log('Content script not loaded yet');
        }
    });

    expertModeSelect.addEventListener('change', async () => {
        await chrome.storage.sync.set({ expertMode: expertModeSelect.value });
        
        // 通知内容脚本更新专家模式
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, {
                action: 'updateExpertMode',
                expertMode: expertModeSelect.value
            });
        } catch (error) {
            console.log('Content script not loaded yet');
        }
    });

    settingsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    await loadExpertModes();
    await checkAPIStatus();
    await checkTranslationStatus();
});