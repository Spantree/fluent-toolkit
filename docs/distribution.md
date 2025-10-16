# Distribution Guide

Guide for distributing fluent-toolkit to colleagues via Homebrew.

## Option 1: Private Homebrew Tap (Recommended)

**Advantages:**

- Professional distribution method
- Easy for colleagues to install and update
- Repo can remain private on GitHub
- Can go public later by just changing repo visibility
- Colleagues with repo access can install easily

### Step 1: Compile Binaries

Compile for all macOS architectures:

```bash
deno task compile:all
```

This creates binaries in `dist/`:

- `ftk-darwin-x86_64` - Intel Macs
- `ftk-darwin-arm64` - Apple Silicon Macs
- `ftk-linux-x86_64` - Linux (optional)

### Step 2: Create GitHub Release

1. **Tag a version:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Create release on GitHub:**
   - Go to: https://github.com/spantree/fluent-toolkit/releases/new
   - Tag: `v0.1.0`
   - Title: `v0.1.0`
   - Upload binaries:
     - `dist/ftk-darwin-x86_64`
     - `dist/ftk-darwin-arm64`
     - `dist/ftk-linux-x86_64`
   - Mark as "Pre-release" if not ready for production
   - Publish release

3. **Get download URLs:**
   - After publishing, right-click each binary and copy download URL
   - URLs will look like:
     ```
     https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-arm64
     https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-x86_64
     ```

### Step 3: Create Private Homebrew Tap Repository

1. **Create new private repo on GitHub:**
   - Name: `homebrew-tap` (or `homebrew-fluent`)
   - Organization: `spantree`
   - Visibility: **Private**
   - Full URL: `https://github.com/spantree/homebrew-tap`

2. **Create formula file in repo:**

   Create file: `Formula/fluent-toolkit.rb` (or `ftk.rb` for shorter name)

   ```ruby
   class FluentToolkit < Formula
     desc "MCP server setup toolkit for Claude Code"
     homepage "https://github.com/spantree/fluent-toolkit"
     version "0.1.0"

     on_macos do
       if Hardware::CPU.arm?
         url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-arm64"
         sha256 "REPLACE_WITH_ACTUAL_SHA256_ARM64"
       else
         url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-darwin-x86_64"
         sha256 "REPLACE_WITH_ACTUAL_SHA256_X86_64"
       end
     end

     on_linux do
       url "https://github.com/spantree/fluent-toolkit/releases/download/v0.1.0/ftk-linux-x86_64"
       sha256 "REPLACE_WITH_ACTUAL_SHA256_LINUX"
     end

     def install
       if OS.mac?
         if Hardware::CPU.arm?
           bin.install "ftk-darwin-arm64" => "ftk"
         else
           bin.install "ftk-darwin-x86_64" => "ftk"
         end
       else
         bin.install "ftk-linux-x86_64" => "ftk"
       end
     end

     test do
       system "#{bin}/ftk", "--version"
     end
   end
   ```

3. **Calculate SHA256 checksums:**
   ```bash
   shasum -a 256 dist/ftk-darwin-arm64
   shasum -a 256 dist/ftk-darwin-x86_64
   shasum -a 256 dist/ftk-linux-x86_64
   ```

   Replace the `REPLACE_WITH_ACTUAL_SHA256_*` values in the formula.

4. **Commit and push:**
   ```bash
   git add Formula/fluent-toolkit.rb
   git commit -m "Add fluent-toolkit formula v0.1.0"
   git push origin main
   ```

### Step 4: Share with Colleagues

**Installation instructions for colleagues:**

1. **Grant GitHub access:**
   - Add colleagues to the private `homebrew-tap` repository
   - They need at least "Read" access

2. **Install via Homebrew (SSH - Recommended):**
   ```bash
   # Tap the private repository using SSH
   # Uses their existing GitHub SSH key - no token needed!
   brew tap spantree/tap git@github.com:spantree/homebrew-tap.git

   # Install fluent-toolkit
   brew install fluent-toolkit

   # Verify installation
   ftk --version
   ```

   **Alternative: HTTPS with Token** (if SSH not configured)
   ```bash
   # Create GitHub Personal Access Token with 'repo' scope
   # https://github.com/settings/tokens

   # Set token
   export HOMEBREW_GITHUB_API_TOKEN=<personal_access_token>

   # Tap the private repository
   brew tap spantree/tap https://github.com/spantree/homebrew-tap

   # Install fluent-toolkit
   brew install fluent-toolkit
   ```

