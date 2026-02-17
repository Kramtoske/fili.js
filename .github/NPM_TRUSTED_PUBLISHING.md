# NPM Trusted Publishing Setup

This repository uses NPM's **Trusted Publishing** feature with OIDC (OpenID Connect) for secure, token-free package publishing.

## What is Trusted Publishing?

Trusted Publishing allows NPM to verify that a package is being published from a legitimate source (GitHub Actions) without requiring long-lived NPM tokens. This is NPM's recommended approach for maximum security.

## Benefits

- ✅ **No secrets required** - No NPM tokens stored in GitHub Secrets
- ✅ **Automatic authentication** - GitHub Actions provides OIDC token automatically
- ✅ **Provenance signing** - Package provenance is cryptographically signed
- ✅ **Maximum security** - Follows NPM's recommendation: "Require two-factor authentication and disallow tokens"

## How It Works

1. **GitHub Actions** provides an OIDC token with workflow identity
2. **setup-node action** configures NPM authentication using the OIDC token
3. **NPM validates** the token against configured trusted publishers
4. **Package is published** with cryptographic provenance

## Setup Instructions

### 1. Configure NPM Trusted Publisher

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Navigate to your package settings: `https://www.npmjs.com/package/@kramtoske/fili/access`
3. Scroll to **"Publishing access"** section
4. Select **"Require two-factor authentication and disallow tokens (recommended)"**
5. Under **"Trusted publishers"**, click **"Add a new publisher"**
6. Enter the following details:
   - **Provider**: GitHub
   - **Repository owner**: `Kramtoske`
   - **Repository name**: `fili.js`
   - **Workflow name**: `release.yml`
   - **Environment name**: `release`
7. Click **"Add publisher"**

### 2. Workflow Configuration

The release workflow (`.github/workflows/release.yml`) is already configured:

```yaml
permissions:
  contents: write
  id-token: write  # Required for OIDC

jobs:
  release:
    environment: release  # Must match NPM trusted publisher config
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          registry-url: 'https://registry.npmjs.org'
      
      - name: Publish to npm (OIDC)
        run: npm publish --provenance --access public
```

**Key points:**
- `id-token: write` permission enables OIDC token generation
- `environment: release` must match the environment name configured in NPM
- `registry-url` configures npm authentication
- `--provenance` enables cryptographic signing
- No `NODE_AUTH_TOKEN` or secrets needed!

### 3. GitHub Environment (Optional)

You can add protection rules to the `release` environment:
1. Go to repository **Settings** → **Environments** → **release**
2. Configure protection rules (e.g., required reviewers)
3. This adds an extra security layer before publishing

## Publishing a Release

1. Ensure your package version is updated in `package.json`
2. Create and push a git tag:
   ```bash
   git tag v2.0.14
   git push origin v2.0.14
   ```
3. The workflow will automatically:
   - Build the package
   - Validate the tag matches package.json version
   - Publish to NPM using OIDC authentication
   - Create a GitHub release with assets

## Troubleshooting

## Troubleshooting

### "Unable to authenticate" or "404 Not found" error

**Cause**: Trusted publisher not configured in NPM or configuration mismatch

**Error messages you might see:**
```
npm notice Access token expired or revoked. Please try logging in again.
npm error 404 Not Found - PUT https://registry.npmjs.org/@kramtoske%2ffili
npm error 404  '@kramtoske/fili@X.X.X' is not in this registry.
```

**Solution**: 
1. Verify NPM trusted publisher settings match:
   - Repository: `Kramtoske/fili.js`
   - Workflow: `release.yml`
   - Environment: `release`
2. Go to https://www.npmjs.com/package/@kramtoske/fili/access
3. Under "Publishing access", select "Require two-factor authentication and disallow tokens (recommended)"
4. Add GitHub as a trusted publisher with the exact settings above

**Alternative Solution (if trusted publishing setup is not possible):**
1. Generate an NPM automation token at https://www.npmjs.com/settings/~/tokens
2. Add it as a GitHub secret named `NPM_TOKEN`
3. The workflow will automatically use token-based authentication as a fallback

### "Unable to authenticate" error

**Cause**: Trusted publisher not configured in NPM or configuration mismatch

**Solution**: Verify NPM trusted publisher settings match:
- Repository: `Kramtoske/fili.js`
- Workflow: `release.yml`
- Environment: `release`

### "id-token permission required" error

**Cause**: Missing `id-token: write` permission in workflow

**Solution**: Already configured in our workflow (line 11)

### Provenance verification fails

**Cause**: Package published without provenance or verification issue

**Solution**: Ensure `--provenance` flag is present in `npm publish` command (already configured)

## Security Notes

- **Never commit NPM tokens** to the repository
- **Remove any NPM_TOKEN secrets** from GitHub repository settings (no longer needed)
- **Enable 2FA** on your NPM account
- **Review environment protection rules** for additional security

## References

- [NPM Trusted Publishers Documentation](https://docs.npmjs.com/generating-provenance-statements#publishing-packages-with-provenance-via-github-actions)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
