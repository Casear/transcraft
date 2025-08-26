# TransCraft - AI-Powered Web Translation Extension

Professional Chrome extension that provides intelligent webpage translation using multiple AI services with expert translation modes.

## ✨ Key Features

- 🌐 **Real-time Webpage Translation** - Translate entire webpages while preserving original formatting
- 🎬 **Advanced YouTube Subtitle Translation** - Three translation modes: Real-time, Batch, and Preload with subtitle file extraction
- 🤖 **Multi-AI Service Support** - Choose from OpenAI, Claude, Gemini, OpenRouter, or Ollama (local)
- 🎯 **Expert Translation Modes** - Specialized modes for novels, technical docs, academic papers, and more
- 🚀 **Intelligent Batch Processing** - Configurable batching for optimal performance and cost
- 🎨 **Elegant Floating UI** - Non-intrusive pill-shaped button with language selection
- 🔄 **Instant Toggle** - Switch between original and translated text seamlessly
- 💾 **Smart Memory** - Remembers your preferences and settings across sessions
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

**Method C: YouTube Subtitle Translation**
- Visit any YouTube video with subtitles
- Click the translate button in YouTube's control bar (left of settings)
- Choose translation mode via right-click menu or extension settings:
  - **Real-time**: Instant per-sentence translation
  - **Batch**: Accumulate multiple sentences for better context
  - **Preload**: Download and translate entire subtitle file before playback
- Translated subtitles appear as overlay below video
- Configure settings via Extension Settings → YouTube Subtitle Translation

### 3. Expert Translation Modes
- **General**: Standard high-quality translation
- **Novel Modes**: Literature-focused (Romance, Fantasy, Mystery, Sci-Fi, Historical)
- **Technical**: Precise technical documentation translation
- **Academic**: Scholarly works with formal tone
- **Business**: Professional communications

## 🎬 YouTube Translation Modes

TransCraft offers three advanced translation modes for YouTube videos, each optimized for different use cases:

### 🚀 Real-time Translation Mode
- **Best for**: Live streaming, interactive content, immediate feedback needed
- **How it works**: Translates each subtitle sentence as it appears
- **Pros**: 
  - Fastest response time
  - No waiting period
  - Works with any video length
- **Cons**: 
  - Higher API costs (one request per sentence)
  - Limited context for translation
- **Perfect for**: Live streams, breaking news, interactive tutorials

### 📦 Batch Translation Mode  
- **Best for**: Regular videos, cost optimization, better translation quality
- **How it works**: Accumulates 3-5 sentences or waits 5 seconds, then translates together
- **Pros**:
  - Lower API costs (multiple sentences per request)
  - Better context and coherence
  - More natural translations
- **Cons**:
  - 2-5 second delay for translation
  - Temporary placeholder text shown
- **Perfect for**: Educational videos, documentaries, standard YouTube content

### 📁 Preload Translation Mode
- **Best for**: Long-form content, maximum quality, offline viewing
- **How it works**: Downloads entire subtitle file and translates everything before playback
- **Pros**:
  - Highest translation quality (full context)
  - Lowest API costs (bulk processing)
  - Zero delay during playback
  - Works with poor internet connectivity
- **Cons**:
  - 30-60 second wait time before starting
  - Requires subtitles to be available
  - Only works with videos that have subtitle files
- **Perfect for**: Movies, long lectures, detailed technical content

### 🎛️ Mode Selection
- **Settings Page**: Choose default mode in Extension Settings → YouTube Subtitle Translation
- **Quick Switch**: Right-click the YouTube translate button for instant mode switching
- **Auto-fallback**: Preload mode automatically falls back to real-time if subtitle extraction fails

### 📊 Usage Statistics
Each mode shows live statistics in the right-click menu:
- Translation cache size
- Preloaded subtitle count  
- Current processing status

## 🔧 Advanced Configuration

### Batch Processing Settings
Optimize performance and API usage:
- **Batch Size**: 2,000-16,000 characters (default: 8,000)
- **Element Count**: 5-50 elements per batch (default: 20)
- **Strategy**: Smaller batches = more stable, larger batches = faster

### Custom Expert Modes
Create your own specialized translation modes:
1. Go to Settings → Expert Mode Management
2. Click "Add Expert Mode"
3. Define custom system prompts with `{targetLanguage}` placeholder

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

- **Manifest V3**: Modern Chrome extension architecture
- **Vanilla JavaScript**: No external dependencies
- **Block-level Processing**: Intelligent DOM element identification
- **Custom Error Handling**: Categorized error types with specific solutions
- **Chrome Storage Sync**: Cross-device settings synchronization

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
- **Floating button not visible**: Check if the page allows content scripts

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.