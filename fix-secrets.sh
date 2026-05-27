#!/bin/bash

echo "🔒 Fixing secrets in git history..."

# Remove backend/.env from git tracking (keep local file)
git rm --cached backend/.env

# Remove the problematic commit files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch test-google-oauth.md backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

echo "✅ Git history cleaned!"
echo ""
echo "📝 Next steps:"
echo "1. Force push: git push origin master --force"
echo "2. Or create new commit and push"
