# Vercel Deployment Guide - Bowman Insurance Frontend

## Pre-Deployment Checklist

### ✅ Completed
- [x] Next.js 14 application setup
- [x] Tailwind CSS configuration
- [x] UI components (Button, Card, Input, Label)
- [x] Layout components (Navbar, Footer)
- [x] Homepage with modern design
- [x] Responsive design (mobile-first)
- [x] TypeScript configuration
- [x] Environment variables setup
- [x] Package.json with all dependencies

### 📦 Current Features
- Professional homepage with hero section
- Insurance category cards
- Feature highlights
- Mobile-responsive navigation
- Footer with links
- Modern UI with shadcn/ui components

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Push to GitHub

```bash
cd "d:\Bowman\Web App 2.0 - Mall"

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin <your-github-repo-url>

# Stage all files
git add .

# Commit
git commit -m "Initial commit - Bowman Insurance Platform"

# Push to GitHub
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository: "Web App 2.0 - Mall"

#### Step 3: Configure Project

Vercel will auto-detect Next.js. Configure the following:

**Framework Preset:** Next.js
**Root Directory:** `frontend`
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

#### Step 4: Environment Variables

Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
NEXT_PUBLIC_ENVIRONMENT=production
```

**Note:** For now, you can use a placeholder for the API URL. We'll update it once the backend is deployed.

#### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts
```

## Post-Deployment

### Your Live URLs

After deployment, you'll get:
- **Production URL:** `https://bowman-insurance.vercel.app` (or your custom domain)
- **Preview URLs:** Automatic for each Git push

### Configure Custom Domain (Optional)

1. Go to Project Settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `www.bowmaninsurance.co.ke`)
4. Update DNS records as instructed

### Monitor Your Deployment

Vercel provides:
- **Analytics:** Real-time visitor stats
- **Logs:** View build and function logs
- **Performance:** Web Vitals monitoring
- **Errors:** Automatic error tracking

Access at: `https://vercel.com/<your-username>/<project-name>`

## Testing Your Deployment

### 1. Homepage
Visit: `https://your-project.vercel.app`

Should see:
- Hero section with call-to-action buttons
- Insurance category cards
- Features section
- Call-to-action banner
- Responsive navbar and footer

### 2. Mobile Testing
- Open on mobile device
- Check responsive design
- Test mobile menu
- Verify touch interactions

### 3. Performance
Run Lighthouse audit:
- Open Chrome DevTools
- Go to Lighthouse tab
- Run audit
- Target: 90+ Performance Score

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
```

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://api.bowmaninsurance.co.ke/api/v1
NEXT_PUBLIC_ENVIRONMENT=production
```

## Continuous Deployment

Once connected to GitHub:
1. Any push to `main` branch = Production deployment
2. Any push to other branches = Preview deployment
3. Pull requests get unique preview URLs

## Monitoring & Analytics

### Built-in Vercel Analytics
- Page views
- Unique visitors
- Top pages
- Geographic data
- Device types

### Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)

## Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Ensure all dependencies are in package.json
npm install
npm run build  # Test locally first
```

**Error: TypeScript errors**
```bash
# Fix TypeScript errors
npm run type-check
```

### Runtime Errors

**API Connection Issues**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is configured on backend
- Check network tab in browser DevTools

### Performance Issues

**Slow Page Loads**
- Enable Vercel's Image Optimization
- Use dynamic imports for heavy components
- Check bundle size: `npm run build`

## Next Steps After Deployment

### 1. Test Live Site
- [ ] Visit homepage
- [ ] Test navigation
- [ ] Check mobile responsiveness
- [ ] Verify all links work

### 2. Share with Team
- [ ] Share production URL
- [ ] Get feedback on UI/UX
- [ ] Test on different devices/browsers

### 3. Backend Integration
- [ ] Deploy backend to Railway/Render/AWS
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Test API integration
- [ ] Verify CORS settings

### 4. Add More Features
- [ ] Authentication pages (/login, /register)
- [ ] Policy listing page
- [ ] Policy detail page
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Customer dashboard

## Deployment Checklist

Before deploying to production:

- [ ] All pages load without errors
- [ ] Mobile responsive on all screen sizes
- [ ] All environment variables set
- [ ] No console errors or warnings
- [ ] Images optimized
- [ ] Lighthouse score > 90
- [ ] Meta tags for SEO
- [ ] Favicon added
- [ ] Analytics configured
- [ ] Error tracking (Sentry) configured

## Useful Commands

```bash
# Test production build locally
npm run build
npm start

# Check bundle size
npm run build
# Look for .next/analyze/ output

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Support:** https://vercel.com/support

---

## Quick Deploy (One Command)

If you have Vercel CLI installed and project configured:

```bash
cd frontend
vercel --prod
```

That's it! Your site will be live in minutes.

---

**Status:** Ready for Deployment ✅
**Est. Build Time:** 2-3 minutes
**Expected Performance Score:** 90+

Good luck with your deployment! 🚀
