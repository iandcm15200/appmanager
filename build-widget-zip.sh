#!/bin/bash

# Build Zendesk Widget ZIP
# This script creates the apmanager-student-search.zip file for Zendesk

set -e

WIDGET_DIR="zendesk-widget"
OUTPUT_ZIP="apmanager-student-search.zip"
TEMP_BUILD="build-temp"

echo "Building Zendesk Widget ZIP..."

# Clean previous build
rm -f "$OUTPUT_ZIP"
rm -rf "$TEMP_BUILD"

# Create temp build directory
mkdir -p "$TEMP_BUILD"

# Copy files to temp directory
echo "Copying widget files..."
cp "$WIDGET_DIR/manifest.json" "$TEMP_BUILD/"
cp -r "$WIDGET_DIR/assets" "$TEMP_BUILD/"
cp -r "$WIDGET_DIR/translations" "$TEMP_BUILD/"

# Remove hidden files and unnecessary files
echo "Cleaning up unnecessary files..."
find "$TEMP_BUILD" -name ".DS_Store" -delete
find "$TEMP_BUILD" -name "*.swp" -delete
find "$TEMP_BUILD" -name "Thumbs.db" -delete

# Create ZIP
echo "Creating ZIP archive..."
cd "$TEMP_BUILD"
zip -r "../$OUTPUT_ZIP" . -x "*.git*" -x "__MACOSX*"
cd ..

# Clean temp directory
rm -rf "$TEMP_BUILD"

# Show result
echo ""
echo "✅ Widget ZIP created successfully!"
echo "📦 File: $OUTPUT_ZIP"
echo "📏 Size: $(du -h "$OUTPUT_ZIP" | cut -f1)"
echo ""
echo "Structure:"
unzip -l "$OUTPUT_ZIP"
echo ""
echo "Ready to upload to Zendesk!"
