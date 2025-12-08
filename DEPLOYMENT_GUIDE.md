# 🚀 InterviewQuest Deployment Guide

## Quick Deploy to GitHub Pages

### Prerequisites
- ✅ Git repository (you already have this)
- ✅ GitHub account
- ✅ Code pushed to GitHub

### Step 1: Prepare for Deployment

**Important: Before deploying, you MUST regenerate your API key!**

Your current API key was exposed in Git history. Follow these steps:

1. **Revoke old key**: Visit https://makersuite.google.com/app/apikey
2. **Create new key**: Click "Create API Key"
3. **Update Lambda**: Go to AWS Lambda Console → `interview-quest-evaluator` → Configuration → Environment variables → Update `GOOGLE_API_KEY`
4. **Test API**: Run `node test-api.js` to verify it works

### Step 2: Clean Your Repository (CRITICAL!)

Before deploying publicly, clean the exposed credentials from Git history:

**Option A: Nuclear (Easiest - Recommended)**
```bash
# Backup your code first!
# Then delete Git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit - InterviewQuest v1.0"
```

**Option B: Keep History (Advanced)**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch test-*.py *.md" \
  --prune-empty -- --all
```

### Step 3: Push to GitHub

If you haven't already:

```bash
# Create a new repository on GitHub (don't initialize with README)
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/InterviewQuest.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 5: Wait for Deployment

- GitHub will build and deploy your site (takes 1-2 minutes)
- Your site will be available at: `https://YOUR_USERNAME.github.io/InterviewQuest/`
- You'll see a green checkmark when it's ready

### Step 6: Test Your Deployed Site

1. Visit your GitHub Pages URL
2. Test all features:
   - ✅ Start Game button works
   - ✅ Boss selection appears
   - ✅ Questions load from questions.json
   - ✅ Answer submission works
   - ✅ Lives, XP, and combo systems work
   - ✅ Achievements unlock
   - ✅ Voice input works (if browser supports it)
   - ✅ Victory card generation works

## Alternative Deployment Options

### Option 2: Netlify (Drag & Drop)

1. Go to https://app.netlify.com/drop
2. Drag your project folder
3. Done! Instant deployment with custom domain support

### Option 3: Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts, and your site will be live!

### Option 4: AWS S3 + CloudFront

For production-grade hosting:

1. Create S3 bucket
2. Enable static website hosting
3. Upload `index.html` and `questions.json`
4. Set up CloudFront for HTTPS
5. Configure custom domain (optional)

## Files to Deploy

Your deployment only needs these files:
- ✅ `index.html` (main game file)
- ✅ `questions.json` (interview questions)
- ❌ All other files are for development only

## Custom Domain (Optional)

### For GitHub Pages:

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. Add a `CNAME` file to your repository:
   ```
   interviewquest.yourdomain.com
   ```
3. Configure DNS records:
   - Type: `CNAME`
   - Name: `interviewquest` (or `@` for root)
   - Value: `YOUR_USERNAME.github.io`
4. In GitHub Settings → Pages, add your custom domain
5. Enable "Enforce HTTPS"

## Post-Deployment Checklist

- [ ] API key regenerated and Lambda updated
- [ ] Git history cleaned of exposed credentials
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Site is live and accessible
- [ ] All game features tested on live site
- [ ] API evaluation working (not using mock fallback)
- [ ] Mobile responsiveness verified
- [ ] Voice input tested (on supported browsers)
- [ ] Victory card sharing tested

## Monitoring & Analytics (Optional)

Add Google Analytics to track usage:

1. Create Google Analytics account
2. Get tracking ID
3. Add this before `</head>` in index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Issue: Site shows 404
- **Solution**: Make sure `index.html` is in the root directory
- **Solution**: Wait 2-3 minutes for GitHub Pages to build

### Issue: Questions don't load
- **Solution**: Check browser console for CORS errors
- **Solution**: Ensure `questions.json` is in the same directory as `index.html`

### Issue: API returns 500 errors
- **Solution**: Regenerate Google API key
- **Solution**: Update Lambda environment variable
- **Solution**: Test with `node test-api.js`

### Issue: Styles look broken
- **Solution**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- **Solution**: Clear browser cache

## Security Best Practices

✅ **DO:**
- Keep API keys in Lambda environment variables (not in code)
- Use `.gitignore` to prevent committing sensitive files
- Regenerate keys if exposed
- Use HTTPS (GitHub Pages provides this automatically)

❌ **DON'T:**
- Commit API keys to Git
- Share your Lambda endpoint publicly (it's already in your code, but that's okay since the key is in Lambda)
- Skip the Git history cleaning step

## Performance Optimization (Optional)

Your site is already fast, but you can optimize further:

1. **Minify HTML**: Use https://www.willpeavy.com/tools/minifier/
2. **Compress images**: If you add any images later
3. **Enable caching**: GitHub Pages does this automatically
4. **Use CDN**: GitHub Pages uses a CDN by default

## Sharing Your Game

Once deployed, share your game:

- 🐦 Twitter: "Check out my interview practice game! 🎮"
- 💼 LinkedIn: "Built a gamified interview practice tool"
- 📧 Email: Send to friends and colleagues
- 📱 QR Code: Generate one for your GitHub Pages URL

## Next Steps After Deployment

1. **Share on social media** with screenshots
2. **Add to your portfolio** as a project
3. **Collect feedback** from users
4. **Monitor usage** (if you added analytics)
5. **Iterate and improve** based on feedback

## Support

If you encounter issues:
1. Check browser console for errors
2. Test API with `node test-api.js`
3. Verify Lambda function is working in AWS Console
4. Check GitHub Actions tab for deployment status

---

**Your game is ready to go live! 🎉**

Once you complete the steps above, InterviewQuest will be accessible to anyone with the URL. Good luck with your deployment!
