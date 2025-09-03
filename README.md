# TransCraft - AI驅動的網頁翻譯擴充功能

專業的Chrome擴充功能，使用多種AI服務和專家翻譯模式提供智能網頁翻譯。

> **[English Version](#english-version)** | **繁體中文版** | **[日本語版](#japanese-version)**

## ✨ 主要功能

- 🌐 **即時網頁翻譯** - 翻譯整個網頁同時保持原始格式
- 🤖 **多AI服務支援** - 選擇OpenAI、Claude、Gemini、OpenRouter或Ollama（本地）
- 🎯 **專家翻譯模式** - 針對小說、技術文件、學術論文等專門模式
- 🧠 **智慧語言檢測** - 自動檢測來源語言並跳過不必要的翻譯
- 🚀 **智慧批次處理** - 可配置的批次處理以獲得最佳效能和成本
- 🎨 **優雅浮動UI** - 非干擾性膠囊狀按鈕與語言選擇
- 🔄 **即時切換** - 在原文和譯文之間無縫切換
- 🔄 **自動翻譯模式** - 瀏覽時自動翻譯新頁面
- 💾 **智慧記憶** - 跨會話記住您的偏好和設定
- 🌍 **多語言介面** - 支援英文、繁體中文和日文介面
- 🛡️ **錯誤處理** - 強健的錯誤管理與使用者友善的通知

## 🚀 安裝方式

1. **下載擴充功能**
   ```
   git clone https://github.com/your-repo/translate-extension
   # 或下載ZIP並解壓縮
   ```

2. **載入到Chrome**
   - 開啟Chrome並前往 `chrome://extensions/`
   - 啟用「開發者模式」（右上角切換）
   - 點選「載入未封裝項目」
   - 選擇 `translate-extension` 資料夾

3. **安裝完成** - 擴充功能圖示將出現在您的工具列中

## 🎯 快速開始

### 1. 配置API存取
- 點選擴充功能圖示 → 「設定」
- 選擇您偏好的AI服務（OpenAI/Claude/Gemini/OpenRouter/Ollama）
- 輸入您的API金鑰並儲存（Ollama本地運行 - 不需要API金鑰）

### 2. 翻譯任何網頁
**方法A：浮動按鈕（推薦）**
- 造訪任何網頁
- 尋找浮動翻譯按鈕（右下角）
- 左側：翻譯/還原切換
- 右側：語言選擇

**方法B：擴充功能彈出視窗**
- 點選擴充功能圖示
- 選擇目標語言和翻譯模式
- 點選「翻譯此頁面」

### 3. 專家翻譯模式
- **一般**：標準高品質翻譯
- **小說模式**：文學導向（愛情、奇幻、推理、科幻、歷史）
- **技術**：精確的技術文件翻譯
- **學術**：具有正式語調的學術作品
- **商務**：專業溝通

## 🔧 進階配置

### 語言檢測設定
智能翻譯優化：
- **自動語言檢測**：如果內容已經是目標語言則跳過翻譯
- **檢測樣本大小**：語言檢測的可配置字符限制（預設：600字符）
- **智慧跳過**：當內容不需要翻譯時避免不必要的API呼叫

### 批次處理設定
優化效能和API使用：
- **批次大小**：1,000-60,000字符（預設：8,000）
- **元素數量**：每批次1-50個元素（預設：20）
- **請求逾時**：每請求15-120秒（預設：60秒）
- **自動調整**：基於所選AI模型自動優化批次大小
- **策略**：較小批次 = 更穩定，較大批次 = 更快速

### 自定義專家模式
建立您自己的專業翻譯模式：
1. 前往設定 → 專家模式管理
2. 點選「新增專家模式」
3. 使用 `{targetLanguage}` 佔位符定義自定義系統提示
4. 設定適用於所有模式的共同翻譯指令

### 介面自定義
- **多語言介面**：在英文、繁體中文或日文之間選擇
- **調試模式**：啟用詳細日誌以進行故障排除
- **自動翻譯**：切換新頁面載入時的自動翻譯

## 🌍 支援語言

| 語言 | 代碼 | 國旗 |
|------|------|------|
| 繁體中文 | zh-TW | 🇹🇼 |
| 簡體中文 | zh-CN | 🇨🇳 |
| 英文 | en | 🇺🇸 |
| 日文 | ja | 🇯🇵 |
| 韓文 | ko | 🇰🇷 |
| 西班牙文 | es | 🇪🇸 |
| 法文 | fr | 🇫🇷 |
| 德文 | de | 🇩🇪 |

## 🔑 API金鑰設定

### OpenAI
1. 造訪 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 建立新的API金鑰
3. 模型：GPT-4.1、GPT-4o、GPT-4o Mini、GPT-3.5 Turbo

### Claude (Anthropic)
1. 造訪 [Anthropic Console](https://console.anthropic.com/api-keys)
2. 生成API金鑰
3. 模型：Claude 4 Opus、Claude 3.5 Sonnet、Claude 3 Haiku

### Gemini (Google)
1. 造訪 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 建立API金鑰
3. 模型：Gemini 2.5 Pro、Gemini 2.0 Flash、Gemini 1.5 Pro

### OpenRouter
1. 造訪 [OpenRouter Keys](https://openrouter.ai/keys) 建立API金鑰
2. **配置隱私設定**（重要！）：
   - 前往 [隱私設定](https://openrouter.ai/settings/privacy)
   - 啟用「Allow training on prompts」或類似選項
   - 儲存設定並等待幾分鐘使其生效
3. 模型：透過單一API存取Claude、GPT、Llama、Gemini和許多其他模型
4. **特殊功能**：
   - **免費方案可用** 包含Phi-3 Mini、Gemma 2、Llama 3.2和其他模型
   - **統一存取** 透過單一API存取多個AI提供商
   - **競爭性定價** 和廣泛的模型變體
   - **300+模型** 來自各種提供商
5. **故障排除**：如果出現「No endpoints found」錯誤，請檢查您的隱私設定

### Ollama（本地AI）
1. 下載並安裝 [Ollama](https://ollama.ai)
2. 啟動Ollama服務：`ollama serve`
3. 下載模型：`ollama pull llama3.1:8b`
4. 不需要API金鑰 - 完全離線運行
5. **特殊功能**：
   - **100%私密** - 所有處理都在您的本地機器上進行
   - **無API成本** - 初始設定後完全免費
   - **離線支援** - 無需網路連接即可運作
   - **自定義模型** - 支援15+流行的開源模型
   - **記憶體需求** - 根據您的RAM選擇模型（1GB-40GB+）

## 🛠️ 技術架構

TransCraft使用複雜的**模組化架構**以提供可維護性和效能：

### 核心架構
- **Manifest V3**：現代Chrome擴充功能架構
- **純JavaScript**：無需外部依賴或建構過程
- **模組化內容腳本**：8個專業模組 + 主編排器
- **區塊級處理**：智能DOM元素識別
- **自定義錯誤處理**：具有特定解決方案的分類錯誤類型
- **Chrome存儲同步**：跨裝置設定同步

### 模組化設計
內容腳本組織為專業模組：
- **狀態管理**：集中式應用程式狀態
- **調試和國際化**：日誌記錄和國際化
- **語言檢測**：智能來源語言識別
- **翻譯API**：背景服務通訊
- **模態系統**：使用者友善的錯誤對話框
- **浮動UI**：非干擾性介面組件
- **自動翻譯**：自動頁面翻譯
- **翻譯引擎**：核心翻譯邏輯

### 模組載入模式
```javascript
// 複雜的模組協調
const waitForModules = () => {
  // 等待所有模組載入後才初始化
  // 確保正確的依賴關係解析
};
```

### 主要優勢
- **可維護**：關注點明確分離
- **可擴展**：易於添加新功能
- **可靠**：強健的錯誤處理和狀態管理
- **效能**：優化的批次處理和快取

## 🦙 Ollama本地AI設定

為了完全隱私和零API成本，使用Ollama在本地運行AI模型：

### 快速設定
```bash
# 1. 安裝Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. 啟動服務
ollama serve

# 3. 下載模型（根據您的RAM選擇）
ollama pull llama3.1:8b        # 4.7GB RAM - 推薦
ollama pull llama3.2:3b        # 2GB RAM - 輕量級
ollama pull qwen2:7b           # 4.4GB RAM - 中文優化
ollama pull mistral:7b         # 4.1GB RAM - 高效
```

### 根據使用案例推薦的模型
- **一般翻譯**：`llama3.1:8b` 或 `mistral:7b`
- **中文內容**：`qwen2:7b` 或 `qwen2:72b`（如果您有40GB+記憶體）
- **低階硬體**：`llama3.2:1b` 或 `gemma2:2b`
- **高品質**：`llama3.1:70b` 或 `mixtral:8x7b`（需要25GB+記憶體）

### 優勢
✅ **100%私密** - 沒有資料離開您的電腦
✅ **零API成本** - 設定後永久免費
✅ **離線可用** - 無需網路即可運作
✅ **可自定義** - 從15+模型中選擇
✅ **無速率限制** - 想翻譯多少就翻譯多少

## ⚠️ 重要注意事項

- **API成本**：雲端服務（OpenAI/Claude/Gemini/OpenRouter）會根據使用情況收取費用
- **隱私**：雲端翻譯通過外部API處理；Ollama完全本地
- **效能**：大頁面可能需要更長時間；Ollama速度取決於您的硬體
- **權限**：擴充功能需要存取網頁內容和存儲
- **Ollama需求**：本地模型需要足夠的RAM和CPU功率

## 🔍 故障排除

### 常見問題
- **「請配置API金鑰」**：在設定中設定您的API金鑰（Ollama不需要）
- **「翻譯失敗」**：檢查您的網路連接和API金鑰有效性
- **「擴充功能上下文無效」**：擴充功能更新後重新整理頁面
- **「翻譯已跳過」**：內容已經是目標語言（語言檢測正常運作）
- **浮動按鈕不可見**：檢查頁面是否允許內容腳本
- **介面語言錯誤**：在設定 → 語言設定中變更介面語言

### OpenRouter特定問題
- **「No endpoints found」**：前往 [隱私設定](https://openrouter.ai/settings/privacy) 並啟用「Allow training on prompts」
- **「No endpoints found matching your data policy」**：檢查隱私設定並在變更後等待幾分鐘
- **免費模型無法運作**：確保隱私設定允許提示訓練以存取免費方案
- **API金鑰無效**：在 [OpenRouter Keys](https://openrouter.ai/keys) 驗證您的API金鑰

### Ollama特定問題
- **「Ollama API錯誤」**：確保Ollama服務正在運行（`ollama serve`）
- **「連接被拒絕」**：驗證Ollama可在 `localhost:11434` 存取
- **翻譯緩慢**：考慮使用較小的模型或升級硬體
- **找不到模型**：先下載模型（`ollama pull model-name`）
- **記憶體不足**：切換到適合您可用RAM的較小模型

### 錯誤類型
- `QUOTA_EXCEEDED`：達到API計費限制
- `API_KEY_ERROR`：無效或過期的API金鑰
- `NETWORK_ERROR`：連接問題
- `EXTENSION_CONTEXT_INVALID`：擴充功能需要重新整理

## 🎮 鍵盤快速鍵

目前所有互動都透過UI進行。鍵盤快速鍵可能在未來版本中添加。

## 🔄 更新

擴充功能在更新期間會自動保留您的設定。更新後只需重新整理頁面以使變更生效。

## 🚀 開發與部署

### 對於貢獻者

此專案使用GitHub Actions自動部署到Chrome Web Store：

```bash
# 快速發布（修訂版本升級 + 部署）
npm run release

# 次要版本發布
npm run release:minor

# 主要版本發布
npm run release:major

# 僅手動版本升級（不部署）
npm run version:patch
npm run version:minor
npm run version:major
```

### 手動部署

您也可以透過GitHub的網頁介面觸發部署：
1. 前往 **Actions** → **Manual Deploy to Chrome Web Store**
2. 點選 **Run workflow**
3. 選擇版本升級類型（patch/minor/major）
4. 選擇是否立即發布
5. 點選 **Run workflow**

### 本地建構

```bash
# 安裝依賴
npm install

# 驗證manifest
npm run validate

# 建立擴充功能套件
npm run build

# 執行測試
npm test
```

自動部署系統：
- ✅ 驗證所有檔案和語法
- 📦 建構優化的擴充功能套件
- 🏷️ 建立版本標籤和發布
- 🚀 自動部署到Chrome Web Store
- 📋 建立詳細的部署摘要

## 📄 授權

此專案在MIT授權下授權 - 詳情請參見LICENSE檔案。

---

# English Version

# TransCraft - AI-Powered Web Translation Extension

Professional Chrome extension that provides intelligent webpage translation using multiple AI services with expert translation modes.

## ✨ Key Features

- 🌐 **Real-time Webpage Translation** - Translate entire webpages while preserving original formatting
- 🤖 **Multi-AI Service Support** - Choose from OpenAI, Claude, Gemini, OpenRouter, or Ollama (local)
- 🎯 **Expert Translation Modes** - Specialized modes for novels, technical docs, academic papers, and more
- 🧠 **Intelligent Language Detection** - Automatically detect source language and skip unnecessary translations
- 🚀 **Intelligent Batch Processing** - Configurable batching for optimal performance and cost
- 🎨 **Elegant Floating UI** - Non-intrusive pill-shaped button with language selection
- 🔄 **Instant Toggle** - Switch between original and translated text seamlessly
- 🔄 **Auto-Translate Mode** - Automatically translate new pages as you browse
- 💾 **Smart Memory** - Remembers your preferences and settings across sessions
- 🌍 **Multi-Language Interface** - Support for English, Traditional Chinese, and Japanese interfaces
- 🛡️ **Error Handling** - Robust error management with user-friendly notifications

## 🚀 Installation

1. **Download Extension**
   ```
   git clone https://github.com/your-repo/translate-extension
   # or download ZIP and extract
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `translate-extension` folder

3. **Setup Complete** - The extension icon will appear in your toolbar

## 🎯 Quick Start

### 1. Configure API Access
- Click the extension icon → "Settings"
- Select your preferred AI service (OpenAI/Claude/Gemini/OpenRouter/Ollama)
- Enter your API key and save (Ollama runs locally - no API key needed)

### 2. Translate Any Webpage
**Method A: Floating Button (Recommended)**
- Visit any webpage
- Look for the floating translation button (bottom-right)
- Left side: Translate/restore toggle
- Right side: Language selection

**Method B: Extension Popup**
- Click the extension icon
- Choose target language and translation mode
- Click "Translate This Page"

### 3. Expert Translation Modes
- **General**: Standard high-quality translation
- **Novel Modes**: Literature-focused (Romance, Fantasy, Mystery, Sci-Fi, Historical)
- **Technical**: Precise technical documentation translation
- **Academic**: Scholarly works with formal tone
- **Business**: Professional communications

## 🔧 Advanced Configuration

### Language Detection Settings
Smart translation optimization:
- **Auto Language Detection**: Skip translation if content is already in target language
- **Detection Sample Size**: Configurable character limit for language detection (default: 600 characters)
- **Smart Skip**: Avoid unnecessary API calls when content doesn't need translation

### Batch Processing Settings
Optimize performance and API usage:
- **Batch Size**: 1,000-60,000 characters (default: 8,000)
- **Element Count**: 1-50 elements per batch (default: 20)
- **Request Timeout**: 15-120 seconds per request (default: 60 seconds)
- **Auto-Adjust**: Automatically optimize batch size based on selected AI model
- **Strategy**: Smaller batches = more stable, larger batches = faster

### Custom Expert Modes
Create your own specialized translation modes:
1. Go to Settings → Expert Mode Management
2. Click "Add Expert Mode"
3. Define custom system prompts with `{targetLanguage}` placeholder
4. Set common translation instructions that apply to all modes

### Interface Customization
- **Multi-Language Interface**: Choose between English, Traditional Chinese, or Japanese
- **Debug Mode**: Enable detailed logging for troubleshooting
- **Auto-Translate**: Toggle automatic translation on new page loads

## 🌍 Supported Languages

| Language | Code | Flag |
|----------|------|------|
| Traditional Chinese | zh-TW | 🇹🇼 |
| Simplified Chinese | zh-CN | 🇨🇳 |
| English | en | 🇺🇸 |
| Japanese | ja | 🇯🇵 |
| Korean | ko | 🇰🇷 |
| Spanish | es | 🇪🇸 |
| French | fr | 🇫🇷 |
| German | de | 🇩🇪 |

## 🔑 API Key Setup

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Models: GPT-4.1, GPT-4o, GPT-4o Mini, GPT-3.5 Turbo

### Claude (Anthropic)
1. Visit [Anthropic Console](https://console.anthropic.com/api-keys)
2. Generate API key
3. Models: Claude 4 Opus, Claude 3.5 Sonnet, Claude 3 Haiku

### Gemini (Google)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Models: Gemini 2.5 Pro, Gemini 2.0 Flash, Gemini 1.5 Pro

### OpenRouter
1. Visit [OpenRouter Keys](https://openrouter.ai/keys) to create an API key
2. **Configure Privacy Settings** (Important!):
   - Go to [Privacy Settings](https://openrouter.ai/settings/privacy)
   - Enable "Allow training on prompts" or similar options
   - Save settings and wait a few minutes for them to take effect
3. Models: Access to Claude, GPT, Llama, Gemini, and many other models through one API
4. **Special Features**: 
   - **Free tier available** with Phi-3 Mini, Gemma 2, Llama 3.2, and other models
   - **Unified access** to multiple AI providers through single API
   - **Competitive pricing** and extensive model variety
   - **300+ models** from various providers
5. **Troubleshooting**: If you get "No endpoints found" error, check your privacy settings

### Ollama (Local AI)
1. Download and install [Ollama](https://ollama.ai)
2. Start Ollama service: `ollama serve`
3. Download models: `ollama pull llama3.1:8b`
4. No API key required - runs completely offline
5. **Special Features**:
   - **100% Private** - All processing happens on your local machine
   - **No API Costs** - Completely free after initial setup
   - **Offline Support** - Works without internet connection
   - **Custom Models** - Support for 15+ popular open-source models
   - **Memory Requirements** - Choose models based on your RAM (1GB-40GB+)

## 🛠️ Technical Architecture

TransCraft uses a sophisticated **modular architecture** for maintainability and performance:

### Core Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Vanilla JavaScript**: No external dependencies or build process required
- **Modular Content Script**: 8 specialized modules + main orchestrator
- **Block-level Processing**: Intelligent DOM element identification
- **Custom Error Handling**: Categorized error types with specific solutions
- **Chrome Storage Sync**: Cross-device settings synchronization

### Modular Design
The content script is organized into specialized modules:
- **State Management**: Centralized application state
- **Debug & i18n**: Logging and internationalization
- **Language Detection**: Smart source language identification  
- **Translation API**: Background service communication
- **Modal System**: User-friendly error dialogs
- **Floating UI**: Non-intrusive interface components
- **Auto-Translate**: Automatic page translation
- **Translation Engine**: Core translation logic

### Module Loading Pattern
```javascript
// Sophisticated module coordination
const waitForModules = () => {
  // Wait for all modules to load before initialization
  // Ensures proper dependency resolution
};
```

### Key Benefits
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new features
- **Reliable**: Robust error handling and state management
- **Performance**: Optimized batch processing and caching

## 🦙 Ollama Local AI Setup

For complete privacy and zero API costs, use Ollama to run AI models locally:

### Quick Setup
```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Start the service
ollama serve

# 3. Download a model (choose based on your RAM)
ollama pull llama3.1:8b        # 4.7GB RAM - Recommended
ollama pull llama3.2:3b        # 2GB RAM - Lightweight  
ollama pull qwen2:7b           # 4.4GB RAM - Chinese optimized
ollama pull mistral:7b         # 4.1GB RAM - Efficient
```

### Model Recommendations by Use Case
- **General Translation**: `llama3.1:8b` or `mistral:7b`
- **Chinese Content**: `qwen2:7b` or `qwen2:72b` (if you have 40GB+ RAM)
- **Low-end Hardware**: `llama3.2:1b` or `gemma2:2b`
- **High Quality**: `llama3.1:70b` or `mixtral:8x7b` (requires 25GB+ RAM)

### Benefits
✅ **100% Private** - No data leaves your computer  
✅ **Zero API Costs** - Free forever after setup  
✅ **Offline Capable** - Works without internet  
✅ **Customizable** - Choose from 15+ models  
✅ **No Rate Limits** - Translate as much as you want  

## ⚠️ Important Notes

- **API Costs**: Cloud services (OpenAI/Claude/Gemini/OpenRouter) incur costs based on usage
- **Privacy**: Cloud translations are processed via external APIs; Ollama is completely local
- **Performance**: Large pages may take longer; Ollama speed depends on your hardware
- **Permissions**: Extension requires access to webpage content and storage
- **Ollama Requirements**: Local models need sufficient RAM and CPU power

## 🔍 Troubleshooting

### Common Issues
- **"Please configure API Key"**: Set up your API key in Settings (not needed for Ollama)
- **"Translation failed"**: Check your internet connection and API key validity
- **"Extension context invalid"**: Refresh the page after extension updates
- **"Translation Skipped"**: Content is already in target language (language detection working)
- **Floating button not visible**: Check if the page allows content scripts
- **Interface in wrong language**: Change interface language in Settings → Language Settings

### OpenRouter-Specific Issues
- **"No endpoints found"**: Go to [Privacy Settings](https://openrouter.ai/settings/privacy) and enable "Allow training on prompts"
- **"No endpoints found matching your data policy"**: Check privacy settings and wait a few minutes after changing them
- **Free models not working**: Ensure privacy settings allow prompt training for free tier access
- **API key invalid**: Verify your API key at [OpenRouter Keys](https://openrouter.ai/keys)

### Ollama-Specific Issues
- **"Ollama API error"**: Ensure Ollama service is running (`ollama serve`)
- **"Connection refused"**: Verify Ollama is accessible at `localhost:11434`
- **Slow translations**: Consider using a smaller model or upgrading hardware
- **Model not found**: Download the model first (`ollama pull model-name`)
- **Out of memory**: Switch to a smaller model that fits your available RAM

### Error Types
- `QUOTA_EXCEEDED`: API billing limit reached
- `API_KEY_ERROR`: Invalid or expired API key
- `NETWORK_ERROR`: Connection problems
- `EXTENSION_CONTEXT_INVALID`: Extension needs refresh

## 🎮 Keyboard Shortcuts

Currently, all interactions are through UI. Keyboard shortcuts may be added in future versions.

## 🔄 Updates

The extension automatically preserves your settings during updates. Simply refresh pages after updating for changes to take effect.

## 🚀 Development & Deployment

### For Contributors

This project uses GitHub Actions for automated deployment to Chrome Web Store:

```bash
# Quick release (patch version bump + deploy)
npm run release

# Minor version release  
npm run release:minor

# Major version release
npm run release:major

# Manual version bump only (no deploy)
npm run version:patch
npm run version:minor  
npm run version:major
```

### Manual Deployment

You can also trigger deployment through GitHub's web interface:
1. Go to **Actions** → **Manual Deploy to Chrome Web Store**
2. Click **Run workflow**
3. Select version bump type (patch/minor/major)
4. Choose whether to publish immediately
5. Click **Run workflow**

### Build Locally

```bash
# Install dependencies
npm install

# Validate manifest
npm run validate

# Create extension package
npm run build

# Run tests
npm test
```

The automated deployment system:
- ✅ Validates all files and syntax
- 📦 Builds optimized extension package  
- 🏷️ Creates version tags and releases
- 🚀 Deploys to Chrome Web Store automatically
- 📋 Creates detailed deployment summaries

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

# Japanese Version

# TransCraft - AI駆動のウェブ翻訳拡張機能

複数のAIサービスと専門翻訳モードを使用してインテリジェントなウェブページ翻訳を提供するプロフェッショナルなChrome拡張機能。

## ✨ 主な機能

- 🌐 **リアルタイムウェブページ翻訳** - 元の書式を保持しながらウェブページ全体を翻訳
- 🤖 **複数AIサービス対応** - OpenAI、Claude、Gemini、OpenRouter、Ollama（ローカル）から選択可能
- 🎯 **専門翻訳モード** - 小説、技術文書、学術論文などの専用モード
- 🧠 **インテリジェント言語検出** - 元言語を自動検出し、不要な翻訳をスキップ
- 🚀 **インテリジェントバッチ処理** - 最適なパフォーマンスとコストのための設定可能なバッチ処理
- 🎨 **エレガントなフローティングUI** - 言語選択機能付きの非侵入的カプセル型ボタン
- 🔄 **即座切り替え** - 元のテキストと翻訳されたテキストをシームレスに切り替え
- 🔄 **自動翻訳モード** - 閲覧中に新しいページを自動翻訳
- 💾 **スマートメモリ** - セッション間で設定と好みを記憶
- 🌍 **多言語インターフェース** - 英語、繁体字中国語、日本語インターフェースをサポート
- 🛡️ **エラーハンドリング** - ユーザーフレンドリーな通知による堅牢なエラー管理

## 🚀 インストール方法

1. **拡張機能をダウンロード**
   ```
   git clone https://github.com/your-repo/translate-extension
   # またはZIPをダウンロードして解凍
   ```

2. **Chromeに読み込み**
   - Chromeを開き、`chrome://extensions/`にアクセス
   - 「デベロッパーモード」を有効にする（右上のトグル）
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `translate-extension`フォルダを選択

3. **セットアップ完了** - 拡張機能アイコンがツールバーに表示されます

## 🎯 クイックスタート

### 1. APIアクセスの設定
- 拡張機能アイコンをクリック → 「設定」
- 希望するAIサービスを選択（OpenAI/Claude/Gemini/OpenRouter/Ollama）
- APIキーを入力して保存（Ollamaはローカル実行 - APIキー不要）

### 2. ウェブページの翻訳
**方法A：フローティングボタン（推奨）**
- 任意のウェブページにアクセス
- フローティング翻訳ボタンを探す（右下）
- 左側：翻訳/復元切り替え
- 右側：言語選択

**方法B：拡張機能ポップアップ**
- 拡張機能アイコンをクリック
- ターゲット言語と翻訳モードを選択
- 「このページを翻訳」をクリック

### 3. 専門翻訳モード
- **一般**：標準的な高品質翻訳
- **小説モード**：文学に特化（ロマンス、ファンタジー、ミステリー、SF、歴史）
- **技術**：精密な技術文書翻訳
- **学術**：フォーマルトーンの学術作品
- **ビジネス**：プロフェッショナルコミュニケーション

## 🔧 高度な設定

### 言語検出設定
スマート翻訳最適化：
- **自動言語検出**：コンテンツが既にターゲット言語の場合は翻訳をスキップ
- **検出サンプルサイズ**：言語検出の設定可能文字制限（デフォルト：600文字）
- **スマートスキップ**：コンテンツが翻訳を必要としない場合の不要なAPI呼び出しを回避

### バッチ処理設定
パフォーマンスとAPI使用量の最適化：
- **バッチサイズ**：1,000-60,000文字（デフォルト：8,000）
- **要素数**：バッチあたり1-50要素（デフォルト：20）
- **リクエストタイムアウト**：リクエストあたり15-120秒（デフォルト：60秒）
- **自動調整**：選択したAIモデルに基づいてバッチサイズを自動最適化
- **戦略**：小さなバッチ = より安定、大きなバッチ = より高速

### カスタム専門モード
独自の専門翻訳モードを作成：
1. 設定 → 専門モード管理に移動
2. 「専門モードを追加」をクリック
3. `{targetLanguage}`プレースホルダーでカスタムシステムプロンプトを定義
4. すべてのモードに適用される共通翻訳指示を設定

### インターフェースカスタマイズ
- **多言語インターフェース**：英語、繁体字中国語、日本語から選択
- **デバッグモード**：トラブルシューティング用の詳細ログを有効化
- **自動翻訳**：新しいページ読み込み時の自動翻訳を切り替え

## 🌍 対応言語

| 言語 | コード | 国旗 |
|------|--------|------|
| 繁体字中国語 | zh-TW | 🇹🇼 |
| 簡体字中国語 | zh-CN | 🇨🇳 |
| 英語 | en | 🇺🇸 |
| 日本語 | ja | 🇯🇵 |
| 韓国語 | ko | 🇰🇷 |
| スペイン語 | es | 🇪🇸 |
| フランス語 | fr | 🇫🇷 |
| ドイツ語 | de | 🇩🇪 |

## 🔑 APIキーの設定

### OpenAI
1. [OpenAI Platform](https://platform.openai.com/api-keys)にアクセス
2. 新しいAPIキーを作成
3. モデル：GPT-4.1、GPT-4o、GPT-4o Mini、GPT-3.5 Turbo

### Claude (Anthropic)
1. [Anthropic Console](https://console.anthropic.com/api-keys)にアクセス
2. APIキーを生成
3. モデル：Claude 4 Opus、Claude 3.5 Sonnet、Claude 3 Haiku

### Gemini (Google)
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを作成
3. モデル：Gemini 2.5 Pro、Gemini 2.0 Flash、Gemini 1.5 Pro

### OpenRouter
1. [OpenRouter Keys](https://openrouter.ai/keys)でAPIキーを作成
2. **プライバシー設定の構成**（重要！）：
   - [プライバシー設定](https://openrouter.ai/settings/privacy)にアクセス
   - 「Allow training on prompts」または類似のオプションを有効化
   - 設定を保存し、数分待って有効になるまで待機
3. モデル：単一APIを通じてClaude、GPT、Llama、Geminiなど多くのモデルにアクセス
4. **特別機能**：
   - **無料ティア利用可能** Phi-3 Mini、Gemma 2、Llama 3.2などのモデル付き
   - **統一アクセス** 単一APIを通じて複数のAIプロバイダーにアクセス
   - **競争力のある価格** と豊富なモデルバラエティ
   - **300+モデル** 様々なプロバイダーから
5. **トラブルシューティング**：「No endpoints found」エラーが出た場合、プライバシー設定を確認

### Ollama（ローカルAI）
1. [Ollama](https://ollama.ai)をダウンロードしてインストール
2. Ollamaサービスを開始：`ollama serve`
3. モデルをダウンロード：`ollama pull llama3.1:8b`
4. APIキー不要 - 完全オフラインで実行
5. **特別機能**：
   - **100%プライベート** - すべての処理がローカルマシンで実行
   - **APIコスト不要** - 初期設定後は完全無料
   - **オフラインサポート** - インターネット接続なしで動作
   - **カスタムモデル** - 15以上の人気オープンソースモデルをサポート
   - **メモリ要件** - RAM（1GB-40GB+）に基づいてモデルを選択

## 🛠️ 技術アーキテクチャ

TransCraftは保守性とパフォーマンスのために洗練された**モジュラーアーキテクチャ**を使用：

### コアアーキテクチャ
- **Manifest V3**：モダンなChrome拡張機能アーキテクチャ
- **バニラJavaScript**：外部依存関係やビルドプロセス不要
- **モジュラーコンテンツスクリプト**：8つの専門モジュール + メインオーケストレーター
- **ブロックレベル処理**：インテリジェントDOM要素識別
- **カスタムエラーハンドリング**：特定ソリューション付きの分類されたエラータイプ
- **Chrome Storage Sync**：デバイス間設定同期

### モジュラー設計
コンテンツスクリプトは専門モジュールに整理：
- **状態管理**：集中アプリケーション状態
- **デバッグ & i18n**：ログと国際化
- **言語検出**：スマートソース言語識別
- **翻訳API**：バックグラウンドサービス通信
- **モーダルシステム**：ユーザーフレンドリーエラーダイアログ
- **フローティングUI**：非侵入的インターフェースコンポーネント
- **自動翻訳**：自動ページ翻訳
- **翻訳エンジン**：コア翻訳ロジック

### モジュール読み込みパターン
```javascript
// 洗練されたモジュール調整
const waitForModules = () => {
  // 初期化前にすべてのモジュールの読み込みを待機
  // 適切な依存関係解決を保証
};
```

### 主な利点
- **保守可能**：関心の明確な分離
- **拡張可能**：新機能の追加が容易
- **信頼性**：堅牢なエラーハンドリングと状態管理
- **パフォーマンス**：最適化されたバッチ処理とキャッシング

## 🦙 Ollamaローカル AI設定

完全なプライバシーとゼロAPIコストのため、Ollamaを使用してAIモデルをローカルで実行：

### クイックセットアップ
```bash
# 1. Ollamaをインストール
curl -fsSL https://ollama.ai/install.sh | sh

# 2. サービスを開始
ollama serve

# 3. モデルをダウンロード（RAMに基づいて選択）
ollama pull llama3.1:8b        # 4.7GB RAM - 推奨
ollama pull llama3.2:3b        # 2GB RAM - 軽量
ollama pull qwen2:7b           # 4.4GB RAM - 中国語最適化
ollama pull mistral:7b         # 4.1GB RAM - 効率的
```

### 用途別モデル推奨
- **一般翻訳**：`llama3.1:8b`または`mistral:7b`
- **中国語コンテンツ**：`qwen2:7b`または`qwen2:72b`（40GB以上のRAMがある場合）
- **ローエンドハードウェア**：`llama3.2:1b`または`gemma2:2b`
- **高品質**：`llama3.1:70b`または`mixtral:8x7b`（25GB以上のRAM必要）

### 利点
✅ **100%プライベート** - データがコンピュータから出ない
✅ **ゼロAPIコスト** - セットアップ後は永続無料
✅ **オフライン対応** - インターネットなしで動作
✅ **カスタマイズ可能** - 15以上のモデルから選択
✅ **レート制限なし** - 好きなだけ翻訳

## ⚠️ 重要な注意事項

- **APIコスト**：クラウドサービス（OpenAI/Claude/Gemini/OpenRouter）は使用量に基づいて課金
- **プライバシー**：クラウド翻訳は外部API経由で処理；Ollamaは完全ローカル
- **パフォーマンス**：大きなページは時間がかかる場合がある；Ollamaの速度はハードウェアに依存
- **権限**：拡張機能はウェブページコンテンツとストレージへのアクセスが必要
- **Ollama要件**：ローカルモデルは十分なRAMとCPU能力が必要

## 🔍 トラブルシューティング

### 一般的な問題
- **「APIキーを設定してください」**：設定でAPIキーをセットアップ（Ollamaでは不要）
- **「翻訳に失敗しました」**：インターネット接続とAPIキーの有効性を確認
- **「拡張コンテキストが無効」**：拡張機能更新後にページをリフレッシュ
- **「翻訳がスキップされました」**：コンテンツが既にターゲット言語（言語検出が動作中）
- **フローティングボタンが見えない**：ページがコンテンツスクリプトを許可するかチェック
- **インターフェース言語が間違っている**：設定 → 言語設定でインターフェース言語を変更

### OpenRouter固有の問題
- **「No endpoints found」**：[プライバシー設定](https://openrouter.ai/settings/privacy)で「Allow training on prompts」を有効化
- **「No endpoints found matching your data policy」**：プライバシー設定をチェックし、変更後数分待機
- **無料モデルが動作しない**：プライバシー設定が無料ティアアクセス用のプロンプトトレーニングを許可することを確認
- **APIキーが無効**：[OpenRouter Keys](https://openrouter.ai/keys)でAPIキーを検証

### Ollama固有の問題
- **「Ollama APIエラー」**：Ollamaサービスが実行中か確認（`ollama serve`）
- **「接続が拒否されました」**：Ollamaが`localhost:11434`でアクセス可能か検証
- **翻訳が遅い**：より小さなモデルを使用するかハードウェアをアップグレード
- **モデルが見つからない**：最初にモデルをダウンロード（`ollama pull model-name`）
- **メモリ不足**：利用可能なRAMに適合するより小さなモデルに切り替え

### エラータイプ
- `QUOTA_EXCEEDED`：API課金制限に到達
- `API_KEY_ERROR`：無効または期限切れのAPIキー
- `NETWORK_ERROR`：接続問題
- `EXTENSION_CONTEXT_INVALID`：拡張機能のリフレッシュが必要

## 🎮 キーボードショートカット

現在、すべてのインタラクションはUI経由です。キーボードショートカットは将来のバージョンで追加される可能性があります。

## 🔄 アップデート

拡張機能はアップデート中に設定を自動保存します。変更を有効にするには、アップデート後にページをリフレッシュするだけです。

## 🚀 開発とデプロイ

### 貢献者向け

このプロジェクトはChrome Web Storeへの自動デプロイにGitHub Actionsを使用：

```bash
# クイックリリース（パッチバージョンアップ + デプロイ）
npm run release

# マイナーバージョンリリース
npm run release:minor

# メジャーバージョンリリース
npm run release:major

# 手動バージョンアップのみ（デプロイなし）
npm run version:patch
npm run version:minor
npm run version:major
```

### 手動デプロイ

GitHubのウェブインターフェースからデプロイをトリガーすることもできます：
1. **Actions** → **Manual Deploy to Chrome Web Store**に移動
2. **Run workflow**をクリック
3. バージョンアップタイプを選択（patch/minor/major）
4. 即座に公開するかどうかを選択
5. **Run workflow**をクリック

### ローカルビルド

```bash
# 依存関係をインストール
npm install

# マニフェストを検証
npm run validate

# 拡張機能パッケージを作成
npm run build

# テストを実行
npm test
```

自動デプロイシステム：
- ✅ すべてのファイルと構文を検証
- 📦 最適化された拡張機能パッケージを構築
- 🏷️ バージョンタグとリリースを作成
- 🚀 Chrome Web Storeに自動デプロイ
- 📋 詳細なデプロイ概要を作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細はLICENSEファイルを参照してください。