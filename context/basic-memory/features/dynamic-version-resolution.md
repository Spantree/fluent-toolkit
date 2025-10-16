---
title: dynamic-version-resolution
type: note
permalink: features/dynamic-version-resolution
tags:
  - mcp-registry,version-management,package-managers
---

# Dynamic Version Resolution

Automatic MCP server version fetching from npm and PyPI registries during installation.

## Problem Solved

Previously, all MCP servers had hardcoded `version: "1.0.0"` in metadata, requiring manual updates and preventing users from automatically getting latest versions.

## Solution Architecture

### Version Resolution Workflow

```
ftk init → install() → resolveVersion() → Query Registry
                                              ↓
                                    ┌─────────┴─────────┐
                                    │ Registry Response  │
                                    └─────────┬─────────┘
                                              ↓
                                    generateMcpConfig(version)
                                              ↓
                                    .mcp.json with version pin
```

### Resolution Priority

1. **Explicit Pin**: If `metadata.version` set and not "latest", use it
2. **Registry Query**: If `packageName` and `packageRegistry` present, fetch latest
3. **Fallback**: Return undefined, let package manager use latest

## Implementation Components

### Package Version Utility (`src/utils/package-version.ts`)

```typescript
// npm registry query
fetchNpmLatestVersion(packageName: string): Promise<string | null>
// Endpoint: https://registry.npmjs.org/${packageName}/latest
// Returns: version string from JSON response

// PyPI registry query
fetchPypiLatestVersion(packageName: string): Promise<string | null>
// Endpoint: https://pypi.org/pypi/${packageName}/json
// Returns: info.version from JSON response

// Unified interface
fetchLatestVersion(packageName: string, registry: "npm" | "pypi"): Promise<PackageVersionInfo>
```

### Base Server Enhancement (`src/lib/base-server.ts`)

```typescript
async resolveVersion(): Promise<string | undefined> {
  // Priority 1: Explicit version in metadata
  if (this.metadata.version && this.metadata.version !== "latest") {
    return this.metadata.version;
  }

  // Priority 2: Query package registry
  if (this.metadata.packageName && this.metadata.packageRegistry) {
    const versionInfo = await fetchLatestVersion(
      this.metadata.packageName,
      this.metadata.packageRegistry
    );
    if (versionInfo.latestVersion) {
      return versionInfo.latestVersion;
    }
  }

  // Priority 3: Fallback to undefined (latest)
  return undefined;
}

async install(ctx: LifecycleContext): Promise<InstallResult> {
  const resolvedVersion = await this.resolveVersion();
  if (resolvedVersion && resolvedVersion !== this.metadata.version) {
    ctx.info(\`Using latest version: \${resolvedVersion}\`);
  }
  const mcpConfig = this.generateMcpConfig(secrets, resolvedVersion);
  // ...
}
```

### Type System Extension (`src/types/lifecycle.ts`)

```typescript
export interface ServerMetadata {
  // Existing fields...

  // New fields for dynamic resolution
  packageName?: string; // npm: "@upstash/context7-mcp", PyPI: "mcp-server-exa"
  packageRegistry?: "npm" | "pypi"; // Which registry to query
  packageVersion?: string; // Version or constraint (1.0.0, ^1.0.0, ~2.1.0, etc.)
}
```

**Note**: The `packageVersion` field in metadata is optional and typically not set initially. When absent, the system fetches the latest version from the registry and pins it exactly in the lock file.

## Server Configuration Examples

### npm Package (Sequential Thinking)

```typescript
override metadata: ServerMetadata = {
  id: "sequentialthinking",
  name: "Sequential Thinking",
  packageName: "@modelcontextprotocol/server-sequential-thinking",
  packageRegistry: "npm",
  repository: "https://github.com/modelcontextprotocol/servers",
};

protected override generateMcpConfig(_secrets: Record<string, string>, version?: string) {
  return createNpxConfig(
    "@modelcontextprotocol/server-sequential-thinking",
    true,
    version  // Passes resolved version from registry
  );
}
```

### PyPI Package (Exa)

```typescript
override metadata: ServerMetadata = {
  id: "exa",
  name: "Exa Research",
  packageName: "mcp-server-exa",
  packageRegistry: "pypi",
  homepage: "https://exa.ai",
};

protected override generateMcpConfig(_secrets: Record<string, string>, version?: string) {
  return createUvxConfigWithSecrets(
    "mcp-server-exa",
    ".env.mcp.secrets",
    version  // Passes resolved version from registry
  );
}
```

