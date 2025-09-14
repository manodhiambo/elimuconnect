#!/bin/bash

echo "🏗️  Building ElimuConnect for Production"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the API
echo "🔧 Building API..."
cd api
npm run build
cd ..

# Build the frontend
echo "🎨 Building Frontend..."
npm run frontend:build

echo "✅ Production build completed!"
echo "📁 API build output: api/dist/"
echo "📁 Frontend build output: dist/apps/elimuconnect/"
