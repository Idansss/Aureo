# Fixing 404 Errors on Netlify

If you're getting 404 errors after deploying to Netlify, follow these steps:

## Common Causes of 404 Errors

1. **netlify.toml in wrong location** - Must be in repository root
2. **Base directory not set correctly** - Should be `app`
3. **Next.js plugin not installed** - Needs `@netlify/plugin-nextjs`
4. **Build failing silently** - Check build logs
5. **Environment variables missing** - Required for build

## Step-by-Step Fix

### 1. Verify netlify.toml Location

The `netlify.toml` file must be in your **repository root**, not in the `app/` folder.

**Current structure:**
```
Aureo/
├── netlify.toml          ← Should be here (root)
├── app/
│   ├── package.json
│   ├── src/
│   └── ...
```

If `netlify.toml` is only in `app/`, Netlify won't find it. I've created one in the root for you.

### 2. Check Netlify Build Settings

In Netlify Dashboard → **Site settings** → **Build & deploy** → **Build settings**:

- **Base directory:** `app` ✅
- **Build command:** `npm run build` ✅
- **Publish directory:** Leave **EMPTY** (Next.js plugin handles this) ⚠️

**Important:** Do NOT set publish directory to `.next` - the Next.js plugin handles this automatically.

### 3. Install Next.js Plugin (If Not Auto-Installed)

The plugin should install automatically, but if builds fail, install it manually:

```bash
cd app
npm install --save-dev @netlify/plugin-nextjs
```

Then commit and push:
```bash
git add app/package.json app/package-lock.json
git commit -m "Add Netlify Next.js plugin"
git push
```

### 4. Verify Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, ensure you have:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Recommended:**
- `NEXT_PUBLIC_SITE_URL` (update after first deploy with your actual URL)
- `CRON_SECRET`

### 5. Check Build Logs

1. Go to Netlify Dashboard → **Deploys**
2. Click on the failed deployment
3. Check the build logs for errors

**Common errors:**
- `Cannot find module` → Missing dependencies
- `Environment variable not found` → Add missing env vars
- `Build failed` → Check for TypeScript/compilation errors

### 6. Test Build Locally First

Before deploying, test the build locally:

```bash
cd app
npm install
npm run build
```

If the build fails locally, fix those errors first.

### 7. Clear Build Cache (If Needed)

If builds are stuck or showing old errors:

1. Netlify Dashboard → **Site settings** → **Build & deploy**
2. Scroll to **Build settings**
3. Click **Clear cache and retry deploy**

### 8. Verify Deployment

After fixing issues:

1. **Trigger new deployment:**
   - Push a new commit, OR
   - Netlify Dashboard → **Deploys** → **Trigger deploy**

2. **Wait for build to complete** (3-5 minutes)

3. **Check the deploy log:**
   - Should see: "Next.js plugin detected"
   - Should see: "Build completed successfully"

4. **Visit your site:**
   - Should load the homepage (not 404)

## Troubleshooting Specific Issues

### Issue: "404 Not Found" on all routes

**Cause:** Next.js plugin not working or publish directory set incorrectly

**Fix:**
1. Remove publish directory setting (leave empty)
2. Ensure `@netlify/plugin-nextjs` is in `app/package.json` devDependencies
3. Redeploy

### Issue: Build succeeds but site shows 404

**Cause:** Base directory or build command incorrect

**Fix:**
1. Verify base directory is `app` (not empty, not `.`)
2. Verify build command is `npm run build`
3. Check that `app/package.json` exists and has build script

### Issue: "Module not found" errors

**Cause:** Dependencies not installed

**Fix:**
1. Ensure `app/package.json` and `app/package-lock.json` are committed
2. Check that `node_modules` is in `.gitignore` (should be)
3. Netlify will run `npm install` automatically

### Issue: Environment variable errors

**Cause:** Missing or incorrect environment variables

**Fix:**
1. Double-check all env vars are set in Netlify dashboard
2. Ensure no typos in variable names
3. For `NEXT_PUBLIC_*` vars, they must be set before build

## Quick Checklist

Before deploying, verify:

- [ ] `netlify.toml` exists in repository root
- [ ] Base directory set to `app` in Netlify
- [ ] Build command is `npm run build`
- [ ] Publish directory is **empty** (not `.next`)
- [ ] All environment variables are set
- [ ] `app/package.json` has build script
- [ ] Local build works (`cd app && npm run build`)
- [ ] Code is pushed to Git

## Still Getting 404?

1. **Check the deploy log** - Look for errors or warnings
2. **Verify the build output** - Should see Next.js build messages
3. **Test a specific route** - Try `/api/viewer` to see if API routes work
4. **Check Netlify Functions** - Go to Functions tab, see if any are created

## Need More Help?

- Check build logs in Netlify dashboard
- Review [Netlify Next.js docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- See `app/NETLIFY_DEPLOYMENT.md` for detailed deployment guide

