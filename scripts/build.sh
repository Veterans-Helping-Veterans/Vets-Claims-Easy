#!/bin/bash

# Build script for Netlify deployment

# Install dependencies
echo "Installing dependencies..."
npm install

# Set up Supabase database
echo "Setting up Supabase database..."
node ./scripts/setup-supabase.js

# Build the project
echo "Building project..."
npm run build

# Copy static assets
echo "Copying static assets..."
cp -r css docs/css
cp -r images docs/images
cp -r js docs/js

# Ensure all HTML files are in the docs folder
echo "Copying HTML files..."
cp *.html docs/

# Create Netlify config files
echo "Creating Netlify configuration..."
cat > docs/_redirects << EOL
/api/*  /.netlify/functions/:splat  200
/*      /index.html                 200
EOL

echo "Build complete!"
