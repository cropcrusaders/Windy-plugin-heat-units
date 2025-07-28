# Release Process

## Overview

This repository uses GitHub Actions to automatically build and publish the Windy plugin when changes are pushed to the main branch.

## Scripts

### `scripts/release.sh`

A robust release script that:
- Validates the WINDY_API_KEY environment variable is set
- Builds the plugin using `npm run build`
- Creates the plugin archive using `npm run package`
- Uploads the archive to Windy using their API

### Usage

```bash
# For local testing (will fail without real API key)
WINDY_API_KEY="your-api-key" npm run release

# Or directly run the script
WINDY_API_KEY="your-api-key" ./scripts/release.sh
```

## GitHub Actions

The workflow is configured to:
1. Run on pushes to main branch and pull requests
2. Build the plugin for testing on all runs
3. Only publish to Windy on main branch pushes
4. Use the `WINDY_API_KEY` secret from repository settings

## Required Secrets

Make sure the following secret is configured in the GitHub repository settings:
- `WINDY_API_KEY`: Your Windy plugin API key

## Troubleshooting

If the release fails:
1. Check that the `WINDY_API_KEY` secret is properly set in repository settings
2. Verify the API key has the correct permissions
3. Check the GitHub Actions logs for detailed error messages
4. Ensure the plugin builds successfully locally