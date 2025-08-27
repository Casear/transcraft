# 🚀 TransCraft Initial Setup Guide

This guide walks you through the **first-time setup** process to get your extension published and automated deployment configured.

## 📋 Prerequisites Checklist

- [ ] Chrome Web Store Developer Account ($5 one-time registration fee)
- [ ] Extension package built (`transcraft-extension.zip` is ready)
- [ ] GitHub repository with deployment workflows

## 🥚 Step 1: Manual First Upload

### 1.1 Chrome Web Store Developer Dashboard
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the $5 developer registration fee (if not done already)
4. Click **"Add new item"**

### 1.2 Upload Extension Package
1. Click **"Choose file"** and select `transcraft-extension.zip`
2. Click **"Upload"**
3. Wait for the upload to complete

### 1.3 Fill Out Store Listing
You'll need to provide the following information:

#### **Basic Information**
- **Name**: `TransCraft - AI Web Translation`
- **Summary**: `Professional AI-powered webpage translation with 5+ AI services including local Ollama support`
- **Category**: `Productivity`
- **Language**: Choose your primary language

#### **Detailed Description**
```
🌐 PROFESSIONAL AI WEB TRANSLATION

TransCraft provides intelligent webpage translation using multiple AI services with expert translation modes.

✨ KEY FEATURES
• Real-time webpage translation with original formatting preserved
• 5 AI services: OpenAI, Claude, Gemini, OpenRouter, and Ollama (local)
• Expert translation modes for novels, technical docs, academic papers
• Intelligent language detection to skip unnecessary translations
• Smart batch processing for optimal performance
• Elegant floating UI with instant toggle
• Auto-translate mode for seamless browsing
• Multi-language interface (English, Chinese, Japanese)

🤖 AI SERVICE SUPPORT
• OpenAI: GPT-4o, GPT-4o Mini models
• Claude: Claude 3.5 Sonnet, Claude 3 Haiku
• Google Gemini: Gemini 2.5 Flash, Gemini 2.0 Flash
• OpenRouter: Access 300+ models through unified API
• Ollama: 100% private local AI (no internet required)

🎯 EXPERT TRANSLATION MODES
• General: High-quality standard translation
• Novel modes: Romance, Fantasy, Mystery, Sci-Fi, Historical
• Technical: Precise documentation translation
• Academic: Scholarly works with formal tone
• Business: Professional communications
• Custom: Create your own specialized modes

🛡️ PRIVACY & PERFORMANCE
• Cloud services: Encrypted API communication
• Ollama: 100% local processing, no data leaves your computer
• Configurable batch processing for optimal speed/cost balance
• Smart language detection prevents unnecessary API calls
• Extension works completely offline with Ollama

🌍 SUPPORTED LANGUAGES
Traditional Chinese, Simplified Chinese, English, Japanese, Korean, Spanish, French, German, and more.

Perfect for students, researchers, professionals, and anyone who needs high-quality translation while browsing the web.
```

#### **Screenshots & Media**
You'll need to provide:
1. **Screenshots** (1280x800 or 640x400):
   - Extension popup interface
   - Floating button on a webpage
   - Options/settings page
   - Translation in action on a webpage
   - Language selection menu

2. **Small Icon** (128x128): Already in `images/transcraft-128.png`

#### **Privacy Practices**
- **Data handling**: Select what data your extension accesses
- **Privacy policy**: You may need to create one if handling user data

