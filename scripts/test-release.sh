#!/bin/bash

# Test script for validating the release process
# This script tests various scenarios for the release script

set -e

echo "Testing Windy Plugin Release Script..."

# Test 1: No API key
echo "Test 1: Running without WINDY_API_KEY (should fail)"
if npm run release; then
    echo "❌ Test 1 FAILED: Script should have failed without API key"
    exit 1
else
    echo "✅ Test 1 PASSED: Script correctly failed without API key"
fi

# Test 2: With fake API key (should fail at upload)
echo "Test 2: Running with fake WINDY_API_KEY (should fail at upload)"
if WINDY_API_KEY="fake-key" npm run release; then
    echo "❌ Test 2 FAILED: Script should have failed with fake API key"
    exit 1
else
    echo "✅ Test 2 PASSED: Script correctly failed with fake API key"
fi

# Test 3: Build process works
echo "Test 3: Testing build process"
if npm run build; then
    echo "✅ Test 3 PASSED: Build process works correctly"
else
    echo "❌ Test 3 FAILED: Build process failed"
    exit 1
fi

# Test 4: Package process works
echo "Test 4: Testing package process"
if npm run package; then
    echo "✅ Test 4 PASSED: Package process works correctly"
    # Clean up
    rm -f windy-plugin-heat-units.tar
else
    echo "❌ Test 4 FAILED: Package process failed"
    exit 1
fi

echo "🎉 All tests passed! The release script is working correctly."