### Custom Command (Basic Memory)

```typescript
// No packageName/packageRegistry - uses custom command
override metadata: ServerMetadata = {
  id: "basic-memory",
  name: "Basic Memory",
  // No packageName or packageRegistry
};

protected override generateMcpConfig(_secrets: Record<string, string>, _version?: string) {
  // Version ignored - custom command structure
  return {
    command: "uvx",
    args: ["basic-memory", "mcp", \`--project=\${projectName}\`],
  };
}
```

## Error Handling

### Network Failures

```typescript
try {
  const versionInfo = await fetchLatestVersion(packageName, registry);
  if (versionInfo.latestVersion) {
    return versionInfo.latestVersion;
  }
  console.warn(\`Failed to fetch: \${versionInfo.error}\`);
} catch (error) {
  console.warn(\`Error resolving version:\`, error);
}
return undefined;  // Graceful fallback
```

### Resource Leak Prevention

When fetch returns 404 or other error status, must consume response body:

```typescript
if (!response.ok) {
  await response.text();  // CRITICAL: Prevents resource leak
  console.error(\`Failed to fetch: \${response.status}\`);
  return null;
}
```

Without consuming the body, Deno reports resource leaks in tests.

## Testing Strategy

Comprehensive test suite (`src/utils/package-version_test.ts`):

```typescript
// Valid package tests
fetchNpmLatestVersion("express"); // → "4.18.2"
fetchNpmLatestVersion("@upstash/context7-mcp"); // → "0.2.1"
fetchPypiLatestVersion("requests"); // → "2.31.0"

// Error handling tests
fetchNpmLatestVersion("nonexistent-pkg"); // → null (404)
fetchPypiLatestVersion("nonexistent-pkg"); // → null (404)

// Unified interface tests
fetchLatestVersion("express", "npm"); // → PackageVersionInfo
fetchLatestVersion("requests", "pypi"); // → PackageVersionInfo
```

**All 8 tests passing** ✓

## Performance Characteristics

- **Query Time**: 200-400ms per registry lookup
- **When Executed**: Only during \`ftk init\` installation
- **Runtime Impact**: Zero (versions resolved at install time, not startup)
- **Caching**: Not implemented yet (future enhancement)

## Registry APIs

### npm Registry

- **Endpoint**: \`https://registry.npmjs.org/\${packageName}/latest\`
- **Authentication**: None required for public packages
- **Response Format**: JSON with \`version\` field
- **Rate Limits**: No explicit limits for public API

### PyPI

- **Endpoint**: \`https://pypi.org/pypi/\${packageName}/json\`
- **Authentication**: None required
- **Response Format**: JSON with \`info.version\` field
- **Rate Limits**: No explicit limits

## User Experience

Before (hardcoded):
\`\`\`
✓ Sequential Thinking configured successfully
\`\`\`

After (dynamic):
\`\`\`
ℹ Using latest version: 0.3.2
✓ Sequential Thinking configured successfully
\`\`\`

Generated .mcp.json:
\`\`\`json
{
"mcpServers": {
"sequentialthinking": {
"command": "npx",
"args": ["-y", "@modelcontextprotocol/server-sequential-thinking@0.3.2"]
}
}
}
\`\`\`

## Benefits

1. **Always Current**: Users automatically get latest stable versions
2. **Zero Maintenance**: No manual version updates in codebase
3. **Transparent**: Clear messaging about which version installed
4. **Flexible**: Can still pin specific versions via metadata
5. **Resilient**: Graceful fallback when registry unavailable

## Trade-offs

**Advantages**:

- Latest features and bug fixes automatically
- Reduced developer maintenance burden
- More transparency for users

**Disadvantages**:

- Requires network access during installation
- Adds ~200-400ms per server for registry queries
- Risk of breaking changes if semver not respected upstream

## Version Lock File (`.ftk-lock.yaml`)

Ensures reproducible installations across teams with semver constraint support.

### Lock File Structure

YAML format uses `snake_case` (YAML convention), automatically converted to `camelCase` in TypeScript:

```yaml
version: "1.0.0"
updated: "2025-01-16T12:00:00.000Z"
mcpServers:
  sequentialthinking:
    package_name: "@modelcontextprotocol/server-sequential-thinking"
    registry: npm
    package_constraint: "0.3.2" # Exact version initially
    package_resolution: "0.3.2"
    resolved_at: "2025-01-16T12:00:00.000Z"
  context7:
    package_name: "@upstash/context7-mcp"
    registry: npm
    package_constraint: "^0.2.0" # User can manually edit to add ^ or ~
    package_resolution: "0.2.1"
    resolved_at: "2025-01-16T12:00:00.000Z"