### 1.4 Submit for Review (Don't Publish Yet)
1. Fill out all required fields
2. Click **"Submit for review"**
3. **Important**: Select **"Submit for review only"** (don't publish immediately)
4. **Copy the Extension ID** from the URL - it looks like: `abcdefghijklmnopqrstuvwxyz123456`

The Extension ID will appear in the URL like this:
```
https://chrome.google.com/webstore/devconsole/abcdefghijklmnopqrstuvwxyz123456
```

## 🔧 Step 2: Setup OAuth 2.0 Credentials

### 2.1 Enable Chrome Web Store API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **"Chrome Web Store API"**
4. Go to **APIs & Services** → **Credentials**

### 2.2 Create OAuth 2.0 Client
1. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
2. If prompted, configure the OAuth consent screen:
   - Application type: **External** (unless you have a Google Workspace)
   - App name: `TransCraft Deployment`
   - User support email: Your email
   - Developer contact: Your email
3. For Application type, select **"Desktop application"**
4. Name: `TransCraft Chrome Web Store Deployment`
5. Click **"Create"**
6. **Download the JSON file** - you'll need the `client_id` and `client_secret`

## 🔐 Step 3: Get Refresh Token

### 3.1 Generate Authorization URL
Replace `YOUR_CLIENT_ID` with your actual client ID and open this URL in browser:

```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline
```

### 3.2 Get Authorization Code
1. Authorize the application
2. Copy the authorization code from the browser

### 3.3 Exchange for Refresh Token
Run this curl command (replace ALL_CAPS placeholders):

```bash
curl -X POST \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  -d "access_type=offline" \
  https://oauth2.googleapis.com/token
```

Copy the `refresh_token` from the response.

## ⚙️ Step 4: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these Repository secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `CHROME_EXTENSION_ID` | Your extension ID from Step 1.4 | `abcdefghijklmnopqrstuvwxyz123456` |
| `CHROME_CLIENT_ID` | From OAuth credentials JSON | `123456789012-abc...xyz.apps.googleusercontent.com` |
| `CHROME_CLIENT_SECRET` | From OAuth credentials JSON | `GOCSPX-abc...xyz123` |
| `CHROME_REFRESH_TOKEN` | From Step 3.3 | `1//04abc...xyz` |

## 🧪 Step 5: Test Automated Deployment

### 5.1 Manual Test Deploy
1. Go to **Actions** → **Manual Deploy to Chrome Web Store**
2. Click **"Run workflow"**
3. Select **"patch"** for version type
4. Set **Publish** to `false` (for testing)
5. Click **"Run workflow"**

### 5.2 Verify Success
1. Check the workflow run completes successfully
2. Verify a new version appears in your Chrome Web Store Developer Dashboard
3. Check that a GitHub release was created

### 5.3 First Automated Release
Once testing is successful:
1. Run the workflow again with **Publish** set to `true`
2. Your extension will go live on the Chrome Web Store!

## 🎉 Step 6: Future Releases

Now you can use the automated deployment system:

```bash
# Quick patch release
npm run release

# Minor version release  
npm run release:minor

# Or use GitHub UI for manual control
```

## 🆘 Troubleshooting

### Common Issues During Setup

#### Extension ID Not Found
- **Problem**: Extension wasn't uploaded to Chrome Web Store yet
- **Solution**: Complete Step 1 first

#### Invalid OAuth Credentials  
- **Problem**: Wrong client_id or client_secret
- **Solution**: Re-download OAuth credentials JSON file

#### Refresh Token Expired
- **Problem**: `invalid_grant` error
- **Solution**: Regenerate refresh token using Step 3

#### Chrome Web Store API Not Enabled
- **Problem**: API access denied
- **Solution**: Enable Chrome Web Store API in Google Cloud Console

#### Extension Rejected
- **Problem**: Extension doesn't meet Chrome Web Store policies
- **Solution**: Review and fix policy violations, resubmit

## 📞 Support

If you encounter issues:
1. Check the **Actions** tab for detailed error logs
2. Review Chrome Web Store Developer policies
3. Ensure all required fields are filled in the store listing
4. Verify OAuth credentials are correctly configured

## 🎯 Success Checklist

- [ ] Extension uploaded and Extension ID obtained
- [ ] OAuth 2.0 credentials created and downloaded
- [ ] Refresh token generated successfully  
- [ ] All GitHub secrets configured
- [ ] Test deployment workflow completed successfully
- [ ] Extension published to Chrome Web Store
- [ ] Automated deployment system working

Once completed, you'll have a fully automated deployment pipeline! 🚀