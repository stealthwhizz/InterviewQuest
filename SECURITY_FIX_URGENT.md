# 🚨 URGENT: Security Fix Required

## What Happened

Your API keys were committed to Git and are now in the repository history:
- ❌ Google API Key: `AIzaSyCd1gs8cjr_zXJM9-vSTwYqbZeMKJDaqCI`
- ❌ AWS Bearer Token: `ABSKQmVkcm9ja0FQSUtleS1xbzdqLWF0LTI5MjM0MzgyNjAwNDpsaGRrKzdZYWI1MFVaazkzaHlwZ0FOc1E0NnJmaXBiMTAwVzFpajNuZWNqamUwR0VGUWRDR1o3SjRKcz0=`

## Immediate Actions (Do This NOW!)

### 1. Revoke the Exposed Google API Key

**Go to Google AI Studio:**
1. Visit: https://makersuite.google.com/app/apikey
2. Find the key: `AIzaSyCd1gs8cjr_zXJM9-vSTwYqbZeMKJDaqCI`
3. Click the trash/delete icon
4. Confirm deletion

**Create a new key:**
1. Click "Create API Key"
2. Copy the new key
3. Update Lambda environment variable with new key

### 2. Clean Git History

**Option A: Using Git Filter-Branch (Recommended)**

```bash
# Remove sensitive files from entire Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch test-bedrock-credentials.py test-gemini-direct.py test-gemini-api.py test-bearer-token.py list-gemini-models.py" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This rewrites history!)
git push origin --force --all
git push origin --force --tags
```

**Option B: Using BFG Repo-Cleaner (Faster)**

```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove files
bfg --delete-files test-bedrock-credentials.py
bfg --delete-files test-gemini-direct.py
bfg --delete-files test-gemini-api.py
bfg --delete-files test-bearer-token.py

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

**Option C: Nuclear Option (Easiest but loses history)**

```bash
# Delete .git folder and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit (cleaned)"
git remote add origin <your-repo-url>
git push -u origin main --force
```

### 3. Update Lambda with New Key

1. Go to AWS Lambda Console
2. Function: `interview-quest-evaluator`
3. Configuration → Environment variables
4. Update `GOOGLE_API_KEY` with your new key
5. Save

### 4. Commit the Cleaned Files

```bash
# The files have been cleaned of secrets
git add test-gemini-api.py test-gemini-direct.py test-bearer-token.py
git commit -m "Remove hardcoded API keys from test files"
git push
```

## Prevention for Future

### Use Environment Variables

Create a `.env` file (already in .gitignore):

```bash
# .env (NEVER commit this file!)
GOOGLE_API_KEY=your-new-key-here
AWS_BEARER_TOKEN=your-token-here
```

Update test scripts to read from environment:

```python
import os
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
```

### Install Pre-commit Hooks

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Set up hooks
git secrets --install
git secrets --register-aws
```

## Verify the Fix

After cleaning:

```bash
# Check if secrets are gone
git log --all --full-history --source --pretty=format:"%H" -- test-gemini-api.py

# Should return nothing if successfully removed
```

## If Repository is Public

If your repository is public on GitHub:
1. ⚠️ **Assume the keys are compromised**
2. Revoke ALL exposed keys immediately
3. Check for unauthorized usage in Google Cloud Console
4. Consider the repository permanently tainted
5. May need to create a new repository

## Summary Checklist

- [ ] Revoke old Google API key
- [ ] Create new Google API key
- [ ] Update Lambda with new key
- [ ] Clean Git history (choose one method above)
- [ ] Force push cleaned history
- [ ] Verify secrets are removed
- [ ] Test that game still works with new key
- [ ] Set up .env file for future
- [ ] Never commit API keys again!

## Cost Impact

Check Google Cloud Console for any unauthorized usage:
- https://console.cloud.google.com/apis/dashboard

If you see unexpected usage, report it to Google immediately.

## Need Help?

If you're unsure about any step, ask before proceeding. Cleaning Git history can be tricky!