```

**Initial Behavior**: Servers are pinned to exact versions (e.g., `0.3.2`). Users can manually edit the YAML file to add `^` or `~` for flexible constraints.

### Resolution with Lock File

Updated priority system:

1. **Explicit Pin**: If `metadata.version` set and not a constraint (`^`, `~`, `>=`, etc.), use it
2. **Lock File**: If lock file exists with valid resolved version, use it
3. **Registry Query**: Query registry for latest matching constraint
4. **Fallback**: Return undefined (latest)

```typescript
async resolveVersion(
  ctx: LifecycleContext,
  lockFile?: FtkLockFile
): Promise<string | undefined> {
  // Priority 1: Explicit version (non-constraint)
  if (
    this.metadata.version &&
    this.metadata.version !== "latest" &&
    !this.metadata.version.match(/^[\^~><]/)
  ) {
    return this.metadata.version;
  }

  // Priority 2: Check lock file
  if (lockFile) {
    const serverLock = getServerLock(lockFile, this.metadata.id);
    if (serverLock) {
      const constraint = this.metadata.packageVersion || this.metadata.version || "latest";

      if (constraint === "latest" || satisfiesConstraint(serverLock.packageResolution, constraint)) {
        ctx.info(`Using locked version: ${serverLock.packageResolution}`);
        return serverLock.packageResolution;
      }

      ctx.warning(`Locked version ${serverLock.packageResolution} no longer satisfies constraint ${constraint}`);
    }
  }

  // Priority 3: Query registry for latest matching constraint
  const versionInfo = await fetchLatestVersion(packageName, registry);
  if (versionInfo.latestVersion) {
    const constraint = this.metadata.packageVersion || this.metadata.version || "latest";

    if (constraint !== "latest" && !satisfiesConstraint(versionInfo.latestVersion, constraint)) {
      ctx.warning(`Latest version ${versionInfo.latestVersion} does not satisfy ${constraint}`);
      return undefined;
    }

    return versionInfo.latestVersion;
  }

  // Priority 4: Fallback
  return undefined;
}
```

### Semver Constraint Support

Full support for semantic versioning constraints:

- **Caret (`^`)**: Compatible changes (^1.2.3 = >=1.2.3 <2.0.0)
- **Tilde (`~`)**: Patch-level changes (~1.2.3 = >=1.2.3 <1.3.0)
- **Exact**: Exact version match (1.2.3)
- **Comparison**: >= > <= < operators
- **Pre-release**: Handles pre-release versions (1.0.0-beta.1)

Implementation in `src/utils/semver.ts`:

```typescript
// Parse version string
parseVersion("1.2.3-beta.1"); // → { major: 1, minor: 2, patch: 3, prerelease: "beta.1" }

// Compare versions
compareVersions("1.2.3", "1.2.4"); // → -1 (v1 < v2)
compareVersions("2.0.0", "1.9.9"); // → 1 (v1 > v2)

// Check constraint satisfaction
satisfiesConstraint("1.2.5", "^1.2.0"); // → true (patch update OK)
satisfiesConstraint("2.0.0", "^1.2.0"); // → false (major change)
satisfiesConstraint("1.2.5", "~1.2.0"); // → true (patch update OK)
satisfiesConstraint("1.3.0", "~1.2.0"); // → false (minor change)

// Find latest satisfying version
findLatestSatisfying(["1.0.0", "1.1.0", "2.0.0"], "^1.0.0"); // → "1.1.0"
```

### Lock File Operations

Utility functions in `src/utils/lockfile.ts` (use camelCase in TypeScript, auto-converted to snake_case in YAML):

```typescript
// Read lock file (creates default if not found, converts YAML snake_case to camelCase)
const lockFile = await readLockFile(projectPath);

// Update server entry (TypeScript camelCase)
const updated = updateServerLock(lockFile, "sequentialthinking", {
  packageName: "@modelcontextprotocol/server-sequential-thinking",
  registry: "npm",
  packageConstraint: "0.3.2", // Exact version initially
  packageResolution: "0.3.2",
});

// Write lock file (converts camelCase to snake_case, updates timestamp automatically)
await writeLockFile(projectPath, updated);

