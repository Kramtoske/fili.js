# Release Process

This document describes how to publish a new version of `@kramtoske/fili` to npm.

## Prerequisites

Before you can publish releases, you need to configure npm authentication. Choose one of the following methods:

### Option 1: NPM Trusted Publishing (Recommended)

This is the most secure method and doesn't require storing any tokens.

**Setup Steps:**
1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to https://www.npmjs.com/package/@kramtoske/fili/access
3. Under "Publishing access", select **"Require two-factor authentication and disallow tokens (recommended)"**
4. Under "Trusted publishers", click **"Add a new publisher"**
5. Enter:
   - **Provider**: GitHub
   - **Repository owner**: `Kramtoske`
   - **Repository name**: `fili.js`
   - **Workflow name**: `release.yml`
   - **Environment name**: `release`
6. Click **"Add publisher"**

See [.github/NPM_TRUSTED_PUBLISHING.md](.github/NPM_TRUSTED_PUBLISHING.md) for more details.

### Option 2: NPM Token (Alternative)

If you cannot set up trusted publishing:

1. Generate an automation token at https://www.npmjs.com/settings/~/tokens
2. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Your npm automation token
6. Click **"Add secret"**

The release workflow will automatically detect and use the token.

## Creating a Release

### 1. Update the version

```bash
# Update package.json version
npm version patch  # or minor, or major
```

This creates a commit and git tag automatically.

### 2. Push the tag

```bash
# Push the tag to trigger the release workflow
git push origin v2.0.x  # Replace with your version
```

### 3. Monitor the workflow

1. Go to https://github.com/Kramtoske/fili.js/actions
2. Watch the "Release" workflow
3. If it fails, check the logs for specific errors

## What the Release Workflow Does

The release workflow (`.github/workflows/release.yml`) automatically:

1. ✅ Checks out the tagged commit
2. ✅ Installs dependencies with `npm ci`
3. ✅ Builds dist files with `npm run build`
4. ✅ Generates SBOM (Software Bill of Materials)
5. ✅ Validates that tag version matches package.json version
6. ✅ Verifies all build artifacts exist
7. ✅ Publishes to npm (with provenance if using OIDC)
8. ✅ Creates/updates GitHub release with artifacts

## Build Artifacts

The following files are built and included in the npm package:

- `dist/fili.js` - Unminified browser bundle
- `dist/fili.min.js` - Minified browser bundle
- `dist/sbom.cdx.json` - Software Bill of Materials
- `src/` - Source files
- `index.js` - Entry point
- `README.md` - Documentation
- `LICENSE.md` - License

Note: The `dist/` directory is gitignored and built during the release process.

## Troubleshooting

### Build fails

If the build step fails, test locally:

```bash
npm ci
npm run build
npm test
```

Fix any errors and create a new tag.

### Publish fails with "404 Not found"

This means npm authentication is not configured. Follow the prerequisites above to set up either:
- Trusted publishing on npmjs.com (recommended), or
- NPM_TOKEN secret in GitHub

### Publish fails with version conflict

If you see "cannot publish over existing version", you need to:
1. Delete the git tag: `git tag -d v2.0.x && git push origin :v2.0.x`
2. Bump the version: `npm version patch`
3. Push the new tag: `git push origin v2.0.x`

### Workflow doesn't trigger

Make sure you pushed the tag to GitHub:
```bash
git push origin v2.0.x
```

The workflow only triggers on tags that match `v*` pattern.

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **Patch** (2.0.x): Bug fixes, no breaking changes
- **Minor** (2.x.0): New features, no breaking changes
- **Major** (x.0.0): Breaking changes

Use `npm version` to update:
```bash
npm version patch  # 2.0.15 → 2.0.16
npm version minor  # 2.0.15 → 2.1.0
npm version major  # 2.0.15 → 3.0.0
```
