# Feature #001: Claude Code Installation and Version Checks

## Overview

Add pre-flight checks to `ftk init` command to verify Claude Code is installed and meets minimum version requirements.

## Implementation Plan

### Phase 1: Version Detection
- [ ] Add `checkClaudeCodeInstallation()` function to detect `claude` CLI
- [ ] Parse version output from `claude --version`
- [ ] Compare against minimum version requirement

### Phase 2: User Experience
- [ ] Display friendly error message if Claude Code not found
- [ ] Provide installation instructions with links
- [ ] Show version compatibility warnings if outdated

### Phase 3: Configuration
- [ ] Add `MIN_CLAUDE_VERSION` constant
- [ ] Support version override flag for testing
- [ ] Document version requirements in main README

## Technical Approach

```typescript
async function checkClaudeCodeInstallation(): Promise<{
  installed: boolean;
  version?: string;
  meetsRequirements: boolean;
}> {
  // Implementation
}
```

## Testing Plan

- Test with Claude Code installed (various versions)
- Test without Claude Code installed
- Test with outdated version
- Test version parsing edge cases

## Areas for Feedback

1. Should we make this check optional with a `--skip-checks` flag?
2. What should be the minimum Claude Code version requirement?
3. Should we auto-install Claude Code if missing (via Homebrew)?
4. How should we handle pre-release versions?

## Related Issues

- Issue #1: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/1
