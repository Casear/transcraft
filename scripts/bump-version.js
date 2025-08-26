#!/usr/bin/env node

/**
 * Version Bump Script for TransCraft Extension
 * Usage: node scripts/bump-version.js [patch|minor|major]
 * 
 * This script:
 * 1. Updates version in manifest.json
 * 2. Creates a git commit with the version change
 * 3. Creates a git tag for the new version
 * 4. Optionally pushes to remote
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest.json');

function getCurrentVersion() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  return manifest.version;
}

function updateVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function updateManifest(newVersion) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  manifest.version = newVersion;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json version to ${newVersion}`);
}

function createCommitAndTag(version) {
  try {
    // Check if there are any changes to commit
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
      console.log('⚠️  No changes to commit');
      return;
    }

    // Add the manifest.json file
    execSync('git add manifest.json');
    console.log('📝 Added manifest.json to git');

    // Create commit
    const commitMessage = `Bump version to ${version}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    execSync(`git commit -m "${commitMessage}"`);
    console.log(`✅ Created commit for version ${version}`);

    // Create tag
    execSync(`git tag v${version}`);
    console.log(`🏷️  Created tag v${version}`);

    return true;
  } catch (error) {
    console.error('❌ Error creating commit and tag:', error.message);
    return false;
  }
}

function pushToRemote(version) {
  try {
    console.log('🚀 Pushing to remote...');
    execSync('git push');
    execSync(`git push origin v${version}`);
    console.log('✅ Successfully pushed commit and tag to remote');
    
    console.log('\n🎉 Release process initiated!');
    console.log(`📦 GitHub Actions will automatically deploy v${version} to Chrome Web Store`);
    console.log('🔗 Check the Actions tab in your GitHub repository for progress');
    
  } catch (error) {
    console.error('❌ Error pushing to remote:', error.message);
    console.log('💡 You can manually push with: git push && git push origin v' + version);
  }
}

function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0] || 'patch';
  const shouldPush = args.includes('--push') || args.includes('-p');

  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('❌ Invalid bump type. Use: patch, minor, or major');
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const newVersion = updateVersion(currentVersion, bumpType);

  console.log(`🔄 Bumping version: ${currentVersion} → ${newVersion} (${bumpType})`);

  // Update manifest.json
  updateManifest(newVersion);

  // Create commit and tag
  const success = createCommitAndTag(newVersion);
  
  if (success && shouldPush) {
    pushToRemote(newVersion);
  } else if (success) {
    console.log('\n💡 To push and trigger deployment, run:');
    console.log(`   git push && git push origin v${newVersion}`);
    console.log('\n   Or use: node scripts/bump-version.js ${bumpType} --push');
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, updateVersion, updateManifest };