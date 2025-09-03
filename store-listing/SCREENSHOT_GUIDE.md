# Screenshot Guide for Chrome Web Store

## 📸 Required Screenshots

Chrome Web Store requires **at least 1** screenshot, but recommends **4-5** for better presentation.

**Specifications**:
- **Dimensions**: 1280x800 pixels OR 640x400 pixels
- **Format**: PNG or JPEG
- **Quality**: High quality, clear and crisp
- **No**: Blurred areas, personal information, or policy violations

## 📋 Recommended Screenshot Set

### 1. Extension Popup Interface (Main Hero Shot)
**Filename**: `01-main-interface.png`

**Setup**:
1. Install the extension locally
2. Click the extension icon
3. Ensure popup shows:
   - TransCraft logo and title
   - Language selector set to "Traditional Chinese"
   - Translation mode selector
   - "Translate This Page" button
   - Clean interface without errors

**Caption**: "Simple and intuitive interface - translate any webpage with one click"

### 2. Floating Button in Action
**Filename**: `02-floating-button.png`

**Setup**:
1. Navigate to an English article website (e.g., BBC, Wikipedia)
2. Ensure floating button is visible in bottom-right
3. Click the language selector part to show dropdown
4. Capture with:
   - Webpage content clearly visible
   - Floating button prominently displayed
   - Language menu open showing options

**Caption**: "Non-intrusive floating button - always accessible translation controls"

### 3. Translation Result Example
**Filename**: `03-translation-result.png`

**Setup**:
1. Translate a webpage with mixed content (headings, paragraphs)
2. Show the blue translation blocks below original text
3. Ensure visible:
   - Original English text
   - Blue translated text blocks below
   - Clean formatting preserved
   - "Restore Original" state in floating button

**Caption**: "Preserve original content while viewing translations side-by-side"

### 4. Options Page - AI Services
**Filename**: `04-ai-services.png`

**Setup**:
1. Open the options page
2. Show the AI service selection dropdown expanded
3. Highlight the variety:
   - OpenAI
   - Claude
   - Gemini
   - OpenRouter
   - Ollama
4. Show some API key fields (blur any actual keys)

**Caption**: "Choose from 5 AI services including local Ollama for complete privacy"

### 5. Expert Translation Modes
**Filename**: `05-expert-modes.png`

**Setup**:
1. Scroll to Expert Mode Management section
2. Show the list of available modes:
   - General
   - Novel modes (Romance, Fantasy, etc.)
   - Technical
   - Academic
   - Business
3. Have one mode expanded to show details

**Caption**: "Specialized translation modes for novels, technical docs, and more"

## 🎨 Screenshot Best Practices

### Do's:
- ✅ Use a clean, professional website for demos
- ✅ Ensure text is readable and UI elements are clear
- ✅ Show the extension actively working
- ✅ Use consistent browser window size
- ✅ Include diverse content types (text, headings, lists)

### Don'ts:
- ❌ Include personal information or emails
- ❌ Show error messages or broken states
- ❌ Use copyrighted content prominently
- ❌ Include other browser extensions' icons
- ❌ Show incomplete or loading states

## 🖼️ Additional Marketing Assets

### Small Promotional Tile (440x280)
**Filename**: `promo-small.png`
- Extension logo
- "TransCraft" text
- Tagline: "AI-Powered Web Translation"
- Clean gradient background

### Large Promotional Tile (920x680)  
**Filename**: `promo-large.png`
- Similar to small tile but with more visual elements
- Maybe show supported AI service logos
- Feature highlights as icons

### Marquee Promotional Tile (1400x560)
**Filename**: `promo-marquee.png`
- Wide banner format
- Show multiple features
- "5+ AI Services • Expert Modes • Local AI Support"

## 🛠️ Tools for Screenshots

### Browser Setup:
```javascript
// Paste in console to set consistent window size
window.resizeTo(1366, 850); // Gives you 1280x800 viewport approximately
```

### Recommended Tools:
1. **Chrome DevTools** - Built-in screenshot feature
2. **Awesome Screenshot** - Chrome extension
3. **macOS**: Cmd+Shift+4 then Space for window capture
4. **Windows**: Win+Shift+S for snipping tool

### Quick Screenshot Script:
```javascript
// Run in console to hide sensitive elements before screenshot
document.querySelectorAll('input[type="password"]').forEach(el => el.value = '••••••••••••••••');
document.querySelectorAll('[data-sensitive]').forEach(el => el.style.filter = 'blur(5px)');
```

## 📝 Screenshot Checklist

Before submitting:
- [ ] All screenshots are exactly 1280x800 or 640x400
- [ ] No personal information visible
- [ ] Extension is shown working properly
- [ ] Consistent visual style across all screenshots
- [ ] Captions clearly explain each feature
- [ ] File sizes are optimized (under 1MB each)
- [ ] Screenshots show diverse use cases
- [ ] UI elements are crisp and readable

## 🌍 Localized Screenshots (Optional)

Consider creating screenshot sets for:
- Traditional Chinese interface
- Japanese interface
- Different webpage languages being translated

This helps users in different markets understand the extension better.

## 💡 Pro Tips

1. **Best Time**: Take screenshots on a weekday when news sites have good content
2. **Best Sites**: Wikipedia, BBC, Tech blogs, Documentation sites
3. **Consistency**: Use the same browser profile and window size
4. **Annotations**: Consider adding subtle arrows or highlights in image editor
5. **Compression**: Use TinyPNG or similar to optimize file sizes

Remember: Good screenshots significantly improve installation rates!