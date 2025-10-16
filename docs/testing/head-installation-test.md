# HEAD Installation Testing Guide

## Overview

This guide provides step-by-step instructions for testing the HEAD installation method of fluent-toolkit, which allows users to install and test the latest development version directly from the main branch.

## Prerequisites

- Git installed
- Deno installed (required for HEAD builds)
- Homebrew installed (macOS)
- Clean test directory

## Installation Methods

There are two ways to install ftk from HEAD:

### Method 1: From Tap (Recommended)

If you have the `spantree/fluent-toolkit` tap installed:

```bash
# Check if tap is installed
brew tap

# If spantree/fluent-toolkit is listed, uninstall current version
brew uninstall fluent-toolkit

# Update tap to get latest formula
brew update

# Install HEAD from tap
brew install --HEAD spantree/fluent-toolkit/fluent-toolkit
```

### Method 2: From Local Formula

If you're testing local changes without a tap:

```bash
# First, remove tap if installed (prevents conflicts)
brew untap spantree/fluent-toolkit

# Install from local formula
cd ~/src/spantree-fluent/fluent-toolkit
brew install --HEAD ./Formula/fluent-toolkit.rb

# Re-add tap when done testing
brew tap spantree/fluent-toolkit https://github.com/spantree/homebrew-fluent-toolkit.git
```

## Test Scenario: Clean Project Installation

### Step 1: Prepare Test Environment

```bash
# Create a clean test directory
mkdir -p ~/test-ftk-head
cd ~/test-ftk-head

# Initialize as a git repository (required for ftk)
git init

# Create a simple project structure
touch README.md
git add README.md
git commit -m "Initial commit"
```

### Step 2: Install fluent-toolkit from HEAD

Choose one of the installation methods above based on your setup.

**Expected Result**: Installation completes successfully with Deno compiling the binary from source

**Build Output Example**:

```
==> Cloning https://github.com/spantree/fluent-toolkit.git
==> Checking out branch main
==> deno task compile
Check file:///path/to/fluent-toolkit/src/main.ts
Compile file:///path/to/fluent-toolkit/src/main.ts to bin/ftk
```

**Verification**:

```bash
# Check installation
ftk --version

# Should output:
# ftk 0.1.0
```

**Note**: The version won't show "HEAD" suffix - Deno compilation doesn't include git metadata. To verify HEAD installation, check the build output above shows "Cloning" and "Checking out branch main".

### Step 3: Run ftk init

```bash
# Run the interactive initialization
ftk init
```

**Interactive Steps**:

1. When prompted "Select MCP servers to install", use arrow keys to select:
   - basic-memory (core)
   - context7 (optional) - if you have API key

2. When prompted for context directory name, accept default "context"

3. For context7 (if selected), enter your API key when prompted

**Expected Results**:

- ✅ Dependency checks pass
- ✅ Secrets saved to `.env.mcp.secrets`
- ✅ Configuration written to `.mcp.json`
- ✅ Project config created at `.ftk/config.json`
- ✅ Context directory created
- ✅ `CLAUDE.md` updated with server instructions
- ✅ `.gitignore` updated

### Step 4: Verify Generated Files

```bash
# Check .mcp.json
cat .mcp.json

# Expected: Valid JSON with mcpServers configuration
# Should include version pinning in comments or args

# Check lock file
cat .ftk-lock.yaml

# Expected: YAML file with:
# - version: "1"
# - updated: timestamp
# - servers: with package resolution info

# Check Basic Memory was configured
ls context/basic-memory/

# Expected: project configuration directory exists

# Check CLAUDE.md
cat CLAUDE.md

# Expected: Contains MCP server sections with usage instructions
```

### Step 5: Test Version Pinning

Check that the lock file contains version information:

```bash
# View lock file
cat .ftk-lock.yaml

# Expected structure:
# version: "1"
# updated: "2025-01-16T..."
# servers:
#   basic-memory:
#     packageName: "basic-memory"
#     registry: "pypi"
#     packageConstraint: "latest"
#     packageResolution: "0.x.x"  # Actual resolved version
```

### Step 6: Test Claude Code Integration

