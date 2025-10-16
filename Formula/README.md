# Homebrew Formula

This directory contains the Homebrew formula for fluent-toolkit.

## What is this?

This `Formula/` directory makes this repository a Homebrew tap. When colleagues run:

```bash
brew tap spantree/fluent-toolkit
```

Homebrew will find and make available all `.rb` formula files in this directory.

## Installing

**One-liner:**
```bash
brew install spantree/fluent-toolkit/fluent-toolkit
```

**Or tap first:**
```bash
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git
brew install fluent-toolkit
```

## Updating the Formula

When releasing a new version:

1. Run the release script to compile binaries and get checksums:
   ```bash
   ./scripts/release.sh 0.2.0
   ```

2. Update `fluent-toolkit.rb`:
   - Change `version "0.1.0"` to new version
   - Update download URLs (replace version number)
   - Update SHA256 checksums (from release script output)

3. Commit and push:
   ```bash
   git add Formula/fluent-toolkit.rb
   git commit -m "Update formula to v0.2.0"
   git push origin main
   ```

## Learn More

See [docs/homebrew-tap.md](../docs/homebrew-tap.md) for detailed information about Homebrew taps.
