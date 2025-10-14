#!/usr/bin/env bash
set -euo pipefail

if [[ "${WINDY_DRY_RUN:-0}" != "1" ]]; then
  if [[ -z "${WINDY_API_KEY:-}" ]]; then
    echo "❌ Error: WINDY_API_KEY is not set." >&2
    echo "    Add it to your environment or GitHub secrets before publishing." >&2
    exit 1
  fi
else
  echo "ℹ️ WINDY_DRY_RUN=1 — running in dry-run mode. The archive will not be uploaded."
fi

echo "🔍 Running pre-release checks..."
npm run prerelease

rm -f windy-plugin-heat-units.tar

echo "🔨 Building plugin..."
npm run build:prod

echo "📝 Updating plugin metadata..."
npm run update:metadata

echo "📦 Creating plugin archive..."
npm run package

archive_size=$(stat -c%s windy-plugin-heat-units.tar 2>/dev/null || stat -f%z windy-plugin-heat-units.tar)
echo "📊 Archive size: ${archive_size} bytes"

plugin_name=$(node --input-type=module -e "import { readFileSync } from 'node:fs'; const data = JSON.parse(readFileSync('plugin.json', 'utf8')); console.log(data.name ?? '')")
plugin_version=$(node --input-type=module -e "import { readFileSync } from 'node:fs'; const data = JSON.parse(readFileSync('plugin.json', 'utf8')); console.log(data.version ?? '')")

if [[ -z "$plugin_name" || -z "$plugin_version" ]]; then
  echo "⚠️ Unable to read plugin name/version from plugin.json" >&2
else
  echo "ℹ️ CDN URL template: https://windy-plugins.com/<your-user-id>/${plugin_name}/${plugin_version}/plugin.min.js"
fi

if [[ "${WINDY_DRY_RUN:-0}" == "1" ]]; then
  echo "🚫 Dry run enabled — skipping upload to Windy."
  exit 0
fi

echo "📤 Uploading plugin to Windy..."
response=$(curl -sS -L -w '%{http_code}' -o /tmp/windy_response.json --fail-with-body \
  -XPOST 'https://node.windy.com/plugins/v1.0/upload' \
  -H "x-windy-api-key: ${WINDY_API_KEY}" \
  -F 'plugin_archive=@./windy-plugin-heat-units.tar')
http_code="${response: -3}"

if [[ -f /tmp/windy_response.json ]]; then
  echo "📝 Windy response:"
  cat /tmp/windy_response.json
  echo
fi

if [[ "$http_code" == "403" ]]; then
  if grep -qi 'Method forbidden' /tmp/windy_response.json 2>/dev/null; then
    echo "❌ Upload blocked by network policy (Method forbidden). Try again from a different network." >&2
  fi
  rm -f /tmp/windy_response.json
  exit 1
fi

if [[ "$http_code" == "404" || "$http_code" == "410" ]]; then
  echo "❌ Upload endpoint not found (HTTP $http_code). Please verify the Windy API documentation." >&2
  rm -f /tmp/windy_response.json
  exit 1
fi

if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
  echo "✅ Plugin uploaded successfully."
  rm -f /tmp/windy_response.json
else
  echo "❌ Upload failed with HTTP $http_code" >&2
  rm -f /tmp/windy_response.json
  exit 1
fi
