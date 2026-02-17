# Release Process

This repository currently releases **on GitHub only**.

The release workflow builds `dist/` artifacts and attaches them to a GitHub Release.
NPM publishing is intentionally disabled for now.

## Create a release

1. Bump version in `package.json`.
2. Create and push a tag that matches the version:
   ```bash
   git tag v2.0.x
   git push origin v2.0.x
   ```
3. Or run the `Release` workflow manually and provide `release_tag` (for example `v2.0.x`).

## What the workflow does

1. Checks out the selected tag.
2. Installs dependencies (`npm ci`).
3. Builds distributables (`npm run build`).
4. Generates SBOM (`npm run sbom`).
5. Validates tag version matches `package.json`.
6. Uploads artifacts (`dist/fili.js`, `dist/fili.min.js`, `dist/sbom.cdx.json`).
7. Creates a GitHub Release with those files attached.

## Notes

- The workflow trigger is tags matching `v*`.
- If a tag push did not trigger, use `workflow_dispatch` with `release_tag`.
