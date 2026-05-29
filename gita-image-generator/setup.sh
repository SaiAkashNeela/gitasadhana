#!/bin/bash

# Gita Image Generator Setup Script

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Bhagavad Gita Image Generator - Setup Script              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check for Google credentials file
if [ ! -f "gita-credentials.json" ]; then
    echo "❌ Error: gita-credentials.json not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com"
    echo "2. Create a service account for Vertex AI"
    echo "3. Download the JSON key"
    echo "4. Place it as 'gita-credentials.json' in this directory"
    echo ""
    exit 1
fi

echo "✓ Google credentials file found"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file (update with your values)"
    echo ""
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed (required for production deployment)"
else
    echo "✓ Docker version: $(docker --version)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! Next Steps:                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Update .env file with your configuration:"
echo "   - GOOGLE_PROJECT_ID"
echo "   - GOOGLE_REGION"
echo "   - R2_ACCESS_KEY_ID"
echo "   - R2_SECRET_ACCESS_KEY"
echo "   - R2_ENDPOINT"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Generate prompts:"
echo "   npm run generate-prompts"
echo ""
echo "4. Generate images (optional, will cost money):"
echo "   npm run generate-images"
echo ""
echo "5. Upload to R2:"
echo "   npm run upload-to-r2"
echo ""
echo "6. Or run the complete pipeline:"
echo "   npm start"
echo ""
echo "For production deployment:"
echo "   docker-compose up"
echo ""
