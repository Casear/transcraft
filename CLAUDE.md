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

This is a Chrome Extension (Manifest v3) that provides AI-powered webpage translation using five AI services including local AI. The extension uses a **modular architecture** where the content script is divided into specialized modules.

### Core Architecture Components

**Background Service Worker (`js/background.js`)**
- Handles all API communications with OpenAI, Claude, Gemini, OpenRouter, and Ollama
- Centralized translation logic with error handling
- API connection testing functionality
- Message routing between content script and options page

**Modular Content Script Architecture**
The content script is now modularized into 8 specialized modules plus a main orchestrator:

1. **`js/modules/state.js`** - Global state management
   - Centralized state storage (translation status, settings, UI state)
   - State persistence and reset functionality
   - Domain-specific state tracking

2. **`js/modules/debug.js`** - Debug utilities and i18n
   - Debug logging with conditional output
   - Internationalization initialization for content scripts
   - Floating message notifications
   - Localization utilities

3. **`js/modules/languageDetection.js`** - Language detection
   - Automatic source language detection
   - Skip translation if already in target language
   - Configurable detection character limits

4. **`js/modules/translationAPI.js`** - Translation API interface
   - API communication with background service
   - Batch text processing and cleanup
   - Translation result parsing and error handling

5. **`js/modules/modal.js`** - Error modal system
   - Custom modal dialogs (no browser alerts)
   - Error categorization and user-friendly messages
   - Modal lifecycle management

6. **`js/modules/floatingButton.js`** - Floating UI
   - Pill-shaped floating button (translation + language selection)
   - Language menu management
   - Button state updates and styling

7. **`js/modules/autoTranslate.js`** - Auto-translation
   - Automatic translation on page load
   - SPA navigation detection
   - Auto-translate toggle functionality

8. **`js/modules/translation.js`** - Translation processing
   - Block-level DOM element identification
   - Intelligent batch processing
   - Translation display and restoration

9. **`js/content.js`** - Main orchestrator
   - Module loading coordination using `waitForModules()` pattern
   - Initialization sequence management
   - Message handling between background and modules

**Options Page (`options.html` + `js/options.js`)**
- Dynamic UI that shows only selected API service's settings
- Supports 55+ AI models across all five services
- Model categorization (fast/balanced/powerful)
- Expert mode management with custom prompts
- API key management with visibility toggles

**Internationalization (`js/i18n.js`)**
- Multi-language support (English, Traditional Chinese, Japanese)
- Message localization system with fallbacks
- Interface language persistence in Chrome storage
- Cross-context compatibility (browser, service worker, modules)

### Module Loading Pattern

The content script uses a sophisticated module loading pattern:

```javascript
const waitForModules = () => {
  return new Promise((resolve) => {
    const checkModules = () => {
      if (window.TransCraftState && 
          window.TransCraftDebug && 
          window.TransCraftLanguageDetection &&
          window.TransCraftTranslationAPI &&
          window.TransCraftModal &&
          window.TransCraftFloatingButton &&
          window.TransCraftAutoTranslate &&
          window.TransCraftTranslation) {
        resolve();
      } else {
        setTimeout(checkModules, 50);
      }
    };
    checkModules();
  });
};
```

**Module Loading Order (from manifest.json):**
1. `js/i18n.js` - Internationalization foundation
2. `js/modules/state.js` - State management
3. `js/modules/debug.js` - Debug utilities  
4. `js/modules/languageDetection.js` - Language detection
5. `js/modules/translationAPI.js` - API interface
6. `js/modules/modal.js` - Modal system
7. `js/modules/floatingButton.js` - UI components
8. `js/modules/autoTranslate.js` - Auto-translation
9. `js/modules/translation.js` - Translation logic
10. `js/content.js` - Main orchestrator

### Key Technical Patterns

**Translation Flow:**
1. Content script identifies translatable block elements (P, H1-H6, LI, TD, etc.)
2. Language detection module checks if translation is needed
3. Translation module batches text based on character length and element count limits
4. Combines text using `<<TRANSLATE_SEPARATOR>>` delimiter
5. Background worker calls selected AI service API
6. Content script displays translations below original text

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

**Expert Mode System:**
- Customizable translation prompts for different content types
- Built-in modes: General, Novel (Romance, Fantasy, etc.), Technical, Academic, Business
- User-defined custom modes with `{targetLanguage}` placeholders
- Common prompt instructions appended to all modes

### Data Storage Structure

Chrome Storage Sync stores:
```javascript
{
  selectedApi: 'openai'|'claude'|'gemini'|'openrouter'|'ollama',
  apiKeys: { [service]: 'key_value' },
  selectedModel: 'model_identifier',
  targetLanguage: 'zh-TW'|'en'|'ja'|etc,
  expertMode: 'general'|'novel_romance'|'technical'|etc,
  maxBatchLength: 8000,    // Default: 8000 characters per batch
  maxBatchElements: 20,    // Default: 20 elements per batch
  requestTimeout: 60,      // Default: 60 seconds per request
  languageDetectionEnabled: true,
  languageDetectionChars: 600,
  debugMode: false,
  interfaceLanguage: 'en'|'zh-TW'|'ja',
  autoTranslateEnabled: false,
  expertModes: { /* custom expert modes */ },
  commonPromptInstructions: '/* common translation instructions */'
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
- Modular architecture allows for easy maintenance and feature additions
- Each module exposes its functionality via `window.TransCraft*` global objects

## Batch Processing Details

The extension uses intelligent batch processing that considers both text length and element count:

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

## Language Detection System

**Features:**
- Automatic source language detection before translation
- Skip translation if content is already in target language
- Configurable character sample size (default: 600 characters)
- User can enable/disable via options page

**Implementation:**
- Samples text from multiple DOM elements
- Uses AI service for language detection
- Shows user-friendly notifications when translation is skipped
- Preserves detection results to avoid redundant API calls