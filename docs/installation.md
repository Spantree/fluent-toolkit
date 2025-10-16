# Installing fluent-toolkit (Internal)

Quick installation guide for Spantree team members.

## Prerequisites

- macOS or Linux
- GitHub account with access to `spantree/fluent-toolkit` repository
- SSH key configured with GitHub (check with `ssh -T git@github.com`)

## Installation

**One-liner (recommended):**
```bash
brew install spantree/fluent-toolkit/fluent-toolkit
```

**Or tap first, then install:**
```bash
# Tap the repository (using SSH - no token needed!)
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git

# Install fluent-toolkit
brew install fluent-toolkit

# Verify installation
ftk --version
```

## First Time Usage

Initialize MCP servers in your project:

```bash
cd /path/to/your/project
ftk init
```

This will:
- Let you select which MCP servers to install
- Configure secrets (API keys, etc.)
- Generate `.mcp.json` for Claude Code
- Update your `CLAUDE.md` with usage instructions

## Updating

When a new version is released:

```bash
brew update
brew upgrade fluent-toolkit
```

## Troubleshooting

### "Permission denied" when tapping

Your SSH key might not be configured with GitHub:

```bash
# Test SSH connection
ssh -T git@github.com

# Should see: "Hi username! You've successfully authenticated..."
```

If not working, add your SSH key to GitHub:
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your public key (usually in `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`)

Or generate a new key:
```bash
ssh-keygen -t ed25519 -C "your.email@spantree.net"
cat ~/.ssh/id_ed25519.pub  # Copy this to GitHub
```

### Formula not found

```bash
# Refresh the tap
brew update
brew upgrade fluent-toolkit

# If still not working, untap and re-tap
brew untap spantree/fluent-toolkit
brew tap spantree/fluent-toolkit git@github.com:spantree/fluent-toolkit.git
```

### Need help?

Ask in #engineering or reach out to the maintainer.
