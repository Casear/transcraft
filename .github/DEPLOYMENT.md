# Chrome Web Store Deployment Setup

This document explains how to set up automated deployment to Chrome Web Store using GitHub Actions.

## 🔐 Required Secrets

You need to configure the following secrets in your GitHub repository:

### 1. Chrome Web Store Developer Dashboard Setup

First, you need to set up API access in the Chrome Web Store Developer Dashboard:

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Go to **Settings** → **API Access**
3. Click **Create Credentials** and choose **OAuth 2.0 Client ID**
4. Set up the OAuth consent screen if required
5. Download the credentials JSON file

### 2. GitHub Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**, and add these secrets:

#### `CHROME_EXTENSION_ID`
- Your published extension's ID from the Chrome Web Store URL
- Example: `abcdefghijklmnopqrstuvwxyz123456`
- If not yet published, you'll get this after first manual upload

#### `CHROME_CLIENT_ID`
- From the OAuth credentials JSON file
- Field: `installed.client_id`
- Example: `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

#### `CHROME_CLIENT_SECRET`
- From the OAuth credentials JSON file  
- Field: `installed.client_secret`
- Example: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

#### `CHROME_REFRESH_TOKEN`
- This requires a one-time manual process to obtain
- See detailed steps below

### 3. Getting the Refresh Token

The refresh token requires a one-time setup:

#### Step 1: Get Authorization Code
1. Replace `YOUR_CLIENT_ID` in this URL and open in browser:
```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

2. Authorize the application
3. Copy the authorization code from the response

#### Step 2: Get Refresh Token
Run this curl command (replace placeholders):
```bash
curl -X POST \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  https://accounts.google.com/o/oauth2/token
```

3. Copy the `refresh_token` from the response

## 🚀 Deployment Workflows

### Automatic Deployment
- **Trigger**: Creating a new GitHub release
- **Process**: Test → Build → Deploy to Chrome Web Store
- **Result**: Extension automatically published to Chrome Web Store

### Manual Deployment  
- **Trigger**: Manual workflow dispatch
- **Process**: Build extension package only
- **Result**: Downloadable artifact for manual upload

### Continuous Integration
- **Trigger**: Push to main branch or pull requests
- **Process**: Validate manifest.json and check file integrity
- **Result**: Ensures code quality before deployment

## 📝 Release Process

### 1. Update Version
Update the version in `manifest.json`:
```json
{
  "version": "1.0.1",
  ...
}
```

### 2. Commit and Push
```bash
git add manifest.json
git commit -m "Bump version to 1.0.1"
git push
```

### 3. Create GitHub Release
```bash
git tag v1.0.1
git push origin v1.0.1
```

Or create a release through GitHub UI:
- Go to **Releases** → **Create a new release**
- Tag: `v1.0.1`
- Title: `TransCraft v1.0.1`
- Description: List of changes
- Click **Publish release**

### 4. Automatic Deployment
GitHub Actions will automatically:
- ✅ Run tests and validation
- 📦 Build the extension package
- 🚀 Deploy to Chrome Web Store
- 📎 Attach the built package to the GitHub release

## 🔍 Monitoring Deployment

### GitHub Actions
- Check the **Actions** tab for workflow status
- View logs for detailed deployment information
- Download built artifacts if needed

### Chrome Web Store
- Check your [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- New version should appear in review queue
- Extension will be live after Chrome review (usually 1-3 days)

## 🛠️ Troubleshooting

### Common Issues

#### Invalid Credentials
- **Error**: `Invalid client_id or client_secret`
- **Solution**: Verify the OAuth credentials are correct

#### Missing Extension ID
- **Error**: `Extension not found`
- **Solution**: First upload must be done manually to get the extension ID

#### Invalid Refresh Token
- **Error**: `Invalid refresh token`
- **Solution**: Regenerate the refresh token using the steps above

#### Manifest Validation Errors
- **Error**: Various manifest validation errors
- **Solution**: Check manifest.json format and required fields

### Testing Locally

Before pushing, you can test the build process locally:

```bash
# Validate manifest
node -pe "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"

# Create test build
mkdir -p test-build
cp -r js css images manifest.json popup.html options.html test-build/
cd test-build
zip -r ../test-extension.zip . -x "*.DS_Store"
cd ..
```

## 📋 Checklist Before First Deployment

- [ ] Extension published manually once to get Extension ID
- [ ] Chrome Web Store Developer API access configured
- [ ] OAuth 2.0 credentials created and downloaded
- [ ] All GitHub secrets configured correctly
- [ ] Refresh token generated and added to secrets
- [ ] Test workflow runs successfully
- [ ] Extension version updated in manifest.json

## 🔗 Useful Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Web Store API Reference](https://developer.chrome.com/docs/webstore/api/)
- [GitHub Actions Marketplace - Chrome Extension Upload](https://github.com/marketplace/actions/chrome-extension-upload-action)