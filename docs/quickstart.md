# Quick Start: Release Workflow

Guide for maintainers releasing new versions.

## Release Process

### 1. Update Version and Build

```bash
# Update version in deno.json manually
# Then create and push tag
git tag -a v0.2.0 -m "Release v0.2.0

- Feature highlights
- Bug fixes
- Breaking changes (if any)"

git push origin main
git push origin v0.2.0
```

### 2. GitHub Actions Builds Automatically

The workflow triggers on tags and:
- Compiles binaries for macOS (arm64/x86_64) and Linux
- Calculates SHA256 checksums
- Creates GitHub release with binaries
- Generates release notes

Check progress at: https://github.com/spantree/fluent-toolkit/actions

Or use `gh` CLI:
```bash
gh run watch
```

### 3. Update Homebrew Formula

Once the release is created, copy checksums from release notes and update `Formula/fluent-toolkit.rb`:

```ruby
version "0.2.0"  # Update version

# Update URLs (change version number)
url "https://github.com/spantree/fluent-toolkit/releases/download/v0.2.0/ftk-darwin-arm64"
sha256 "NEW_CHECKSUM_HERE"  # From release notes
```

Commit and push:

```bash
git add Formula/fluent-toolkit.rb
git commit -m "chore(formula): update checksums for v0.2.0"
git push origin main
```

### 4. Test Installation

```bash
brew update
brew upgrade fluent-toolkit

# Verify
ftk --version
```

## Automated Release Script (Optional)

For convenience, use the release script:

```bash
./scripts/release.sh 0.2.0
```

This updates version, compiles binaries, and calculates checksums locally. You still need to:
1. Push the tag
2. Update formula with checksums from GitHub release
3. Test installation

## Troubleshooting

### GitHub Actions Failed

Check logs:
```bash
gh run view --log
```

Common issues:
- Type errors: Run `deno check src/main.ts` locally
- Compilation errors: Test `deno task compile:all`

### Formula Checksum Mismatch

Download binary and verify manually:
```bash
curl -L -o ftk https://github.com/spantree/fluent-toolkit/releases/download/v0.2.0/ftk-darwin-arm64
shasum -a 256 ftk
```

Compare with formula.

## Release Checklist

- [ ] Version updated in `deno.json`
- [ ] Tag created and pushed
- [ ] GitHub Actions completed successfully
- [ ] Formula updated with new checksums
- [ ] Formula changes committed and pushed
- [ ] Installation tested locally
- [ ] Release notes reviewed

## Commit Message Convention

All commits must follow Conventional Commits:

```
type(scope): subject max 50 chars

Body wrapped at 72 characters.
```

Examples:
- `feat(registry): add new MCP server`
- `fix(cli): handle missing config gracefully`
- `chore(formula): update checksums for v0.2.0`
- `docs: update installation instructions`

See [CLAUDE.md](../CLAUDE.md) for full details.
