# Netlify 404 Troubleshooting Guide

## Quick Fix Checklist

If you're seeing 404 errors, check these in order:

### ✅ 1. netlify.toml Location
- [ ] `netlify.toml` exists in **repository root** (not just in `app/`)
- [ ] File contains correct base directory: `base = "app"`

### ✅ 2. Netlify Build Settings
- [ ] Base directory: `app`
- [ ] Build command: `npm run build`
- [ ] Publish directory: **EMPTY** (leave blank - plugin handles it)

### ✅ 3. Next.js Plugin
- [ ] `@netlify/plugin-nextjs` is in `app/package.json` devDependencies
- [ ] Or plugin is auto-installed (check build logs)

### ✅ 4. Environment Variables
- [ ] All required env vars are set in Netlify dashboard
- [ ] No typos in variable names

### ✅ 5. Build Success
- [ ] Build completes without errors
- [ ] Build logs show "Next.js plugin detected"

## Common Issues & Solutions

### Issue: All routes return 404

**Symptoms:** Homepage and all routes show 404

**Causes:**
1. Publish directory set to `.next` (should be empty)
2. Next.js plugin not installed
3. Base directory incorrect

**Solution:**
```bash
# 1. Install plugin if missing
cd app
npm install --save-dev @netlify/plugin-nextjs

# 2. In Netlify dashboard:
# - Set Base directory: app
# - Set Build command: npm run build  
# - Set Publish directory: (leave empty)

# 3. Commit and redeploy
git add app/package.json
git commit -m "Add Netlify plugin"
git push
```

### Issue: Build fails with "Cannot find module"

**Solution:**
1. Ensure `app/package.json` and `app/package-lock.json` are committed
2. Check that `node_modules` is in `.gitignore`
3. Netlify will auto-install dependencies

### Issue: Environment variable errors

**Solution:**
1. Go to Netlify → Site settings → Environment variables
2. Add all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (update after first deploy)
   - `CRON_SECRET`

### Issue: Build succeeds but site is blank/404

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set
3. Check Netlify Functions tab - should see Next.js functions
4. Try accessing `/api/viewer` to test API routes

## Step-by-Step Redeploy

If nothing works, try a clean redeploy:

1. **Clear Netlify cache:**
   - Site settings → Build & deploy → Clear cache

2. **Verify netlify.toml in root:**
   ```bash
   # Should exist at repository root
   ls netlify.toml
   ```

3. **Update Netlify settings:**
   - Base directory: `app`
   - Build command: `npm run build`
   - Publish directory: (empty)

4. **Trigger new deployment:**
   - Push a commit, or
   - Deploys → Trigger deploy

5. **Monitor build logs:**
   - Should see "Installing dependencies"
   - Should see "Next.js plugin detected"
   - Should see "Build completed successfully"

## Verification Steps

After deployment, verify:

1. **Homepage loads:** `https://your-site.netlify.app`
2. **API routes work:** `https://your-site.netlify.app/api/viewer`
3. **No console errors:** Check browser dev tools
4. **Functions created:** Netlify → Functions tab shows Next.js functions

## Still Stuck?

1. Check build logs for specific error messages
2. Test build locally: `cd app && npm run build`
3. Compare your setup with working example
4. Review Netlify Next.js documentation

