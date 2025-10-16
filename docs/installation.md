# Installation Guide

## Prerequisites

- macOS or Linux
- [Homebrew](https://brew.sh) installed

## Installation

### Homebrew (Recommended)

```bash
brew install spantree/fluent-toolkit/fluent-toolkit
```

Verify installation:

```bash
ftk --version
```

### Manual Installation

Download the appropriate binary for your platform from [GitHub Releases](https://github.com/spantree/fluent-toolkit/releases):

- **macOS (Apple Silicon)**: `ftk-darwin-arm64`
- **macOS (Intel)**: `ftk-darwin-x86_64`
- **Linux**: `ftk-linux-x86_64`

Make it executable and move to your PATH:

```bash
chmod +x ftk-darwin-arm64
sudo mv ftk-darwin-arm64 /usr/local/bin/ftk

# Verify
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

## Installing Development Version

To test features from a development branch before they're released:

### Prerequisites

You'll need Deno installed for building from source:

```bash
# macOS
brew install deno

# Other platforms: https://deno.land/manual/getting_started/installation
```

### Install from Branch

```bash
# Install HEAD version (compiles from source)
brew install --HEAD spantree/fluent-toolkit/fluent-toolkit

# Or reinstall if already installed
brew reinstall --HEAD spantree/fluent-toolkit/fluent-toolkit
```

This will:
- Clone the repository at the development branch
- Compile the binary locally using Deno
- Install the compiled binary

**Note**: HEAD installations are slower than stable releases since they compile from source.

### Switch Back to Stable

```bash
brew uninstall fluent-toolkit
brew install spantree/fluent-toolkit/fluent-toolkit
```

## Updating

### Homebrew

```bash
brew update
brew upgrade fluent-toolkit
```

For HEAD installations:

```bash
brew upgrade --fetch-HEAD fluent-toolkit
```

### Manual

Download the latest release and replace the binary in your PATH.

## Uninstalling

### Homebrew

```bash
brew uninstall fluent-toolkit
brew untap spantree/fluent-toolkit
```

### Manual

```bash
sudo rm /usr/local/bin/ftk
```

## Troubleshooting

### Command not found

Make sure `/usr/local/bin` is in your PATH:

```bash
echo $PATH
```

If not, add to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
export PATH="/usr/local/bin:$PATH"
```

### Homebrew formula not found

Update Homebrew and retry:

```bash
brew update
brew install spantree/fluent-toolkit/fluent-toolkit
```

### Need help?

- Check [GitHub Issues](https://github.com/spantree/fluent-toolkit/issues)
- Read the [documentation](README.md)
