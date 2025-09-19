#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing missing dependencies for ElimuConnect...${NC}"

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Make sure you're in the project root directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing dependencies...${NC}"

# Install the missing dependencies
npm install \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  react-hot-toast \
  react-helmet-async \
  lucide-react \
  framer-motion \
  react-hook-form

echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo ""
echo -e "${YELLOW}Installed packages:${NC}"
echo "  ✅ @tanstack/react-query - Data fetching and caching"
echo "  ✅ @tanstack/react-query-devtools - Development tools for React Query"
echo "  ✅ react-hot-toast - Toast notifications"
echo "  ✅ react-helmet-async - Document head management"
echo "  ✅ lucide-react - Icon library"
echo "  ✅ framer-motion - Animation library"
echo "  ✅ react-hook-form - Form handling"
echo ""
echo -e "${GREEN}🚀 You can now run 'npm run dev' to start your development server!${NC}"
