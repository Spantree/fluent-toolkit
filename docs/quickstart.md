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

### 2. GitHub Actions Builds and Updates Formula

The workflow triggers on tags and automatically:

- Compiles binaries for macOS (arm64/x86_64) and Linux
- Calculates SHA256 checksums
- Creates GitHub release with binaries
- Generates release notes
- Updates `Formula/fluent-toolkit.rb` with new version and checksums
- Commits and pushes formula changes

Check progress at: https://github.com/spantree/fluent-toolkit/actions

Or use `gh` CLI:

```bash
gh run watch
```

### 3. Test Installation

```bash
brew update
brew upgrade fluent-toolkit

# Verify
ftk --version
```

## Local Testing Script (Optional)

For local testing before pushing a tag:

```bash
./scripts/release.sh 0.2.0
```

This locally:

- Updates version in deno.json
- Compiles binaries
- Calculates checksums

Use this to verify builds work before creating the actual release tag. The GitHub Actions workflow will handle the full release process when you push the tag.

## Troubleshooting

### GitHub Actions Failed

Check logs:

```bash
gh run view --log
```

Common issues:

- Type errors: Run `deno check src/main.ts` locally
- Compilation errors: Test `deno task compile:all`
- Formula update failed: Check GitHub Actions logs for git push errors

## Release Checklist

- [ ] Version updated in `deno.json`
- [ ] Tag created and pushed
- [ ] GitHub Actions completed successfully (includes automatic formula update)
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
