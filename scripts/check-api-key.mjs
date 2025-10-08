#!/usr/bin/env node
/**
 * Simple utility to verify that the WINDY_API_KEY environment variable
 * is configured before running release automation.
 */
const apiKey = process.env.WINDY_API_KEY?.trim();

if (!apiKey) {
  console.error("❌ WINDY_API_KEY is not set.\n\n" +
    "Set the environment variable before invoking release commands.\n" +
    "For example:\n" +
    "  export WINDY_API_KEY=your_api_key_here\n" +
    "  npm run release");
  process.exit(1);
}

if (/^\*+$/.test(apiKey)) {
  console.warn("⚠️  The WINDY_API_KEY appears to be masked (only asterisks).\n" +
    "Double-check that your secret manager or shell exported the real value before releasing.");
}

console.log("✅ WINDY_API_KEY is configured. Ready to run release workflows.");
