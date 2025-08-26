// YouTube字幕翻譯功能
class YouTubeSubtitleTranslator {
    constructor() {
        this.isActive = false;
        this.observer = null;
        this.overlay = null;
        this.toggleButton = null;
        this.currentSubtitle = '';
        this.translatedSubtitles = new Map();
        this.subtitleHistory = [];
        
        // 翻譯模式設定
        this.translationMode = 'realtime'; // 'realtime', 'batch', 'preload'
        this.batchBuffer = [];
        this.batchTimer = null;
        this.batchInterval = 5000; // 5秒批次處理
        this.maxBatchSize = 5; // 最多5句一批
        this.preloadedSubtitles = new Map(); // 預載字幕
        this.isPreloading = false;
        this.preloadProgress = 0;
        
        this.settings = {
            fontSize: '18px',
            fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            position: 'bottom',
            padding: '8px 16px',
            borderRadius: '6px',
            maxWidth: '85%',
            lineHeight: '1.4'
        };
        
        // 綁定方法以保持this上下文
        this.processSubtitleChange = this.processSubtitleChange.bind(this);
        this.handleTranslationResponse = this.handleTranslationResponse.bind(this);
        this.handleToggleClick = this.handleToggleClick.bind(this);
        this.processBatch = this.processBatch.bind(this);
    }

    // 檢查是否在YouTube影片頁面
    static isYouTubeVideo() {
        return window.location.hostname === 'www.youtube.com' && 
               window.location.pathname === '/watch' &&
               window.location.search.includes('v=');
    }

    // 等待YouTube播放器載入
    static waitForYouTubePlayer() {
        return new Promise((resolve) => {
            const checkPlayer = () => {
                const player = document.getElementById('movie_player') || 
                              document.querySelector('.html5-video-player');
                if (player) {
                    resolve(player);
                } else {
                    setTimeout(checkPlayer, 500);
                }
            };
            checkPlayer();
        });
    }

