# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Testing the Extension:**
```bash
# Load unpacked extension in Chrome at chrome://extensions/
# No build process required - this is a vanilla JavaScript Chrome extension
```

**Development Workflow:**
1. Make changes to source files
2. Go to `chrome://extensions/` in Chrome
3. Click the refresh button on the extension card
4. Test changes on any webpage

## Architecture Overview

This is a Chrome Extension (Manifest v3) that provides AI-powered webpage translation using five AI services including local AI.

### Core Architecture Components

**Background Service Worker (`js/background.js`)**
- Handles all API communications with OpenAI, Claude, Gemini, OpenRouter, and Ollama
- Centralized translation logic with error handling
- API connection testing functionality
- Message routing between content script and options page

**Content Script (`js/content.js`)**
- Injected into all web pages via manifest
- Block-level DOM element processing (not sentence-by-sentence)
- Floating button UI with pill-shaped design (translation + language selection)
- Custom error modal system (no browser alerts)
- State management for translation status and progress

**Options Page (`options.html` + `js/options.js`)**
- Dynamic UI that shows only selected API service's settings
- Supports 55+ AI models across all five services
- Model categorization (fast/balanced/powerful)
- API key management with visibility toggles

### Key Technical Patterns

**Translation Flow:**
1. Content script identifies translatable block elements (P, H1-H6, LI, TD, etc.)
2. Dynamically batches text based on character length and element count limits
3. Combines text using `<<TRANSLATE_SEPARATOR>>` delimiter
4. Background worker calls selected AI service API
5. Content script displays translations below original text

**Error Classification:**
- `QUOTA_EXCEEDED`: API billing/quota issues
- `NETWORK_ERROR`: Connection problems  
- `API_KEY_ERROR`: Authentication failures
- `EXTENSION_CONTEXT_INVALID`: Extension reload needed

**UI State Management:**
- Floating button has merged design (left: translation, right: language)
- Consistent icon display (no checkmark/error icon changes)
- Progress tracking during batch translation
- Language persistence via Chrome storage

### Data Storage Structure

Chrome Storage Sync stores:
```javascript
{
  selectedApi: 'openai'|'claude'|'gemini'|'openrouter'|'ollama',
  apiKeys: { [service]: 'key_value' },
  selectedModel: 'model_identifier',
  targetLanguage: 'zh-TW'|'en'|'ja'|etc,
  maxBatchLength: 8000,    // Default: 8000 characters per batch
  maxBatchElements: 20     // Default: 20 elements per batch
}
```

### AI Service Integration

**Model Defaults:**
- OpenAI: `gpt-4o-mini`  
- Claude: `claude-3-5-haiku-20241022`
- Gemini: `gemini-2.5-flash`
- OpenRouter: `deepseek/deepseek-r1-distill-llama-70b:free`
- Ollama: `llama3.1:8b`

**API Authentication:**
- OpenAI: Bearer token in Authorization header
- Claude: x-api-key header + anthropic-version
- Gemini: API key as URL parameter
- OpenRouter: Bearer token in Authorization header + HTTP-Referer and X-Title headers
- Ollama: No authentication required (localhost only)

### Chrome Extension Permissions

Required permissions in manifest.json:
- `activeTab`: Access current page content
- `storage`: Persist settings
- `scripting`: Inject content scripts
- Host permissions for all five AI service APIs (including localhost for Ollama)

### Styling Architecture

**Content Styles (`css/content.css`):**
- `.ai-translation-block`: Blue-accented translation display
- Floating button: 80x56px pill shape with gradient background
- Responsive design with mobile breakpoints
- Error modal with overlay and animations

**Options Styles (`css/options.css`):**
- Dynamic API section visibility
- Model badge system (fast/balanced/powerful)
- Animated transitions for section changes

## Important Implementation Notes

- All text processing is block-level to avoid incomplete translations
- Dynamic batch sizing based on character length and element count
- Batch size is user-configurable in options (default: 8000 chars, 20 elements)
- Original text is always preserved alongside translations
- Extension uses vanilla JavaScript (no frameworks)
- All API calls are proxied through background script for security
- Custom modal system prevents browser alert() interruptions
- Translation state persists across page navigation until manually cleared

## Batch Processing Details

The extension now uses intelligent batch processing that considers both text length and element count:

**Default Limits:**
- Maximum 8000 characters per batch
- Maximum 20 elements per batch
- Configurable via options page

**Batch Logic:**
1. Process elements sequentially until character limit or element limit reached
2. If a single element exceeds the character limit, it's still processed to avoid infinite loops
3. Progress is tracked accurately based on processed elements
4. Smaller batches provide better stability for complex content
5. Larger batches provide faster translation for simple content