# Claude Code Installation Check Tests

**Unit tests** for Claude Code installation detection, version checking, and upgrade functionality.

These are **unit tests** - they test individual utility functions in isolation without requiring external environments or VMs. For **integration tests** that test the full `ftk init` workflow in Tart VMs, see `tests/integration/`.

## Test Files

### `claude-version-scenarios.test.ts`

Tests core version checking utilities:

- ✅ Version string parsing (handles various formats)
- ✅ Semver comparison (including pre-release versions)
- ✅ Platform command generation
- ✅ Current installation detection
- ✅ Upgrade availability checking

**Run:** `deno run --allow-all tests/unit/claude-code-checks/claude-version-scenarios.test.ts`

### `changelog.test.ts`

Tests changelog fetching and parsing from GitHub:

- ✅ Fetch CHANGELOG.md from anthropics/claude-code
- ✅ Parse markdown into structured version entries
- ✅ Extract changes between version ranges
- ✅ Format changelog for display
- ✅ End-to-end version change retrieval

**Run:** `deno run --allow-net tests/unit/claude-code-checks/changelog.test.ts`

**Sample Output:**

```
📦 Version 2.0.20:
   • Added support for Claude Skills

📦 Version 2.0.19:
   • Auto-background long-running bash commands
   • Fixed a bug where Haiku was unnecessarily called
```

### `install-method-detection.test.ts`

Tests installation method detection and command generation:

- ✅ Detect if Claude Code installed via npm or brew
- ✅ Generate appropriate install commands
- ✅ Generate appropriate upgrade commands (auto-detects method)
- ✅ Handle user preferences for installation method

**Run:** `deno run --allow-all tests/unit/claude-code-checks/install-method-detection.test.ts`

## Running All Tests

```bash
# Run all Claude Code check tests
deno run --allow-all tests/unit/claude-code-checks/*.test.ts

# Or individually
deno run --allow-all tests/unit/claude-code-checks/claude-version-scenarios.test.ts
deno run --allow-net tests/unit/claude-code-checks/changelog.test.ts
deno run --allow-all tests/unit/claude-code-checks/install-method-detection.test.ts
```

## What These Tests Cover

### Installation Scenarios

1. **Not Installed**
   - Detection works correctly
   - Shows npm install command (official method)
   - Offers automatic installation

2. **Outdated Version**
   - Version comparison detects outdated installations
   - Auto-detects installation method (npm/brew)
   - Shows appropriate upgrade command
   - Fetches and displays changelog

3. **Upgrade Available**
   - Checks package registry for newer versions
   - Shows what's new in changelog
   - Offers optional upgrade

### Installation Method Detection

- **npm**: Detected via path containing `node`, `npm`, or `nvm`
- **brew**: Detected via path containing `homebrew` or `Homebrew`
- **unknown**: Defaults to npm (official method)

### Changelog Parsing

- Handles markdown format: `## [2.0.20]` or `## 2.0.20`
- Extracts bullet points as individual changes
- Groups changes by version
- Formats with emojis for better readability

## Implementation Files

These tests validate functionality in:

- `src/utils/claude-version.ts` - Version checking and installation detection
- `src/utils/changelog.ts` - Changelog fetching and parsing
- `src/commands/init.ts` - Integration in init command

## Manual Testing Scenarios

For comprehensive testing, manually test these scenarios:

1. **Uninstall Claude Code** → Run `ftk init` → Should offer npm installation
2. **Install older version** → Run `ftk init` → Should offer upgrade with changelog
3. **Install via brew** → Run `ftk init` → Should detect brew and use brew commands
4. **Install via npm** → Run `ftk init` → Should detect npm and use npm commands
5. **Use --no-prompt** → Should show instructions without automatic prompts

## Coverage

- ✅ Version parsing (various formats)
- ✅ Semver comparison (including pre-releases)
- ✅ Installation detection (npm, brew, unknown)
- ✅ Command generation (install, upgrade)
- ✅ Changelog fetching (GitHub API)
- ✅ Changelog parsing (markdown format)
- ✅ Version filtering (semver ranges)
- ✅ Display formatting (emojis, structure)
