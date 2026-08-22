#!/usr/bin/env bash
set -euo pipefail

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Nothing to publish."
  exit 0
fi

message="${1:-Update Small Things}"

echo "Checking and building the site..."
npm run build

echo
echo "Changes ready to publish:"
git status --short
echo
read -r -p "Publish these changes to main? [y/N] " answer

if [[ ! "$answer" =~ ^[Yy]$ ]]; then
  echo "Publish cancelled. Your files were not changed."
  exit 0
fi

git add --all
git commit -m "$message"
git push origin main

echo
echo "Published to GitHub. The deployment workflow is now running."
echo "Follow it at: https://github.com/skywalker19/home-site/actions"
