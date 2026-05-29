#!/bin/bash

# Gita Image Generator - Run Specific Script

set -e

SCRIPT=$1
ARGS=${@:2}

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Bhagavad Gita Image Generator                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

case $SCRIPT in
  "prompts")
    echo "🎨 Generating prompts for 719 assets..."
    node src/generatePrompts.js
    ;;
  
  "validate")
    echo "✓ Validating prompts..."
    node src/validatePrompts.js
    ;;
  
  "images")
    echo "🖼️  Generating images with Imagen 4 Ultra..."
    echo "⚠️  This will cost $0.06 per image!"
    node src/generateImages.js $ARGS
    ;;
  
  "upload")
    echo "📤 Uploading images to R2..."
    node src/uploadToR2.js $ARGS
    ;;
  
  "pipeline")
    echo "🚀 Running complete pipeline..."
    node src/index.js
    ;;
  
  "stats")
    echo "📊 Generation Statistics"
    echo ""
    if [ -f "data/prompts.json" ]; then
      echo "✓ Prompts: $(jq 'length' data/prompts.json 2>/dev/null || echo 'N/A')"
    else
      echo "✗ Prompts: Not generated"
    fi
    
    if [ -f "data/generation-results.json" ]; then
      echo "✓ Generated Images: $(jq 'length' data/generation-results.json 2>/dev/null || echo 'N/A')"
    else
      echo "✗ Generated Images: Not created"
    fi
    
    if [ -f "data/upload-results.json" ]; then
      echo "✓ Uploaded to R2: $(jq '[.[] | select(.uploadSuccess == true)] | length' data/upload-results.json 2>/dev/null || echo 'N/A')"
    else
      echo "✗ R2 Uploads: Not created"
    fi
    echo ""
    ;;
  
  "logs")
    echo "📋 Last 50 lines of logs:"
    tail -50 logs/combined.log 2>/dev/null || echo "No logs yet"
    ;;
  
  "clean")
    echo "🗑️  Cleaning up generated files..."
    rm -rf data/*.json images/* logs/*
    echo "✓ Cleaned"
    ;;
  
  "help"|""|"-h"|"--help")
    echo "Usage: ./run.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  prompts      Generate image prompts"
    echo "  validate     Validate prompts"
    echo "  images       Generate images (costs money!)"
    echo "  upload       Upload images to R2"
    echo "  pipeline     Run full pipeline"
    echo "  stats        Show generation statistics"
    echo "  logs         Show recent logs"
    echo "  clean        Remove generated files"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run.sh prompts            # Generate all 719 prompts"
    echo "  ./run.sh images 0 10        # Generate first 10 images"
    echo "  ./run.sh upload 0 50        # Upload first 50 images"
    echo "  ./run.sh stats              # Show statistics"
    ;;
  
  *)
    echo "❌ Unknown command: $SCRIPT"
    echo "Run './run.sh help' for available commands"
    exit 1
    ;;
esac

echo ""
