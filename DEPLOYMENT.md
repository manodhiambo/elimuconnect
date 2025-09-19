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