// Get specific server lock (returns camelCase properties)
const serverLock = getServerLock(lockFile, "sequentialthinking");
console.log(serverLock.packageName); // camelCase in TypeScript
console.log(serverLock.packageResolution); // camelCase in TypeScript

// Remove server entry
const removed = removeServerLock(lockFile, "sequentialthinking");
```

### Integration with Install

Lock file automatically managed during installation:

```typescript
async install(ctx: LifecycleContext): Promise<InstallResult> {
  // Read existing lock file
  const projectPath = ctx.getProjectPath();
  const lockFile = await readLockFile(projectPath);

  // Resolve version (checks lock file, then queries registry)
  const resolvedVersion = await this.resolveVersion(ctx, lockFile);

  if (resolvedVersion) {
    ctx.info(`Using version: ${resolvedVersion}`);
  }

  // Update lock file with resolved version
  if (resolvedVersion && this.metadata.packageName && this.metadata.packageRegistry) {
    // Pin exact version initially (users can manually edit to add ^ or ~)
    const constraint = this.metadata.packageVersion || resolvedVersion;

    const updatedLockFile = updateServerLock(lockFile, this.metadata.id, {
      packageName: this.metadata.packageName, // camelCase in TypeScript
      registry: this.metadata.packageRegistry,
      packageConstraint: constraint, // camelCase in TypeScript
      packageResolution: resolvedVersion, // camelCase in TypeScript
    });

    await writeLockFile(projectPath, updatedLockFile);
    ctx.success(`Updated lock file: ${this.metadata.id}@${resolvedVersion}`);
  }

  // Generate config and return
  const mcpConfig = this.generateMcpConfig(secrets, resolvedVersion);
  return { success: true, mcpConfig };
}
```

### Team Collaboration Benefits

1. **Reproducible Installs**: All team members get same versions
2. **Constraint Flexibility**: Define acceptable version ranges, not just exact pins
3. **Update Control**: Explicit updates via re-running ftk init
4. **Audit Trail**: Lock file shows when versions were resolved
5. **Version Control**: Commit `.ftk-lock.yaml` for team sharing

### Future Enhancements

Potential improvements:

1. **Version Caching**: Cache registry responses for 24 hours to reduce network calls
2. **Offline Mode**: Pre-fetch and bundle versions for offline installation
3. **Version Notifications**: Alert when new versions available for installed servers
4. **Rollback Support**: Easy downgrade mechanism to previous working version
5. **Lock File Validation**: Verify lock file integrity and warn about drift

## observations

- [architecture] Dynamic version resolution queries package registries at install time #version-management
- [architecture] Lock file enables reproducible installations with semver constraints #team-collaboration
- [design-decision] Four-tier resolution priority: explicit pin → lock file → registry query → undefined #flexibility
- [design-decision] Lock file tracked in version control for team sharing #git-workflow
- [design-decision] Exact version pinning by default, manual editing for constraints #conservative-defaults
- [design-decision] YAML snake_case with TypeScript camelCase conversion layer #convention-adherence
- [implementation] Resource leak prevention requires consuming failed response bodies #deno-testing
- [implementation] Semver constraint resolution supports ^, ~, >=, >, <=, < operators #version-constraints
- [implementation] Lock file uses YAML snake_case, TypeScript uses camelCase with automatic conversion #naming-conventions
- [implementation] toYaml() and fromYaml() functions handle case conversion transparently #abstraction
- [performance] 200-400ms overhead per server acceptable for install-time operation #acceptable-latency
- [security] No authentication required for public packages on npm/PyPI #public-registries
- [testing] 8 package version tests + 10 lock file tests covering success and error paths #test-coverage
- [use-case] Eliminates manual version maintenance for developers #developer-experience
- [use-case] Constraint flexibility allows teams to define acceptable version ranges #version-policy
- [use-case] Users can manually edit lock file to add ^ or ~ for flexible constraints #user-control
- [limitation] Requires network access during ftk init for registry queries #network-dependency
- [limitation] Lock file only stores npm/PyPI packages, not custom commands #scope

## relations

- related-to: [[issue-6-pin-mcp-server-versions]]
- depends-on: [[mcp-server-lifecycle]]
- uses-technology: [deno, typescript, npm-registry, pypi, fetch-api, yaml, semver]
- implemented-in: [src/utils/package-version.ts, src/lib/base-server.ts, src/types/lifecycle.ts, src/types/lockfile.ts, src/utils/lockfile.ts, src/utils/semver.ts]
- tested-by: [src/utils/package-version_test.ts, src/utils/lockfile_test.ts]
