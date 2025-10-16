---
title: issue-6-pin-mcp-server-versions
type: note
permalink: plans/issue-6-pin-mcp-server-versions
tags:
- mcp-registry,versioning,reproducibility
---

# Issue 6: Pin MCP Server Versions

## Overview

Add version pinning support to ensure reproducible MCP server installations across environments.

## 📌 BACKLOG — Phase 1: Assess Current State

- [ ] Review existing `ServerMetadata.version` field usage
- [ ] Check current MCP config generation (npx, uvx, etc.)
- [ ] Identify which servers need version pinning
- [ ] Document current version-related behavior

## 📌 BACKLOG — Phase 2: Version Field Implementation

- [ ] Add `version` field to all server metadata (already exists in interface)
- [ ] Define version pinning strategy per package manager
  - npm: `@package@version` or `package@version`
  - Python/uvx: `package==version`
- [ ] Update `generateMcpConfig()` to use version when specified

## 📌 BACKLOG — Phase 3: Server Updates

- [ ] Update Sequential Thinking server with version
- [ ] Update Context7 server with version
- [ ] Update Exa server with version
- [ ] Update Basic Memory server with version
- [ ] Update Notion server with version

## 📌 BACKLOG — Phase 4: Documentation

- [ ] Document version pinning in CLAUDE.md
- [ ] Add version info to README server list
- [ ] Create version upgrade guide
- [ ] Add troubleshooting for version conflicts

## Implementation Strategy

**Version Syntax by Package Manager**:

- **npm/npx**: `npx -y package@version`
- **Python/uvx**: `uvx package==version`

**Server Metadata**:

```typescript
metadata: ServerMetadata = {
  id: "sequentialthinking",
  name: "Sequential Thinking",
  version: "0.3.0", // Pin to specific version
  // ...
};
```

**Config Generation**:

- If version specified: use exact version in command
- If no version: use latest (current behavior)
- Version goes in args, not env vars

## observations

- [fact] ServerMetadata.version field already exists in interface #already-available
- [design-decision] Version pinning optional, defaults to latest #backward-compatible
- [architecture] Version handling per package manager type #npm-vs-python
- [use-case] Reproducible installations for production deployments #stability

## relations

- issue-permalink: https://github.com/Spantree/fluent-toolkit/issues/6
- pr-permalink: https://github.com/Spantree/fluent-toolkit/pull/TBD
- relates-to: [[mcp-registry]], [[server-lifecycle]]
- uses-technology: [deno, typescript, npm, uvx]
- implemented-in: TBD
