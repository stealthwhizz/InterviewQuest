#!/bin/bash
# Script to remove secrets from Git history

echo "🔒 Removing secrets from Git history..."

# Remove the files with secrets from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch test-bedrock-credentials.py test-gemini-direct.py test-gemini-api.py test-bearer-token.py" \
  --prune-empty --tag-name-filter cat -- --all

echo "✅ Files removed from Git history"
echo ""
echo "⚠️  IMPORTANT: You must now:"
echo "1. Regenerate your Google API key immediately"
echo "2. Force push to remote: git push origin --force --all"
echo "3. Notify anyone who has cloned the repo to re-clone"
