# Quick Start: Private Homebrew Distribution

**TL;DR:** The formula lives in this repo. No separate homebrew-tap needed!

## One-Time Setup (2 minutes)

### 1. Verify Formula Exists

The formula is already in this repo at `Formula/fluent-toolkit.rb`. No additional setup needed!

## Release Process (Every Release)

### 1. Run Release Script

```bash
cd /path/to/fluent-toolkit

# Create release (updates version, compiles binaries, creates tag)
./scripts/release.sh 0.1.0

# Push tag to trigger release
git push origin v0.1.0
```

### 2. Create GitHub Release

1. Go to: https://github.com/spantree/fluent-toolkit/releases/new
2. Select tag: `v0.1.0`
3. Upload binaries from `dist/` folder:
   - `ftk-darwin-arm64`
   - `ftk-darwin-x86_64`
   - `ftk-linux-x86_64`
4. Click "Publish release"

### 3. Update Homebrew Formula

The release script outputs checksums. Update the formula in this repo:

```bash
# Edit Formula/fluent-toolkit.rb
# Update:
#   - version number
#   - download URLs (v0.1.0 → v0.2.0)
#   - SHA256 checksums (from release script output)

git add Formula/fluent-toolkit.rb
git commit -m "Update formula to v0.1.0"
git push origin main
```

## Installation for Colleagues

**Requirements:**
- GitHub access to `spantree/fluent-toolkit` repository
- SSH key configured with GitHub (most developers already have this)

**Installation (SSH - Recommended):**

```bash
# One-liner install (no token needed!)
brew install spantree/fluent-toolkit/fluent-toolkit

# Or tap first, then install:
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git
brew install fluent-toolkit

# Verify
ftk --version
```

**Alternative: HTTPS with Token** (if SSH not set up)

```bash
# Set GitHub token (one-time)
export HOMEBREW_GITHUB_API_TOKEN=ghp_xxxxxxxxxxxx
echo 'export HOMEBREW_GITHUB_API_TOKEN=ghp_xxxxxxxxxxxx' >> ~/.zshrc

# Install
brew tap spantree/fluent-toolkit https://github.com/spantree/fluent-toolkit
brew install fluent-toolkit
```

**Updates:**

```bash
brew update
brew upgrade fluent-toolkit
```

## Testing Before Release

Test the compiled binary locally:

```bash
# Compile
deno task compile

# Test
./bin/ftk --version
./bin/ftk init --help

# Test in a new terminal (simulates fresh install)
export PATH="/path/to/fluent-toolkit/bin:$PATH"
ftk init
```

## FAQs

**Q: Why use SSH instead of a GitHub token?**
A: Most developers already have SSH keys set up for GitHub. SSH = zero setup, HTTPS token = extra credential to manage.

**Q: Can I keep the main repo private too?**
A: Yes! The binaries are released publicly via GitHub Releases, but the source code can remain private.

**Q: How do I revoke access?**
A: Remove the user from the `homebrew-tap` repository on GitHub.

**Q: What if someone doesn't have SSH set up?**
A: Two options:
1. Help them set up SSH (5 minutes): `ssh-keygen -t ed25519 -C "email@example.com"` then add to GitHub
2. Use the HTTPS + token method instead

**Q: What if someone doesn't have Homebrew?**
A: They can install Homebrew first: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

**Q: Can I use a different name for the tap?**
A: Yes! If you use `homebrew-fluent`, colleagues would use: `brew tap spantree/fluent`

**Q: When should I go public?**
A: When the tool is stable, documented, and you want community contributions. Just change repo visibility - no code changes needed!

## Next Steps

1. Run `./scripts/release.sh 0.1.0`
2. Create GitHub release with binaries
3. Update `Formula/fluent-toolkit.rb` with checksums
4. Share installation instructions with team

See [homebrew-tap.md](homebrew-tap.md) for detailed tap documentation.
