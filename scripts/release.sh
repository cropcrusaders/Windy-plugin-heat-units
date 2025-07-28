#!/bin/bash

# Release script for Windy Plugin Heat Units
# This script builds the plugin, packages it, and uploads it to Windy

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Windy Plugin Release Process...${NC}"

# Check if WINDY_API_KEY is set
if [ -z "$WINDY_API_KEY" ]; then
    echo -e "${RED}Error: WINDY_API_KEY environment variable is not set${NC}"
    echo "Please set the WINDY_API_KEY before running this script."
    exit 1
fi

echo -e "${GREEN}✓ WINDY_API_KEY is set${NC}"

# Build the plugin
echo -e "${YELLOW}Building plugin...${NC}"
npm run build

# Package the plugin
echo -e "${YELLOW}Creating plugin archive...${NC}"
npm run package

# Verify the package was created
if [ ! -f "./windy-plugin-heat-units.tar" ]; then
    echo -e "${RED}Error: Plugin archive was not created${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Plugin archive created${NC}"

# Upload to Windy
echo -e "${YELLOW}Uploading to Windy...${NC}"
response=$(curl --fail -s -w "%{http_code}" -XPOST 'https://www.windy-plugins.com/plugins/v1.0/upload' \
    -H "x-windy-api-key: $WINDY_API_KEY" \
    -F 'plugin_archive=@./windy-plugin-heat-units.tar' \
    -o /tmp/windy_response.txt)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Plugin successfully uploaded to Windy!${NC}"
    if [ -f "/tmp/windy_response.txt" ]; then
        echo "Response:"
        cat /tmp/windy_response.txt
    fi
else
    echo -e "${RED}Error: Upload failed with HTTP status $response${NC}"
    if [ -f "/tmp/windy_response.txt" ]; then
        echo "Response:"
        cat /tmp/windy_response.txt
    fi
    exit 1
fi

echo -e "${GREEN}🎉 Release completed successfully!${NC}"