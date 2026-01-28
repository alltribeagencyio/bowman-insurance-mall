#!/bin/bash
# Quick Push to GitHub Script

echo "========================================="
echo "Push to GitHub Script"
echo "========================================="
echo ""

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo "✓ Remote 'origin' already configured"
    echo "  URL: $(git remote get-url origin)"
else
    echo "⚠ No remote configured yet"
    echo ""
    echo "Please provide your GitHub repository URL:"
    echo "Example: https://github.com/yourusername/insuremall-kenya.git"
    read -p "Repository URL: " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✓ Remote added successfully"
    else
        echo "✗ No URL provided. Exiting."
        exit 1
    fi
fi

echo ""
echo "Pushing to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✓ Successfully pushed to GitHub!"
    echo "========================================="
    echo ""
    echo "Next step: Deploy to Vercel"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Click 'Add New' → 'Project'"
    echo "3. Import your GitHub repository"
    echo "4. Set Root Directory to: frontend"
    echo "5. Deploy!"
else
    echo ""
    echo "✗ Push failed. Please check your credentials."
fi
