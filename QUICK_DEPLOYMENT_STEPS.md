# Quick Deployment Steps

Your code is ready to deploy! Follow these simple steps:

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `insuremall-kenya`
3. Make it **Private**
4. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, run these commands:

```bash
cd "d:\Bowman\Web App 2.0 - Mall"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/insuremall-kenya.git

# Push code
git push -u origin master
```

**If you get authentication error:**
- Go to https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select `repo` scope
- Copy the token
- Use token as password when pushing

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select `insuremall-kenya` repository
5. **IMPORTANT:** Set Root Directory to `frontend`
6. Add environment variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:8000`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Done! Your site is live at `https://insuremall-kenya.vercel.app`

## Current Status

✅ Git repository initialized
✅ All changes committed
✅ .gitignore configured
✅ vercel.json configured
✅ Ready to push to GitHub
⏳ Waiting for GitHub remote setup
⏳ Waiting for Vercel deployment

## Files Ready for Deployment

- 52 files committed
- ~15,778 lines of code added
- All Phase 8 admin panel features included
- All Phase 7 dashboard features included
- All Phase 6 payment features included

## What's Deployed

**Frontend Pages:**
- Landing page
- Login/Register
- Marketplace
- Policy details
- Checkout & Payment
- Customer Dashboard (7 pages)
- Admin Panel (7 pages)

**Note:** Backend integration required for full functionality.
Currently using mock data for development.

---

See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions!