```bash
# Start Claude Code (if installed)
claude

# In Claude Code, verify MCP servers are loaded:
# - Check status bar for MCP indicators
# - Try using Basic Memory commands (if available)
```

### Step 7: Test Reproducible Installation

```bash
# Delete .mcp.json but keep lock file
rm .mcp.json

# Re-run init
ftk init --no-prompt

# Expected: Uses versions from lock file
# Verify by comparing .ftk-lock.yaml timestamps
```

## Test Checklist

Use this checklist to verify all functionality:

- [ ] Installation from HEAD completes successfully
- [ ] `ftk --version` shows correct version
- [ ] `ftk init` interactive wizard works
- [ ] Dependency checking works (precheck)
- [ ] Secret collection and storage works
- [ ] `.mcp.json` generated correctly
- [ ] `.ftk-lock.yaml` created with version info
- [ ] `.ftk/config.json` created
- [ ] Context directory created
- [ ] `CLAUDE.md` updated with server sections
- [ ] `.gitignore` updated correctly
- [ ] Lock file contains resolved versions
- [ ] Reinstallation respects lock file versions
- [ ] All generated files are valid (JSON/YAML)

## Troubleshooting

### "No available formula" Warning

If you see:

```
Warning: No available formula with the name "fluent-toolkit"
```

**Cause**: Trying to install from local file when tap is already installed

**Solution**: Use tap-based installation instead:

```bash
brew install --HEAD spantree/fluent-toolkit/fluent-toolkit
```

Or remove tap first if testing local changes:

```bash
brew untap spantree/fluent-toolkit
brew install --HEAD ./Formula/fluent-toolkit.rb
```

### Installation Fails

```bash
# Check Homebrew logs with verbose output
brew install --HEAD --verbose spantree/fluent-toolkit/fluent-toolkit

# Common issues:
# - Deno not found: Install Deno first (brew install deno)
# - Git not found: Install Git first
# - Network issues: Check internet connection
# - Permission issues: Check Homebrew permissions
```

### Build Compilation Errors

If Deno compilation fails:

```bash
# Check Deno version
deno --version

# Should be 1.40.0 or higher

# Update Deno if needed
brew upgrade deno
```

### ftk init Fails

```bash
# Run with verbose output
ftk init --verbose

# Check dependency issues
# - For basic-memory: Requires uvx (install uv)
# - For context7: Requires npx (install Node.js)
```

### Lock File Not Created

```bash
# Verify project has package registry info
# Check server metadata in registry/mcp-servers/*/index.ts

# Lock file only created for servers with:
# - packageName
# - packageRegistry (npm or pypi)
```

## Version Pinning Verification

### Test Scenario 1: Fresh Install

1. Run `ftk init` in clean directory
2. Check `.ftk-lock.yaml` created
3. Verify versions resolved from registries
4. Check `.mcp.json` uses resolved versions

### Test Scenario 2: Lock File Reuse

1. Copy `.ftk-lock.yaml` to new project
2. Run `ftk init`
3. Verify uses locked versions (not latest)
4. Check console output mentions "Using locked version"

### Test Scenario 3: Constraint Update

1. Edit server metadata to change version constraint
2. Run `ftk init`
3. Verify lock file updated with new resolution
4. Check console warns about constraint change

## Expected Behavior

### With Lock File

- Uses exact versions from lock file
- Validates against constraints
- Updates only if constraint no longer satisfied
- Console shows "Using locked version: X.Y.Z"

### Without Lock File

- Queries npm/PyPI for latest versions
- Resolves based on constraints
- Creates lock file with resolutions
- Console shows "Using version: X.Y.Z"

## Cleanup

```bash
# Remove test directory
cd ~
rm -rf ~/test-ftk-head

# Uninstall HEAD version
brew uninstall fluent-toolkit
```

## Success Criteria

All tests pass when:

1. Installation completes without errors
2. All expected files are created
3. Files contain valid content
4. Lock file contains version resolutions
5. Reinstallation is reproducible
6. Claude Code recognizes MCP servers

## Notes

- HEAD installation compiles from source, may take longer than binary install
- Lock file format is YAML for human readability
- Version resolution happens during `install()` lifecycle method
- Servers without package info don't get lock entries
