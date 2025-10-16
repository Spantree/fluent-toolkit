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

## ✅ COMPLETED — Phase 1: Assess Current State

- [x] Review existing `ServerMetadata.version` field usage
- [x] Check current MCP config generation (npx, uvx, etc.)
- [x] Identify which servers need version pinning
- [x] Document current version-related behavior

## ✅ COMPLETED — Phase 2: Version Field Implementation

- [x] Add `version` field to all server metadata (already exists in interface)
- [x] Define version pinning strategy per package manager
  - npm: `@package@version` or `package@version`
  - Python/uvx: `package==version`
- [x] Update `generateMcpConfig()` to use version when specified

## ✅ COMPLETED — Phase 3: Server Updates

- [x] Update Sequential Thinking server with version
- [x] Update Context7 server with version
- [x] Update Exa server with version
- [x] Basic Memory uses custom command structure, no version needed
- [x] Notion server not on this branch (will be added in Issue #2)

## 📌 BACKLOG — Phase 4: Documentation

- [ ] Document version pinning in CLAUDE.md
- [ ] Add version info to README server list
- [ ] Create version upgrade guide
- [ ] Add troubleshooting for version conflicts

## Implementation Summary

**Core Changes** (`src/lib/utils/dotenv.ts`):

- Added optional `version` parameter to all config generation functions
- `createNpxConfig()`: Appends `@version` for npm packages
- `createUvxConfig()`: Appends `==version` for Python packages
- `createNpxConfigWithSecrets()` and `createUvxConfigWithSecrets()` updated

**Server Updates**:

- **Sequential Thinking**: `createNpxConfig(..., true, this.metadata.version)`
- **Context7**: `createNpxConfig(..., true, this.metadata.version)`
- **Exa**: `createUvxConfigWithSecrets(..., ".env.mcp.secrets", this.metadata.version)`
- **Basic Memory**: Uses custom command, no version parameter needed

**Version Syntax**:

- npm: `@modelcontextprotocol/server-sequential-thinking@1.0.0`
- Python: `mcp-server-exa==1.0.0`

**Backward Compatibility**:

- Version parameter is optional in all functions
- When version is undefined: uses latest (existing behavior)
- No breaking changes to existing code

## observations

- [fact] ServerMetadata.version field already exists in interface #already-available
- [design-decision] Version pinning optional, defaults to latest #backward-compatible
- [architecture] Version handling per package manager type #npm-vs-python
- [use-case] Reproducible installations for production deployments #stability
- [implementation] All servers already had version metadata, just not using it #quick-win
- [limitation] Basic Memory uses custom command structure, doesn't need version pinning #special-case

## relations

- issue-permalink: https://github.com/Spantree/fluent-toolkit/issues/6
- pr-permalink: https://github.com/Spantree/fluent-toolkit/pull/TBD
- relates-to: [[mcp-registry]], [[server-lifecycle]]
- uses-technology: [deno, typescript, npm, uvx]
- implemented-in: [src/lib/utils/dotenv.ts, registry/mcp-servers/*/index.ts]
