# Feature #006: Pin MCP Server Versions

## Overview

Add version pinning support to ensure reproducible MCP server installations across environments.

## Implementation Plan

### Phase 1: Version Syntax

- [ ] Define version pinning syntax for registry entries
  - npm packages: `@packagename@version`
  - Python packages: `packagename==version`
- [ ] Update MCPServer interface to support version field
- [ ] Add version validation logic

### Phase 2: Registry Updates

- [ ] Add `version` field to existing server definitions
- [ ] Document recommended versions for each server
- [ ] Add version compatibility notes

### Phase 3: Install Command

- [ ] Update install logic to respect pinned versions
- [ ] Handle version conflicts and warnings
- [ ] Support version override flag for testing

### Phase 4: Documentation

- [ ] Document version pinning in CLAUDE.md
- [ ] Add version upgrade guide
- [ ] Include troubleshooting for version conflicts

## Technical Approach

```typescript
export interface MCPServer {
  name: string;
  displayName: string;
  description: string;
  version?: string; // Optional version pin
  // ... existing fields
}

// Example with pinned version
export const sequentialServer: MCPServer = {
  name: "sequentialthinking",
  displayName: "Sequential Thinking",
  description: "Structured multi-step reasoning",
  version: "0.3.0", // Pin to specific version
  // ...
};
```

### Version Resolution Logic

```typescript
function resolvePackageVersion(packageName: string, version?: string): string {
  if (!version) {
    return packageName; // Use latest
  }

  // npm packages
  if (packageName.startsWith("@")) {
    return `${packageName}@${version}`;
  }

  // Python packages
  return `${packageName}==${version}`;
}
```

## Testing Plan

- Test with pinned npm package versions
- Test with pinned Python package versions
- Test with no version specified (latest)
- Test version upgrade scenarios
- Verify reproducibility across fresh installs

## Areas for Feedback

1. Should we auto-check for newer versions and prompt upgrades?
2. How should we handle breaking changes between versions?
3. Should version pins be strict or allow compatible ranges?
4. How should we document version compatibility matrix?

## Related Issues

- Issue #6: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/6

## Impact Analysis

**Benefits:**

- Reproducible installations across environments
- Predictable behavior for users
- Easier troubleshooting with known versions

**Risks:**

- Users may miss important updates
- Version conflicts with dependencies
- Additional maintenance burden

## Migration Path

1. Add version field to interface (optional)
2. Update existing servers with current stable versions
3. Document version pinning in main README
4. Announce in release notes with upgrade guide
