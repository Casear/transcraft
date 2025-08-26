document.addEventListener('DOMContentLoaded', async function() {
    // Initialize i18n first
    await window.i18n.initI18n();
    
    const translateButton = document.getElementById('translate-button');
    const buttonText = document.getElementById('button-text');
    const settingsButton = document.getElementById('settings-button');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const languageSelect = document.getElementById('popup-target-language');
    const expertModeSelect = document.getElementById('popup-expert-mode');

    let isTranslated = false;
    
    // Initialize UI with localized text
    function updateUI() {
        // Update all elements with data-i18n attributes
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = window.i18n.getMessage(key);
            
            if (element.tagName === 'TITLE') {
                element.textContent = text;
                document.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // Update language options
        populateLanguageOptions();
    }
    
    function populateLanguageOptions() {
        languageSelect.innerHTML = `
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
            statusText.textContent = window.i18n.getMessage('please_set_api_key');
            translateButton.disabled = true;
            return false;
        }
        
        statusIcon.className = 'status-icon ready';
        statusText.textContent = `${window.i18n.getMessage('connected_to')} ${settings.selectedApi.toUpperCase()}`;
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
            buttonText.textContent = window.i18n.getMessage('restore_original');
        } else {
            translateButton.classList.remove('translated');
            buttonText.textContent = window.i18n.getMessage('translate_page');
        }
    }

    translateButton.addEventListener('click', async () => {
        if (translateButton.disabled) return;

        translateButton.disabled = true;
        translateButton.classList.add('translating');
        
        const oldText = buttonText.textContent;
        buttonText.textContent = window.i18n.getMessage('translating');

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
                alert(window.i18n.getMessage('cannot_translate_on_page'));
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

    // Initialize UI with current language
    updateUI();
    
    await loadExpertModes();
    await checkAPIStatus();
    await checkTranslationStatus();
});