#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up ElimuConnect for Vercel deployment...${NC}"

# Step 1: Create vercel.json
echo -e "${YELLOW}Creating vercel.json configuration...${NC}"
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "elimuconnect",
  "builds": [
    {
      "src": "dist/apps/elimuconnect/**",
      "use": "@vercel/static"
    },
    {
      "src": "api/dist/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/dist/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/dist/apps/elimuconnect/$1",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/dist/apps/elimuconnect/index.html"
    }
  ],
  "outputDirectory": "dist/apps/elimuconnect",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "functions": {
    "api/dist/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
EOF

# Step 2: Create .env.example
echo -e "${YELLOW}Creating .env.example for environment variables...${NC}"
cat > .env.example << 'EOF'
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elimuconnect?retryWrites=true&w=majority
DATABASE_URL=your_database_url

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for caching - optional)
REDIS_URL=redis://localhost:6379

# File Upload (if using cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Node Environment
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# API URL
API_URL=https://your-app.vercel.app/api
EOF

# Step 3: Create .gitignore additions
echo -e "${YELLOW}Updating .gitignore...${NC}"
cat >> .gitignore << 'EOF'

# Environment variables
.env
.env.local
.env.production

# Vercel
.vercel

# Build outputs
dist/
build/
EOF

# Step 4: Create deployment checklist
echo -e "${YELLOW}Creating deployment checklist...${NC}"
cat > DEPLOYMENT.md << 'EOF'
# ElimuConnect Deployment Checklist

## Pre-deployment Steps

### 1. Environment Setup
- [ ] Create MongoDB Atlas database
- [ ] Set up environment variables in Vercel dashboard
- [ ] Configure CORS origins for production domain

### 2. Code Preparation
- [ ] Ensure all dependencies are in package.json
- [ ] Test build locally: `npm run build`
- [ ] Commit all changes to Git

### 3. Vercel Configuration
- [ ] vercel.json is configured correctly
- [ ] Build and output directories are correct
- [ ] Environment variables are set in Vercel dashboard

## Required Environment Variables for Vercel

Add these in Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret | `your-32-char-secret` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `different-32-char-secret` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Your Vercel app URL | `https://elimuconnect.vercel.app` |

## Deployment Steps

### Method 1: Vercel Dashboard (Recommended)
1. Go to vercel.com and connect GitHub
2. Import your repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/apps/elimuconnect`
   - Install Command: `npm install`
4. Add environment variables
5. Deploy

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Post-deployment Verification

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] Authentication flow works
- [ ] File uploads work (if implemented)

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all deps are in package.json (not devDependencies for runtime deps)
- Verify Nx build works locally

### API Routes Don't Work
- Check function logs in Vercel dashboard
- Verify environment variables are set
- Check API file structure matches vercel.json

### Frontend Issues
- Verify static files are in correct output directory
- Check console for 404 errors on assets
- Ensure routing works for SPA
EOF

# Step 5: Test build locally
echo -e "${YELLOW}Testing build locally...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful! Ready for deployment.${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push your code to GitHub"
echo "2. Go to vercel.com and import your repository"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo -e "${YELLOW}Check DEPLOYMENT.md for detailed instructions.${NC}"
