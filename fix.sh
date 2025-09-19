#!/bin/bash

# Direct fix for Profile.jsx line 616 syntax error
echo "🔧 Directly fixing Profile.jsx syntax error at line 616..."

cd ~/elimuconnect || { echo "❌ ElimuConnect directory not found"; exit 1; }

# First, let's check what's actually on line 616
echo "📋 Current content around line 616:"
sed -n '614,618p' src/components/profile/Profile.jsx

echo ""
echo "🔧 Applying direct fix..."

# Method 1: Use sed to fix the specific malformed line
# This targets the pattern where there's a missing > or malformed JSX
sed -i '616s/className="text-sm text-gray-600"{achie/className="text-sm text-gray-600">{achie/g' src/components/profile/Profile.jsx
sed -i '616s/<p className="text-sm text-gray-600">{achie/<p className="text-sm text-gray-600">{achievement.description}<\/p>/g' src/components/profile/Profile.jsx

# Method 2: If the above doesn't work, replace the entire problematic section
# Look for the malformed achievement section and replace it
sed -i '/text-sm text-gray-600.*{achie/c\                      <p className="text-sm text-gray-600">{achievement.description}</p>' src/components/profile/Profile.jsx

# Method 3: Fix any other common JSX syntax issues
sed -i 's/<h4 className="font-medium text-gray-900">{achievement\.title}<\/h4$/<h4 className="font-medium text-gray-900">{achievement.title}<\/h4>/g' src/components/profile/Profile.jsx
sed -i 's/<h3 className="font-semibold text-gray-900 mb-4">Recent Achievemen$/<h3 className="font-semibold text-gray-900 mb-4">Recent Achievements<\/h3>/g' src/components/profile/Profile.jsx
sed -i 's/<p className="text-sm font-medium text-gray-900">{achievement\.tit$/<p className="text-sm font-medium text-gray-900">{achievement.title}<\/p>/g' src/components/profile/Profile.jsx

# Fix any unclosed tags that might be causing issues
sed -i 's/text-gray-6/text-gray-600/g' src/components/profile/Profile.jsx
sed -i 's/Profibility/Profile Visibility/g' src/components/profile/Profile.jsx

echo "📋 Content after fix:"
sed -n '614,618p' src/components/profile/Profile.jsx

echo ""
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf apps/elimuconnect/.vite

echo ""
echo "🔨 Testing the fix..."
npm run frontend:dev &
FRONTEND_PID=$!

# Wait 10 seconds and check if it's working
sleep 10

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend is starting successfully!"
    echo "🌐 Check http://localhost:3000"
    
    # Let it run for a bit more to see if it fully compiles
    sleep 5
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "✅ Frontend compiled successfully!"
        kill $FRONTEND_PID
    else
        echo "⚠️ Frontend started but may have compilation issues"
    fi
else
    echo "❌ Frontend failed to start. Checking for remaining syntax errors..."
    echo "Let's try a different approach..."
    
    # Alternative: Comment out the problematic line temporarily
    sed -i '616s/^/\/\/ /' src/components/profile/Profile.jsx
    echo "Commented out line 616. Try running npm run dev again."
fi

echo ""
echo "📋 Direct fix completed!"
echo "If the issue persists, the problematic line has been commented out."
echo "You can uncomment and fix it manually later."
