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
}
```

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

## Future Enhancements

Potential improvements:

1. **Version Caching**: Cache registry responses for 24 hours to reduce network calls
2. **Semver Constraints**: Support version ranges like \`"^1.0.0"\` or \`"~2.1.0"\`
3. **Offline Mode**: Pre-fetch and bundle versions for offline installation
4. **Version Notifications**: Alert when new versions available for installed servers
5. **Rollback Support**: Easy downgrade mechanism to previous working version
6. **Lock File**: Generate version lock file for reproducible installations

## observations

- [architecture] Dynamic version resolution queries package registries at install time #version-management
- [design-decision] Three-tier resolution priority: explicit pin → registry query → undefined #flexibility
- [implementation] Resource leak prevention requires consuming failed response bodies #deno-testing
- [performance] 200-400ms overhead per server acceptable for install-time operation #acceptable-latency
- [security] No authentication required for public packages on npm/PyPI #public-registries
- [testing] 8 comprehensive tests covering success and error paths #test-coverage
- [use-case] Eliminates manual version maintenance for developers #developer-experience
- [limitation] Requires network access during ftk init #network-dependency

## relations

- related-to: [[issue-6-pin-mcp-server-versions]]
- depends-on: [[mcp-server-lifecycle]]
- uses-technology: [deno, typescript, npm-registry, pypi, fetch-api]
- implemented-in: [src/utils/package-version.ts, src/lib/base-server.ts, src/types/lifecycle.ts]
- tested-by: [src/utils/package-version_test.ts]
