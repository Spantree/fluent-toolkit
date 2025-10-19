---
title: Claude Code Installation Checking Enhancement
type: note
permalink: features/claude-code-installation-checking-enhancement
tags:
  - claude-code
  - installation
  - version-checking
  - user-experience
---

# Claude Code Installation Checking Enhancement

## Overview

Enhanced `ftk init` to comprehensively check all Claude Code installation scenarios and offer automatic installation/upgrade with command preview and user confirmation.

## Implementation

### New Features in `src/utils/claude-version.ts`

1. **Upgrade Detection** (`checkForUpgrade`)
   - Checks Homebrew/winget for newer versions
   - Returns available version if upgrade is available
   - Platform-specific implementation (macOS uses `brew info --json`)

2. **Platform Commands** (`getInstallCommand`, `getUpgradeCommand`)
   - Returns platform-specific install/upgrade commands
   - macOS: `brew install/upgrade claude-code`
   - Windows: `winget install/upgrade Claude.ClaudeCode`
   - Linux: Returns null (no standard command)

3. **Enhanced Interface** (`ClaudeVersionCheck`)
   ```typescript
   interface ClaudeVersionCheck {
     installed: boolean;
     version?: string;
     meetsRequirements: boolean;
     upgradeAvailable?: boolean;
     latestVersion?: string;
     message?: string;
   }
   ```

### Enhanced Init Command (`src/commands/init.ts`)

Handles three distinct scenarios:

#### Scenario 1: Not Installed

- Detects Claude Code is not installed
- In interactive mode: Offers automatic installation
- Shows exact command: `brew install claude-code`
- Requests user confirmation before executing
- Re-checks version after installation
- Falls back to manual instructions if installation fails

#### Scenario 2: Outdated Version

- Detects installed version doesn't meet minimum requirements
- In interactive mode: Offers automatic upgrade
- Shows exact command: `brew upgrade claude-code`
- Requests user confirmation before executing
- Re-checks version after upgrade
- Allows continuing with old version or cancelling setup

#### Scenario 3: Up to Date with Upgrade Available

- Detects newer version is available via package manager
- In interactive mode: Offers optional upgrade
- Shows exact command and new version number
- User can choose to upgrade or continue with current version
- Non-blocking - setup continues regardless of choice

### No-Prompt Mode

When `--no-prompt` flag is used:

- Skips all automatic install/upgrade prompts
- Shows manual installation instructions
- Continues with setup if version meets requirements
- Exits if Claude Code is not installed or outdated

## Testing

Created comprehensive test suite at `tests/claude-version-scenarios.test.ts`:

- ✅ Version parsing (handles `1.2.3`, `claude 1.2.3`, `1.2.3-beta.1`)
- ✅ Version comparison using semver (handles pre-releases correctly)
- ✅ Platform command generation
- ✅ Current installation detection
- ✅ Upgrade availability checking

Manual testing scenarios documented for:

- Not installed scenario
- Outdated version scenario
- Up to date scenario
- Upgrade available scenario
- No-prompt mode

## User Experience

### Before

```
❌ Claude Code is not installed

Claude Code is not installed. To install:

  brew install claude-code

Or visit: https://docs.claude.com/claude-code/install

After installing Claude Code, run 'ftk init' again.
```

### After (Interactive Mode)

```
❌ Claude Code is not installed

Would you like to install Claude Code now?
Command to run: brew install claude-code

? Install Claude Code? (y/N)
```

If user accepts:

```
⏳ Installing Claude Code...
[Shows brew output]
✅ Claude Code installed successfully
✅ Claude Code 2.0.21 is ready
```

## Benefits

1. **Reduced Friction**: Users don't need to leave ftk to install/upgrade Claude Code
2. **Transparency**: Shows exact command before execution
3. **Safety**: Requires explicit user confirmation
4. **Flexibility**: Supports both interactive and automated modes
5. **Comprehensive**: Handles all three scenarios (not installed, outdated, upgrade available)

## Related Files

- `src/utils/claude-version.ts` - Core version checking logic
- `src/commands/init.ts` - Enhanced init command with prompts
- `tests/claude-version-scenarios.test.ts` - Test suite

## Issue Reference

Related to feature request for comprehensive Claude Code installation checking across all scenarios.