    // 獲取視頻ID
    getVideoId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('v');
    }

    // 嘗試獲取字幕檔數據
    async getSubtitleTracks() {
        try {
            const videoId = this.getVideoId();
            if (!videoId) return null;

            // 嘗試從頁面中提取字幕信息
            const scripts = document.querySelectorAll('script');
            let captionTracks = null;

            for (const script of scripts) {
                const content = script.textContent;
                if (content && content.includes('captionTracks')) {
                    try {
                        // 尋找 captionTracks 數組
                        const matches = content.match(/"captionTracks":\s*(\[.*?\])/);
                        if (matches && matches[1]) {
                            captionTracks = JSON.parse(matches[1]);
                            break;
                        }
                    } catch (e) {
                        console.warn('Failed to parse caption tracks:', e);
                    }
                }
            }

            if (captionTracks && captionTracks.length > 0) {
                console.log('Found caption tracks:', captionTracks);
                return captionTracks;
            }

            return null;
        } catch (error) {
            console.error('Error getting subtitle tracks:', error);
            return null;
        }
    }

    // 下載並解析字幕檔
    async downloadSubtitleFile(trackUrl) {
        try {
            const response = await fetch(trackUrl);
            const xmlText = await response.text();
            
            // 解析 XML 字幕
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const texts = xmlDoc.querySelectorAll('text');
            
            const subtitles = [];
            texts.forEach((text, index) => {
                const start = parseFloat(text.getAttribute('start'));
                const dur = parseFloat(text.getAttribute('dur')) || 2;
                const content = text.textContent.trim();
                
                if (content) {
                    subtitles.push({
                        index,
                        start,
                        end: start + dur,
                        text: content,
                        translated: null
                    });
                }
            });

            console.log(`Downloaded ${subtitles.length} subtitle entries`);
            return subtitles;
        } catch (error) {
            console.error('Error downloading subtitle file:', error);
            return null;
        }
    }

    // 預載並翻譯所有字幕
    async preloadAndTranslateSubtitles() {
        if (this.isPreloading) return;
        
        this.isPreloading = true;
        this.preloadProgress = 0;
        this.showPreloadingStatus();

        try {
            // 獲取字幕軌道
            const tracks = await this.getSubtitleTracks();
            if (!tracks || tracks.length === 0) {
                console.warn('No subtitle tracks found');
                this.isPreloading = false;
                this.hidePreloadingStatus();
                return false;
            }

            // 選擇第一個可用的字幕軌道（通常是自動生成的）
            const selectedTrack = tracks.find(track => 
                track.languageCode === 'en' || 
                track.languageCode === 'en-US' ||
                track.kind === 'asr'
            ) || tracks[0];

            if (!selectedTrack.baseUrl) {
                console.warn('No subtitle URL found');
                this.isPreloading = false;
                this.hidePreloadingStatus();
                return false;
            }

            // 下載字幕檔
            const subtitles = await this.downloadSubtitleFile(selectedTrack.baseUrl);
            if (!subtitles || subtitles.length === 0) {
                console.warn('Failed to download subtitles');
                this.isPreloading = false;
                this.hidePreloadingStatus();
                return false;
            }

            // 批次翻譯字幕
            await this.batchTranslateSubtitles(subtitles);
            
            this.isPreloading = false;
            this.hidePreloadingStatus();
            console.log('Subtitle preloading completed');
            return true;

        } catch (error) {
            console.error('Error preloading subtitles:', error);
            this.isPreloading = false;
            this.hidePreloadingStatus();
            return false;
        }
    }

    // 批次翻譯字幕
    async batchTranslateSubtitles(subtitles) {
        const batchSize = 20; // 每批20句
        const totalBatches = Math.ceil(subtitles.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, subtitles.length);
            const batch = subtitles.slice(start, end);
            
            // 合併文本進行翻譯
            const combinedText = batch.map(sub => sub.text).join('\n<<SUBTITLE_SEPARATOR>>\n');
            
            try {
                const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel', 'targetLanguage']);
                
                if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
                    console.warn('API not configured, skipping batch translation');
                    continue;
                }

                // 發送翻譯請求
                const response = await this.sendTranslationRequest({
                    action: 'translate',
                    text: combinedText,
                    targetLanguage: apiConfig.targetLanguage || 'zh-TW',
                    apiConfig: apiConfig,
                    expertMode: 'general',
                    source: 'youtube-subtitle-batch'
                });

                if (response && response.translation) {
                    // 分割翻譯結果
                    const translatedTexts = response.translation.split('<<SUBTITLE_SEPARATOR>>');
                    
                    // 儲存翻譯結果
                    batch.forEach((subtitle, index) => {
                        if (translatedTexts[index]) {
                            subtitle.translated = translatedTexts[index].trim();
                            this.preloadedSubtitles.set(subtitle.text, subtitle.translated);
                        }
                    });
                }

            } catch (error) {
                console.error('Batch translation failed:', error);
            }

            // 更新進度
            this.preloadProgress = ((i + 1) / totalBatches) * 100;
            this.updatePreloadingProgress();
            
            // 避免API調用過於頻繁
            await this.sleep(1000);
        }
    }

    // Promise based sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 發送翻譯請求（Promise版本）
    sendTranslationRequest(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response);
            });
        });
    }

    // 檢查是否有字幕
    async checkForSubtitles() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkForCaptions = () => {
                attempts++;
                
                // 嘗試找到字幕按鈕
                const captionButton = document.querySelector('.ytp-subtitles-button, .ytp-cc-button');
                
                if (captionButton) {
                    const isUnavailable = captionButton.classList.contains('ytp-subtitles-button-unavailable') ||
                                         captionButton.getAttribute('aria-disabled') === 'true';
                    
                    console.log('Caption button found:', captionButton, 'unavailable:', isUnavailable);
                    resolve(!isUnavailable);
                    return;
                }
                
                // 如果還沒找到按鈕且未超過最大嘗試次數，繼續嘗試
                if (attempts < maxAttempts) {
                    console.log(`Checking for subtitles... attempt ${attempts}/${maxAttempts}`);
                    setTimeout(checkForCaptions, 500);
                } else {
                    // 最終回退：假設有字幕可用（因為用戶可以手動開啟）
                    console.log('Caption button not found after max attempts, assuming subtitles available');
                    resolve(true);
                }
            };
            
            // 延遲開始檢查，等待頁面穩定
            setTimeout(checkForCaptions, 1000);
        });
    }

    // 初始化覆蓋層
    initializeOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'youtube-subtitle-overlay';
        this.overlay.className = 'youtube-subtitle-overlay';
        
        this.applyOverlayStyles();

        // 找到影片容器並添加覆蓋層
        const videoContainer = document.querySelector('#movie_player') || 
                              document.querySelector('.html5-video-player');
        
        if (videoContainer) {
            videoContainer.style.position = 'relative';
            videoContainer.appendChild(this.overlay);
            console.log('YouTube subtitle overlay initialized');
        } else {
            console.warn('Could not find video container for overlay');
        }
    }

    // 應用覆蓋層樣式
    applyOverlayStyles() {
        if (!this.overlay) return;

        this.overlay.style.cssText = `
            position: absolute;
            z-index: 9999;
            left: 50%;
            transform: translateX(-50%);
            ${this.settings.position}: 80px;
            max-width: ${this.settings.maxWidth};
            background: ${this.settings.backgroundColor};
            color: ${this.settings.color};
            font-size: ${this.settings.fontSize};
            font-family: ${this.settings.fontFamily};
            line-height: ${this.settings.lineHeight};
            padding: ${this.settings.padding};
            border-radius: ${this.settings.borderRadius};
            text-align: center;
            word-wrap: break-word;
            white-space: pre-line;
            display: none;
            pointer-events: none;
            transition: opacity 0.3s ease, transform 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
    }

    // 啟動字幕監控
    startSubtitleMonitoring() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // 尋找字幕容器
        const findSubtitleContainer = () => {
            return document.querySelector('.ytp-caption-window-container') || 
                   document.querySelector('.caption-window') ||
                   document.querySelector('.ytp-caption-window-bottom');
        };

        const subtitleContainer = findSubtitleContainer();
        
        if (!subtitleContainer) {
            console.warn('Subtitle container not found, retrying...');
            setTimeout(() => this.startSubtitleMonitoring(), 2000);
            return;
        }

        console.log('Found subtitle container:', subtitleContainer);

        this.observer = new MutationObserver((mutations) => {
            if (!this.isActive) return;

            let hasSubtitleChanges = false;

            mutations.forEach((mutation) => {
                // 檢查新增的節點
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const subtitleSegments = node.querySelectorAll('.ytp-caption-segment');
                        if (subtitleSegments.length > 0) {
                            this.processSubtitleSegments(subtitleSegments);
                            hasSubtitleChanges = true;
                        }
                    }
                });

                // 檢查修改的屬性（字幕內容可能更新）
                if (mutation.type === 'attributes' && mutation.target.classList.contains('ytp-caption-segment')) {
                    this.processSubtitleSegments([mutation.target]);
                    hasSubtitleChanges = true;
                }

                // 檢查字幕內容變化
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const segments = subtitleContainer.querySelectorAll('.ytp-caption-segment');
                    if (segments.length > 0) {
                        this.processSubtitleSegments(segments);
                        hasSubtitleChanges = true;
                    }
                }
            });

            // 如果沒有檢測到變化，但有可見的字幕，也處理一次
            if (!hasSubtitleChanges) {
                const segments = subtitleContainer.querySelectorAll('.ytp-caption-segment');
                if (segments.length > 0) {
                    this.processSubtitleSegments(segments);
                }
            }
        });

        this.observer.observe(subtitleContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
            attributeFilter: ['class', 'style']
        });

        // 定期檢查字幕（備用機制）
        this.subtitleCheckInterval = setInterval(() => {
            if (this.isActive) {
                const segments = subtitleContainer.querySelectorAll('.ytp-caption-segment');
                if (segments.length > 0) {
                    this.processSubtitleSegments(segments);
                }
            }
        }, 1000);

        console.log('YouTube subtitle monitoring started');
    }

    // 處理字幕片段
    processSubtitleSegments(segments) {
        if (!segments || segments.length === 0) {
            // 沒有字幕片段時隱藏翻譯
            this.hideSubtitle();
            return;
        }

        // 提取文本內容
        const text = Array.from(segments)
            .map(segment => {
                // 嘗試不同的文本提取方法
                const textContent = segment.textContent || segment.innerText || '';
                return textContent.trim();
            })
            .filter(text => text.length > 0)
            .join(' ')
            .trim();
        
        console.log('Processed subtitle segments:', text);
        
        if (text && text !== this.currentSubtitle) {
            this.currentSubtitle = text;
            
            // 記錄字幕歷史
            this.subtitleHistory.push({
                text: text,
                timestamp: Date.now(),
                videoTime: this.getCurrentVideoTime()
            });

            // 根據翻譯模式處理
            switch (this.translationMode) {
                case 'preload':
                    this.handlePreloadMode(text);
                    break;
                case 'batch':
                    this.handleBatchMode(text);
                    break;
                case 'realtime':
                default:
                    this.handleRealtimeMode(text);
                    break;
            }
        } else if (!text && this.currentSubtitle) {
            // 字幕消失時隱藏翻譯
            console.log('Hiding subtitle - no text detected');
            this.currentSubtitle = '';
            this.hideSubtitle();
        }
    }

    // 處理預載模式
    handlePreloadMode(text) {
        // 檢查預載翻譯
        if (this.preloadedSubtitles.has(text)) {
            console.log('Using preloaded translation for:', text);
            this.showTranslatedSubtitle(this.preloadedSubtitles.get(text));
        } else if (this.translatedSubtitles.has(text)) {
            console.log('Using cached translation for:', text);
            this.showTranslatedSubtitle(this.translatedSubtitles.get(text));
        } else {
            console.log('No preloaded translation found, showing original:', text);
            this.showTranslatedSubtitle(text);
        }
    }

    // 處理批次模式
    handleBatchMode(text) {
        // 檢查是否已有翻譯
        if (this.translatedSubtitles.has(text)) {
            console.log('Using cached translation for:', text);
            this.showTranslatedSubtitle(this.translatedSubtitles.get(text));
            return;
        }

        // 加入批次緩衝區
        const existingIndex = this.batchBuffer.findIndex(item => item.text === text);
        if (existingIndex === -1) {
            this.batchBuffer.push({
                text: text,
                timestamp: Date.now(),
                videoTime: this.getCurrentVideoTime()
            });
        }

        // 顯示原文（暫時）
        this.showTranslatedSubtitle(`${text} [批次翻譯中...]`);

        // 檢查是否需要立即處理批次
        if (this.batchBuffer.length >= this.maxBatchSize) {
            this.processBatch();
        } else {
            // 重置批次計時器
            this.resetBatchTimer();
        }
    }

    // 處理即時模式
    handleRealtimeMode(text) {
        // 檢查是否已有翻譯
        if (this.translatedSubtitles.has(text)) {
            console.log('Using cached translation for:', text);
            this.showTranslatedSubtitle(this.translatedSubtitles.get(text));
        } else {
            console.log('Requesting realtime translation for:', text);
            this.requestTranslation(text);
        }
    }

    // 重置批次計時器
    resetBatchTimer() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        
        this.batchTimer = setTimeout(() => {
            if (this.batchBuffer.length > 0) {
                this.processBatch();
            }
        }, this.batchInterval);
    }

    // 處理批次翻譯
    async processBatch() {
        if (this.batchBuffer.length === 0) return;

        console.log(`Processing batch of ${this.batchBuffer.length} subtitles`);
        
        // 清除計時器
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        // 準備批次數據
        const batchToProcess = [...this.batchBuffer];
        this.batchBuffer = [];

        // 合併文本
        const combinedText = batchToProcess.map(item => item.text).join('\n<<SUBTITLE_SEPARATOR>>\n');

        try {
            const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel', 'targetLanguage']);
            
            if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
                console.warn('API not configured for batch translation');
                // 顯示原文
                batchToProcess.forEach(item => {
                    this.translatedSubtitles.set(item.text, item.text);
                });
                return;
            }

            // 發送批次翻譯請求
            const response = await this.sendTranslationRequest({
                action: 'translate',
                text: combinedText,
                targetLanguage: apiConfig.targetLanguage || 'zh-TW',
                apiConfig: apiConfig,
                expertMode: 'general',
                source: 'youtube-subtitle-batch'
            });

            if (response && response.translation) {
                // 分割翻譯結果
                const translatedTexts = response.translation.split('<<SUBTITLE_SEPARATOR>>');
                
                // 儲存翻譯結果
                batchToProcess.forEach((item, index) => {
                    const translation = translatedTexts[index]?.trim() || item.text;
                    this.translatedSubtitles.set(item.text, translation);
                    
                    // 如果是當前字幕，立即更新顯示
                    if (item.text === this.currentSubtitle) {
                        this.showTranslatedSubtitle(translation);
                    }
                });

                console.log(`Batch translation completed for ${batchToProcess.length} items`);
            } else {
                console.warn('Batch translation failed');
                // 保存原文
                batchToProcess.forEach(item => {
                    this.translatedSubtitles.set(item.text, item.text);
                    if (item.text === this.currentSubtitle) {
                        this.showTranslatedSubtitle(item.text);
                    }
                });
            }

        } catch (error) {
            console.error('Batch translation error:', error);
            // 保存原文
            batchToProcess.forEach(item => {
                this.translatedSubtitles.set(item.text, item.text);
                if (item.text === this.currentSubtitle) {
                    this.showTranslatedSubtitle(item.text);
                }
            });
        }
    }

    // 獲取當前影片時間
    getCurrentVideoTime() {
        const video = document.querySelector('video');
        return video ? Math.round(video.currentTime) : 0;
    }

    // 請求翻譯
    async requestTranslation(text) {
        try {
            const apiConfig = await chrome.storage.sync.get(['selectedApi', 'apiKeys', 'selectedModel', 'targetLanguage']);
            
            if (!apiConfig.selectedApi || !apiConfig.apiKeys?.[apiConfig.selectedApi]) {
                console.warn('API not configured, skipping translation');
                this.showTranslatedSubtitle(text); // 顯示原文
                return;
            }

            // 顯示翻譯中狀態
            this.showTranslatingIndicator(text);
            this.showTranslatingStatus();

            // 發送翻譯請求到背景腳本
            chrome.runtime.sendMessage({
                action: 'translate',
                text: text,
                targetLanguage: apiConfig.targetLanguage || 'zh-TW',
                apiConfig: apiConfig,
                expertMode: 'general',
                source: 'youtube-subtitle'
            }, (response) => {
                this.hideTranslatingStatus();
                
                if (response && response.translation) {
                    // 緩存翻譯結果
                    this.translatedSubtitles.set(text, response.translation);
                    this.showTranslatedSubtitle(response.translation);
                } else {
                    console.warn('Translation failed, showing original text');
                    this.showTranslatedSubtitle(text);
                }
            });

        } catch (error) {
            console.error('Translation request failed:', error);
            this.hideTranslatingStatus();
            this.showTranslatedSubtitle(text);
        }
    }

    // 顯示翻譯中狀態
    showTranslatingIndicator(originalText) {
        if (!this.overlay) return;

        this.overlay.innerHTML = `${originalText} <span style="opacity: 0.7; font-size: 0.9em;">(...翻譯中)</span>`;
        this.overlay.style.display = 'block';
        this.overlay.style.opacity = '0.8';
        this.overlay.style.transform = 'translateX(-50%) translateY(0)';
    }

    // 顯示翻譯字幕
    showTranslatedSubtitle(translatedText) {
        if (!this.overlay) return;

        this.overlay.textContent = translatedText;
        this.overlay.style.display = 'block';
        this.overlay.style.opacity = '1';
        this.overlay.style.transform = 'translateX(-50%) translateY(0)';
    }

    // 隱藏字幕
    hideSubtitle() {
        if (!this.overlay) return;

        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'translateX(-50%) translateY(10px)';
        
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
        }, 300);
    }

    // 處理翻譯響應
    handleTranslationResponse(message, sender, sendResponse) {
        if (message.action === 'translationComplete' && message.source === 'youtube-subtitle') {
            this.translatedSubtitles.set(message.originalText, message.translatedText);
            
            // 如果是當前字幕，立即顯示
            if (message.originalText === this.currentSubtitle) {
                this.showTranslatedSubtitle(message.translatedText);
            }
        }
    }

    // 處理切換點擊事件
    handleToggleClick() {
        this.toggle();
        this.updateToggleButtonState();
    }

    // 創建工具欄切換按鈕
    createToggleButton() {
        if (this.toggleButton) return;

        // 等待 YouTube 控制欄載入
        const controlBar = document.querySelector('.ytp-right-controls');
        if (!controlBar) {
            setTimeout(() => this.createToggleButton(), 1000);
            return;
        }

        // 創建按鈕容器
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'ytp-button youtube-translate-toggle';
        this.toggleButton.setAttribute('aria-label', '字幕翻譯');
        this.toggleButton.setAttribute('title', '開啟/關閉字幕翻譯');
        this.toggleButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            cursor: pointer;
            position: relative;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        `;

        // 創建按鈕圖示 (翻譯符號)
        const buttonIcon = document.createElement('div');
        buttonIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
        `;
        
        // 添加狀態指示器
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'translate-status-indicator';
        statusIndicator.style.cssText = `
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4CAF50;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        this.toggleButton.appendChild(statusIndicator);
        buttonIcon.style.cssText = `
            pointer-events: none;
            transition: transform 0.2s ease;
        `;

        this.toggleButton.appendChild(buttonIcon);

        // 添加點擊事件
        this.toggleButton.addEventListener('click', this.handleToggleClick);
        
        // 添加右鍵菜單功能
        this.toggleButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showModeSelectionMenu(e);
        });
        
        // 添加懸停效果
        this.toggleButton.addEventListener('mouseenter', () => {
            this.toggleButton.style.opacity = '1';
            buttonIcon.style.transform = 'scale(1.1)';
        });
        
        this.toggleButton.addEventListener('mouseleave', () => {
            this.toggleButton.style.opacity = this.isActive ? '1' : '0.8';
            buttonIcon.style.transform = 'scale(1)';
        });

        // 將按鈕插入到控制欄
        controlBar.insertBefore(this.toggleButton, controlBar.firstChild);
        
        // 初始狀態
        this.updateToggleButtonState();
        
        console.log('YouTube translate toggle button created');
    }

    // 更新切換按鈕狀態
    updateToggleButtonState() {
        if (!this.toggleButton) return;
        
        const buttonIcon = this.toggleButton.querySelector('svg');
        const statusIndicator = this.toggleButton.querySelector('.translate-status-indicator');
        
        if (this.isActive) {
            this.toggleButton.style.opacity = '1';
            this.toggleButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            this.toggleButton.setAttribute('title', '關閉字幕翻譯 (已啟用)');
            if (buttonIcon) {
                buttonIcon.style.fill = '#00d4ff'; // YouTube 藍色
            }
            if (statusIndicator) {
                statusIndicator.style.opacity = '1';
                statusIndicator.style.background = '#4CAF50'; // 綠色表示啟用
            }
        } else {
            this.toggleButton.style.opacity = '0.8';
            this.toggleButton.style.backgroundColor = 'transparent';
            this.toggleButton.setAttribute('title', '開啟字幕翻譯');
            if (buttonIcon) {
                buttonIcon.style.fill = 'white';
            }
            if (statusIndicator) {
                statusIndicator.style.opacity = '0';
            }
        }
    }

    // 顯示翻譯工作狀態
    showTranslatingStatus() {
        const statusIndicator = this.toggleButton?.querySelector('.translate-status-indicator');
        if (statusIndicator && this.isActive) {
            statusIndicator.style.background = '#FF9800'; // 橙色表示正在翻譯
            statusIndicator.style.opacity = '1';
        }
    }

    // 隱藏翻譯工作狀態
    hideTranslatingStatus() {
        const statusIndicator = this.toggleButton?.querySelector('.translate-status-indicator');
        if (statusIndicator && this.isActive) {
            statusIndicator.style.background = '#4CAF50'; // 恢復綠色
        }
    }

    // 顯示預載狀態
    showPreloadingStatus() {
        if (!this.toggleButton) return;
        
        const statusIndicator = this.toggleButton.querySelector('.translate-status-indicator');
        if (statusIndicator) {
            statusIndicator.style.background = '#2196F3'; // 藍色表示預載中
            statusIndicator.style.opacity = '1';
        }
        
        this.toggleButton.setAttribute('title', '正在預載字幕並翻譯...');
        
        // 創建預載進度顯示
        this.createPreloadProgressOverlay();
    }

    // 隱藏預載狀態
    hidePreloadingStatus() {
        if (!this.toggleButton) return;
        
        const statusIndicator = this.toggleButton.querySelector('.translate-status-indicator');
        if (statusIndicator) {
            statusIndicator.style.background = '#4CAF50'; // 恢復綠色
        }
        
        this.toggleButton.setAttribute('title', '字幕翻譯已就緒');
        
        // 移除預載進度顯示
        this.removePreloadProgressOverlay();
    }

    // 更新預載進度
    updatePreloadingProgress() {
        const progressOverlay = document.querySelector('.youtube-preload-progress');
        if (progressOverlay) {
            const progressBar = progressOverlay.querySelector('.progress-bar');
            const progressText = progressOverlay.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${this.preloadProgress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `預載翻譯中... ${Math.round(this.preloadProgress)}%`;
            }
        }
    }

    // 創建預載進度覆蓋層
    createPreloadProgressOverlay() {
        // 避免重複創建
        if (document.querySelector('.youtube-preload-progress')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'youtube-preload-progress';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 250px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
        `;
        
        overlay.innerHTML = `
            <div class="progress-text">準備預載字幕...</div>
            <div style="background: rgba(255,255,255,0.2); height: 4px; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                <div class="progress-bar" style="background: #2196F3; height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 2px;"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // 移除預載進度覆蓋層
    removePreloadProgressOverlay() {
        const overlay = document.querySelector('.youtube-preload-progress');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-10px)';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // 設置翻譯模式
    setTranslationMode(mode) {
        const validModes = ['realtime', 'batch', 'preload'];
        if (validModes.includes(mode)) {
            this.translationMode = mode;
            console.log(`Translation mode set to: ${mode}`);
            
            // 清理現有狀態
            this.batchBuffer = [];
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
                this.batchTimer = null;
            }
            
            return true;
        }
        return false;
    }

    // 獲取翻譯模式狀態
    getTranslationModeStatus() {
        return {
            mode: this.translationMode,
            isPreloading: this.isPreloading,
            preloadProgress: this.preloadProgress,
            batchBufferSize: this.batchBuffer.length,
            cachedTranslations: this.translatedSubtitles.size,
            preloadedTranslations: this.preloadedSubtitles.size
        };
    }

    // 顯示模式選擇菜單
    showModeSelectionMenu(event) {
        // 移除現有菜單
        this.hideModeSelectionMenu();
        
        const menu = document.createElement('div');
        menu.className = 'youtube-translate-mode-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: rgba(28, 28, 28, 0.95);
            border: 1px solid #444;
            border-radius: 8px;
            padding: 8px 0;
            z-index: 10001;
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 14px;
            color: #fff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            min-width: 200px;
        `;

        const modes = [
            { value: 'realtime', name: '即時翻譯', desc: '逐句翻譯，響應最快' },
            { value: 'batch', name: '批次翻譯', desc: '累積翻譯，成本較低' },
            { value: 'preload', name: '預載翻譯', desc: '一次性翻譯，品質最佳' }
        ];

        modes.forEach(mode => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                gap: 2px;
                transition: background-color 0.2s;
                ${mode.value === this.translationMode ? 'background: rgba(0, 212, 255, 0.1); border-left: 3px solid #00d4ff;' : ''}
            `;

            item.innerHTML = `
                <div style="font-weight: 500;">
                    ${mode.name}
                    ${mode.value === this.translationMode ? '<span style="color: #00d4ff; font-size: 12px;"> ✓</span>' : ''}
                </div>
                <div style="font-size: 12px; opacity: 0.7;">${mode.desc}</div>
            `;

            item.addEventListener('mouseenter', () => {
                if (mode.value !== this.translationMode) {
                    item.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            });

            item.addEventListener('mouseleave', () => {
                if (mode.value !== this.translationMode) {
                    item.style.background = 'transparent';
                }
            });

            item.addEventListener('click', () => {
                this.switchToMode(mode.value);
                this.hideModeSelectionMenu();
            });

            menu.appendChild(item);
        });

        // 添加狀態顯示
        const statusItem = document.createElement('div');
        statusItem.style.cssText = `
            padding: 8px 16px;
            border-top: 1px solid #444;
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.7;
        `;
        statusItem.innerHTML = `
            <div>狀態: ${this.isActive ? '已啟用' : '未啟用'}</div>
            <div>緩存: ${this.translatedSubtitles.size} 句</div>
            ${this.translationMode === 'preload' ? `<div>預載: ${this.preloadedSubtitles.size} 句</div>` : ''}
        `;
        menu.appendChild(statusItem);

        document.body.appendChild(menu);

        // 點擊外部關閉菜單
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                this.hideModeSelectionMenu();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    // 隱藏模式選擇菜單
    hideModeSelectionMenu() {
        const menu = document.querySelector('.youtube-translate-mode-menu');
        if (menu) {
            menu.remove();
        }
    }

    // 切換到指定模式
    async switchToMode(newMode) {
        if (newMode === this.translationMode) return;
        
        console.log(`Switching translation mode from ${this.translationMode} to ${newMode}`);
        
        const wasActive = this.isActive;
        
        // 停止當前翻譯
        if (this.isActive) {
            this.stop();
        }
        
        // 設置新模式
        this.setTranslationMode(newMode);
        
        // 保存到設置
        chrome.storage.sync.set({ youtubeTranslationMode: newMode });
        
        // 如果之前是啟用的，重新啟動
        if (wasActive) {
            setTimeout(() => {
                this.start(newMode);
            }, 500);
        }
        
        // 更新按鈕提示
        this.updateToggleButtonState();
        
        // 顯示模式切換通知
        this.showModeChangeNotification(newMode);
    }

    // 顯示模式切換通知
    showModeChangeNotification(mode) {
        const modeNames = {
            'realtime': '即時翻譯',
            'batch': '批次翻譯',  
            'preload': '預載翻譯'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            z-index: 10002;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            animation: fadeInOut 2s ease-in-out forwards;
        `;
        
        notification.textContent = `已切換至 ${modeNames[mode]} 模式`;
        
        // 添加動畫CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    }

    // 移除切換按鈕
    removeToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.remove();
            this.toggleButton = null;
        }
    }

    // 處理字幕變化（用於MutationObserver）
    processSubtitleChange(mutations) {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const subtitleElements = mutation.target.querySelectorAll('.ytp-caption-segment');
                if (subtitleElements.length > 0) {
                    this.processSubtitleSegments(subtitleElements);
                }
            }
        });
    }

    // 啟動翻譯功能
    async start(mode = null) {
        if (this.isActive) return;

        console.log('Starting YouTube subtitle translator...');
        
        try {
            // 設置翻譯模式
            if (mode) {
                this.setTranslationMode(mode);
            }
            
            // 等待播放器載入
            await YouTubeSubtitleTranslator.waitForYouTubePlayer();
            
            // 檢查是否有字幕
            const hasSubtitles = await this.checkForSubtitles();
            
            if (!hasSubtitles) {
                console.warn('No subtitles available for this video');
                return false;
            }

            this.isActive = true;
            
            // 初始化覆蓋層
            this.initializeOverlay();
            
            // 根據模式進行初始化
            if (this.translationMode === 'preload') {
                // 預載模式：先下載並翻譯所有字幕
                const preloadSuccess = await this.preloadAndTranslateSubtitles();
                if (!preloadSuccess) {
                    console.warn('Preload failed, falling back to realtime mode');
                    this.translationMode = 'realtime';
                }
            }
            
            // 開始監控字幕
            this.startSubtitleMonitoring();
            
            // 監聽來自背景腳本的訊息
            chrome.runtime.onMessage.addListener(this.handleTranslationResponse);
            
            // 更新按鈕狀態
            this.updateToggleButtonState();
            
            console.log(`YouTube subtitle translator started successfully in ${this.translationMode} mode`);
            return true;
            
        } catch (error) {
            console.error('Failed to start YouTube subtitle translator:', error);
            return false;
        }
    }

    // 停止翻譯功能
    stop() {
        if (!this.isActive) return;

        console.log('Stopping YouTube subtitle translator...');
        
        this.isActive = false;
        
        // 停止觀察器
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // 清除定期檢查
        if (this.subtitleCheckInterval) {
            clearInterval(this.subtitleCheckInterval);
            this.subtitleCheckInterval = null;
        }
        
        // 清除批次計時器
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        // 移除覆蓋層
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        // 移除預載進度覆蓋層
        this.removePreloadProgressOverlay();
        
        // 移除訊息監聽器
        chrome.runtime.onMessage.removeListener(this.handleTranslationResponse);
        
        // 更新按鈕狀態
        this.updateToggleButtonState();
        
        // 清理數據
        this.currentSubtitle = '';
        this.translatedSubtitles.clear();
        this.subtitleHistory = [];
        this.batchBuffer = [];
        this.preloadedSubtitles.clear();
        this.isPreloading = false;
        this.preloadProgress = 0;
        
        console.log('YouTube subtitle translator stopped');
    }

    // 切換翻譯功能
    async toggle() {
        if (this.isActive) {
            this.stop();
            return false;
        } else {
            return await this.start();
        }
    }

    // 更新設定
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        this.applyOverlayStyles();
    }

    // 獲取字幕歷史
    getSubtitleHistory() {
        return [...this.subtitleHistory];
    }

    // 清除翻譯緩存
    clearCache() {
        this.translatedSubtitles.clear();
        console.log('Translation cache cleared');
    }
}

// 全域實例
window.youtubeSubtitleTranslator = null;

// 初始化YouTube字幕翻譯
function initializeYouTubeSubtitleTranslator() {
    if (!YouTubeSubtitleTranslator.isYouTubeVideo()) {
        return;
    }

    // 如果已有實例，先清理
    if (window.youtubeSubtitleTranslator) {
        window.youtubeSubtitleTranslator.stop();
        window.youtubeSubtitleTranslator.removeToggleButton();
    }

    // 創建新實例
    window.youtubeSubtitleTranslator = new YouTubeSubtitleTranslator();
    
    // 創建工具欄按鈕
    setTimeout(() => {
        if (window.youtubeSubtitleTranslator) {
            window.youtubeSubtitleTranslator.createToggleButton();
        }
    }, 2000);
    
    // 檢查是否應該自動啟動翻譯
    chrome.storage.sync.get(['youtubeSubtitleEnabled', 'youtubeTranslationMode'], (result) => {
        if (result.youtubeSubtitleEnabled && window.youtubeSubtitleTranslator) {
            const mode = result.youtubeTranslationMode || 'realtime';
            setTimeout(() => {
                window.youtubeSubtitleTranslator.start(mode);
            }, 3000);
        }
    });
}

// 監聽URL變化（用於單頁應用導航）
let currentUrl = location.href;
const urlObserver = new MutationObserver(() => {
    if (location.href !== currentUrl) {
        currentUrl = location.href;
        console.log('URL changed, reinitializing subtitle translator');
        setTimeout(initializeYouTubeSubtitleTranslator, 2000);
    }
});

// 開始監聽
if (YouTubeSubtitleTranslator.isYouTubeVideo()) {
    urlObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 初始化
    initializeYouTubeSubtitleTranslator();
}

// 暴露到全域以便調試
window.YouTubeSubtitleTranslator = YouTubeSubtitleTranslator;