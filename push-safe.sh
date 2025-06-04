#!/bin/bash

# Ensure you're in the project root
cd /path/to/mongodb-log-insight-frontend

# Make sure .env.local is excluded
echo ".env.local" >> .gitignore

# Stage all changes but exclude .env.local explicitly
git add . ':!*.env.local'

# Commit with a custom message
git commit -m "Update project files excluding .env.local"

# Pull latest changes with rebase to avoid conflicts
git pull origin main --rebase

# Push changes to the main branch
git push origin main
