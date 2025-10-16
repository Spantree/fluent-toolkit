#!/bin/bash
# Release automation script for fluent-toolkit

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.1.0"
  exit 1
fi

echo "🚀 Releasing fluent-toolkit v$VERSION"
echo ""

# 1. Update version in deno.json
echo "📝 Updating version in deno.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" deno.json
rm deno.json.bak

# 2. Compile binaries
echo "🔨 Compiling binaries..."
deno task compile:all

# 3. Calculate checksums
echo "🔐 Calculating SHA256 checksums..."
echo ""
echo "ARM64 (Apple Silicon):"
shasum -a 256 dist/ftk-darwin-arm64
echo ""
echo "x86_64 (Intel Mac):"
shasum -a 256 dist/ftk-darwin-x86_64
echo ""
echo "Linux x86_64:"
shasum -a 256 dist/ftk-darwin-x86_64
echo ""

# 4. Git operations
echo "📦 Creating git tag..."
git add deno.json
git commit -m "Release v$VERSION" || echo "No changes to commit"
git tag -a "v$VERSION" -m "Release v$VERSION"

echo ""
echo "✅ Release preparation complete!"
echo ""
echo "Next steps:"
echo "  1. Push tag: git push origin v$VERSION"
echo "  2. Create GitHub release at: https://github.com/spantree/fluent-toolkit/releases/new"
echo "  3. Upload binaries from dist/ folder"
echo "  4. Update homebrew-tap formula with new version and checksums"
echo ""
echo "Checksums (copy these to the formula):"
echo "  ARM64:  $(shasum -a 256 dist/ftk-darwin-arm64 | awk '{print $1}')"
echo "  x86_64: $(shasum -a 256 dist/ftk-darwin-x86_64 | awk '{print $1}')"
echo "  Linux:  $(shasum -a 256 dist/ftk-linux-x86_64 | awk '{print $1}')"
