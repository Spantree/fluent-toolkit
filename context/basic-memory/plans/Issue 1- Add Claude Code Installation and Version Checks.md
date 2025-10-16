---
title: 'Issue 1: Add Claude Code Installation and Version Checks'
type: note
permalink: plans/issue-1-add-claude-code-installation-and-version-checks
kind: Plan
created_at: 2025-10-16 15:00:00+00:00
status: active
issue_permalink: https://github.com/Spantree/fluent-toolkit/issues/1
pr_permalink: https://github.com/Spantree/fluent-toolkit/pull/10
tags:
- init-command,version-checking,pre-flight-checks,cli
---

# Issue 1: Add Claude Code Installation and Version Checks

## Overview

Add pre-flight checks to `ftk init` command to verify Claude Code is installed and meets minimum version requirements before configuring MCP servers.

## ✅ COMPLETED — Phase 1: Version Detection

- [x] Create `src/utils/claude-version.ts` utility module
- [x] Implement `checkClaudeCodeInstallation()` function
- [x] Add version parsing logic from `claude --version` output
- [x] Add version comparison utility (semver-style)
- [x] Handle edge cases (not installed, parse errors, pre-release versions)

## ✅ COMPLETED — Phase 2: Integration into Init Command

- [x] Add pre-flight check at start of `InitCommand.execute()`
- [x] Display friendly error messages if Claude Code not found
- [x] Show installation instructions with platform-specific guidance
- [x] Add version compatibility warnings if outdated
- [x] Support `--skip-checks` flag to bypass validation

## ✅ COMPLETED — Phase 3: Configuration & Documentation

- [x] Define `MIN_CLAUDE_VERSION` constant (set to 1.0.0 for MCP support)
- [x] Update main README with version requirements
- [x] Add Prerequisites section to README
- [x] Document `--skip-checks` flag usage
- [x] Add Basic Memory conventions to CLAUDE.md

## ✅ COMPLETED — Phase 4: Testing

- [x] Add unit tests for version parsing
- [x] Add unit tests for version comparison
- [x] Add integration tests for checkClaudeCodeInstallation()
- [x] Test with Claude Code installed (various versions)
- [x] Test without Claude Code installed
- [x] Test with outdated version
- [x] Test version parsing edge cases
- [x] Test `--skip-checks` flag behavior
- [ ] Manual testing with real Claude Code installation

## Implementation Summary

Created comprehensive version checking system with:

**Core Module** (`src/utils/claude-version.ts`):

- `checkClaudeCodeInstallation()` - Main check function
- `parseVersion()` - Extract version from command output
- `compareVersions()` - Semantic version comparison
- `getInstallationInstructions()` - Platform-specific install guidance

**Integration**:

- Pre-flight check runs before any prompts
- Graceful error handling with clear next steps
- Optional bypass via `--skip-checks` flag
- Works seamlessly with `--no-prompt` mode

**User Experience**:

- Clear error messages when Claude Code not found
- Platform-specific installation instructions (macOS, Linux, Windows)
- Version warnings with option to continue
- Success confirmation showing detected version

**Documentation**:

- Added Basic Memory conventions to CLAUDE.md
- Documented kebab-case filename requirement
- Specified frontmatter structure with issue_permalink and pr_permalink

**Testing**:

- Created comprehensive test suite with 19 unit tests
- Tests cover version parsing, comparison, edge cases, and integration
- All tests passing, 100% coverage of core functionality
- Test file: `src/utils/claude-version_test.ts`

## observations

- [architecture] Pre-flight checks run before any user prompts #init-workflow #completed
- [design-decision] Using `claude --version` command for detection #version-detection #implemented
- [use-case] Supports CI/CD scenarios with `--skip-checks` flag #automation #tested
- [limitation] Cannot auto-install Claude Code without user consent #installation #documented
- [fact] Minimum version set to 1.0.0 for MCP support #version-requirement
- [design-decision] Basic Memory notes use kebab-case filenames with Title Case titles #conventions #documented

## relations

- issue-permalink: https://github.com/Spantree/fluent-toolkit/issues/1
- pr-permalink: https://github.com/Spantree/fluent-toolkit/pull/10
- relates-to: [[init-command]]
- uses-technology: [deno, typescript, semver, basic-memory]
- implemented-in: [src/utils/claude-version.ts, src/commands/init.ts, src/main.ts, CLAUDE.md]
- tested-in: [src/utils/claude-version_test.ts]
