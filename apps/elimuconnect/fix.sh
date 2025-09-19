#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing double quote syntax error in Profile.jsx...${NC}"

# Path to your Profile component
PROFILE_PATH="src/components/profile/Profile.jsx"

# Check if the file exists
if [ ! -f "$PROFILE_PATH" ]; then
    echo -e "${RED}Error: Profile.jsx not found at $PROFILE_PATH${NC}"
    echo "Please make sure you're running this script from your project root directory."
    exit 1
fi

echo -e "${YELLOW}Creating backup...${NC}"
cp "$PROFILE_PATH" "${PROFILE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}Fixing double quote error...${NC}"

# Fix the specific double quote issue on line 606
sed -i 's/mb-4"">Achievements/mb-4">Achievements/g' "$PROFILE_PATH"

# Fix any other similar double quote issues
sed -i 's/"">/">/g' "$PROFILE_PATH"

echo -e "${GREEN}✅ Double quote syntax error fixed!${NC}"
echo -e "${YELLOW}Fixed: mb-4\"\""> → mb-4\">${NC}"
echo -e "${GREEN}Your development server should now work!${NC}"