3. **Update to newer versions:**
   ```bash
   brew update
   brew upgrade fluent-toolkit
   ```

### Step 5: Publishing Updates

When you release a new version:

1. **Compile new binaries:**
   ```bash
   deno task compile:all
   ```

2. **Create new GitHub release** (e.g., `v0.2.0`)

3. **Update formula in `homebrew-tap`:**
   - Update `version` field
   - Update download URLs (change version number)
   - Update SHA256 checksums
   - Commit and push

4. **Colleagues update:**
   ```bash
   brew update
   brew upgrade fluent-toolkit
   ```

---

## Option 2: Direct Formula Installation

If you don't want to create a tap repository, colleagues can install directly from a formula URL.

1. **Create formula file** (same as above)

2. **Host formula somewhere accessible:**
   - GitHub Gist (can be private)
   - Or in the main repo: `homebrew/fluent-toolkit.rb`

3. **Share installation command:**
   ```bash
   brew install https://raw.githubusercontent.com/spantree/fluent-toolkit/main/homebrew/fluent-toolkit.rb
   ```

**Downsides:**

- No `brew upgrade` support
- Less discoverable
- No tap namespace

---

## Option 3: Manual Binary Distribution

Simplest approach for quick testing:

1. **Compile binary:**
   ```bash
   deno task compile
   ```

2. **Share binary directly:**
   - Upload to GitHub release
   - Share download link
   - Colleagues download and move to `/usr/local/bin/`:
     ```bash
     chmod +x ftk-darwin-arm64
     sudo mv ftk-darwin-arm64 /usr/local/bin/ftk
     ```

**Downsides:**

- No automatic updates
- Manual installation for each colleague
- No dependency management

---

## Recommendation

**Start with Option 1 (Private Homebrew Tap)**

Why?

- Professional and scalable
- Easy to update and maintain
- Colleagues get familiar with the standard installation method
- When you're ready to go public, just change repo visibility
- Best practice for team distribution

---

## Going Public Later

When ready to publish publicly:

1. **Make repositories public:**
   - `fluent-toolkit` repository
   - `homebrew-tap` repository

2. **No code changes needed!**
   - The formula already points to public GitHub releases
   - Colleagues can continue using the same tap

3. **Optional: Submit to official Homebrew:**
   - Create PR to [homebrew/homebrew-core](https://github.com/Homebrew/homebrew-core)
   - Requires formula adjustments and review
   - Only do this when the tool is stable and publicly documented

---

## Troubleshooting

### Authentication Issues

**SSH Authentication (Recommended)**

If colleagues get "Permission denied" when tapping:

```bash
# Check if SSH key is set up with GitHub
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."

# If not set up, add SSH key to GitHub:
# 1. Generate key (if needed): ssh-keygen -t ed25519 -C "email@example.com"
# 2. Add to GitHub: https://github.com/settings/keys
# 3. Test: ssh -T git@github.com
```

**HTTPS Authentication (Fallback)**

If SSH is not available, use token authentication:

```bash
# Create a GitHub Personal Access Token with 'repo' scope
# https://github.com/settings/tokens

# Set token as environment variable
export HOMEBREW_GITHUB_API_TOKEN=ghp_xxxxxxxxxxxx

# Add to ~/.zshrc or ~/.bash_profile for persistence
echo 'export HOMEBREW_GITHUB_API_TOKEN=ghp_xxxxxxxxxxxx' >> ~/.zshrc

# Use HTTPS URL when tapping
brew tap spantree/tap https://github.com/spantree/homebrew-tap
```

### Formula Not Found

```bash
# Untap and re-tap (use SSH)
brew untap spantree/tap
brew tap spantree/tap git@github.com:spantree/homebrew-tap.git

# Update Homebrew
brew update

# Or with HTTPS if using token
brew tap spantree/tap https://github.com/spantree/homebrew-tap
```

### Binary Permissions

If binary doesn't execute:

```bash
# Check permissions
ls -la /usr/local/bin/ftk

# Fix if needed
chmod +x /usr/local/bin/ftk
```
